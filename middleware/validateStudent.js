const Major = require('../models/Major');

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;

async function validateStudent(req, res, next) {
  const { name, major, course, marks } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Student name cannot be empty.');
  } else if (!NAME_PATTERN.test(name.trim())) {
    errors.push('Student name must not contain numbers or unsupported symbols.');
  }

  if (!major || !major.trim()) {
    errors.push('Major must be selected.');
  }

  if (!course || !course.trim()) {
    errors.push('Course must be selected.');
  }

  if (marks === undefined || marks === null || marks === '') {
    errors.push('Marks are required.');
  } else if (Number.isNaN(Number(marks))) {
    errors.push('Marks must be numeric.');
  } else if (Number(marks) < 0 || Number(marks) > 100) {
    errors.push('Marks must be between 0 and 100.');
  }

  // Only check the major/course relationship once the basic fields are valid.
  if (major && major.trim() && course && course.trim() && errors.length === 0) {
    const majorDoc = await Major.findOne({ name: major.trim() });
    if (!majorDoc) {
      errors.push(`Unknown major: ${major}.`);
    } else if (!majorDoc.courses.includes(course.trim())) {
      errors.push(`Course "${course}" is not offered under major "${major}".`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = validateStudent;
