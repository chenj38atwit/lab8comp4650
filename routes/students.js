const express = require('express');
const Student = require('../models/Student');
const Major = require('../models/Major');
const validateStudent = require('../middleware/validateStudent');

const router = express.Router();

function formatMongooseError(err) {
  if (err.code === 11000) {
    return ['A record for this student, major, and course already exists.'];
  }
  if (err.name === 'ValidationError') {
    return Object.values(err.errors).map((e) => e.message);
  }
  return [err.message || 'Unexpected server error.'];
}

// GET /api/students - list with optional search/filter/sort.
router.get('/', async (req, res) => {
  const { search, major, course, grade, status, sortBy, order } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (major) query.major = major;
  if (course) query.course = course;
  if (grade) query.letterGrade = grade;
  if (status) query.passFail = status;

  const sortField = ['name', 'major', 'course', 'marks', 'letterGrade', 'createdAt'].includes(sortBy)
    ? sortBy
    : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const students = await Student.find(query).sort({ [sortField]: sortOrder });
  res.json({ success: true, count: students.length, data: students });
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, errors: ['Student record not found.'] });
  }
  res.json({ success: true, data: student });
});

// POST /api/students - create a new record.
router.post('/', validateStudent, async (req, res) => {
  const { name, major, course, marks } = req.body;
  try {
    const student = await Student.create({ name: name.trim(), major: major.trim(), course: course.trim(), marks });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, errors: formatMongooseError(err) });
  }
});

// PUT /api/students/:id - update an existing record.
router.put('/:id', validateStudent, async (req, res) => {
  const { name, major, course, marks } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, errors: ['Student record not found.'] });
    }
    student.name = name.trim();
    student.major = major.trim();
    student.course = course.trim();
    student.marks = marks;
    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, errors: formatMongooseError(err) });
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, errors: ['Student record not found.'] });
  }
  res.json({ success: true, data: student });
});

// POST /api/students/import - bulk import validated records (used by Excel/JSON import).
router.post('/import/bulk', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, errors: ['No records supplied for import.'] });
  }

  const majors = await Major.find();
  const majorMap = new Map(majors.map((m) => [m.name.toLowerCase(), m]));
  const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;

  const created = [];
  const failed = [];

  for (let i = 0; i < records.length; i += 1) {
    const row = records[i];
    const rowNum = i + 2; // account for header row in the source spreadsheet
    const name = String(row.Name || row.name || '').trim();
    const major = String(row.Major || row.major || '').trim();
    const course = String(row.Course || row.course || '').trim();
    const marks = Number(row.Marks ?? row.marks);

    const rowErrors = [];
    if (!name) rowErrors.push('Name is required.');
    else if (!NAME_PATTERN.test(name)) rowErrors.push('Name contains invalid characters.');
    if (!major) rowErrors.push('Major is required.');
    if (!course) rowErrors.push('Course is required.');
    if (Number.isNaN(marks) || marks < 0 || marks > 100) rowErrors.push('Marks must be a number between 0 and 100.');

    const majorDoc = majorMap.get(major.toLowerCase());
    if (major && !majorDoc) rowErrors.push(`Unknown major: ${major}.`);
    else if (majorDoc && course && !majorDoc.courses.includes(course)) {
      rowErrors.push(`Course "${course}" is not offered under major "${major}".`);
    }

    if (rowErrors.length > 0) {
      failed.push({ row: rowNum, data: row, errors: rowErrors });
      continue;
    }

    try {
      const student = await Student.create({ name, major, course, marks });
      created.push(student);
    } catch (err) {
      failed.push({ row: rowNum, data: row, errors: formatMongooseError(err) });
    }
  }

  res.status(207).json({
    success: true,
    createdCount: created.length,
    failedCount: failed.length,
    created,
    failed,
  });
});

module.exports = router;
