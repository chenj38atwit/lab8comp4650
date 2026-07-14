const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

async function computeStats() {
  const students = await Student.find().sort({ marks: -1 });

  const totalStudents = students.length;
  const totalMarks = students.reduce((sum, s) => sum + s.marks, 0);
  const averageMarks = totalStudents > 0 ? totalMarks / totalStudents : 0;
  const passing = students.filter((s) => s.passFail === 'Pass');
  const failing = students.filter((s) => s.passFail === 'Fail');

  const gradeDistribution = students.reduce((acc, s) => {
    acc[s.letterGrade] = (acc[s.letterGrade] || 0) + 1;
    return acc;
  }, {});

  return {
    totalStudents,
    totalMarks,
    averageMarks: Number(averageMarks.toFixed(2)),
    highestStudent: students[0] || null,
    lowestStudent: totalStudents > 0 ? students[totalStudents - 1] : null,
    passingCount: passing.length,
    failingCount: failing.length,
    gradeDistribution,
  };
}

// GET /api/stats - class-level performance statistics.
router.get('/', async (req, res) => {
  const stats = await computeStats();
  res.json({ success: true, data: stats });
});

module.exports = router;
module.exports.computeStats = computeStats;
