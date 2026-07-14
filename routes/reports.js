const express = require('express');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const { computeStats } = require('./stats');

const router = express.Router();

// GET /api/reports/pdf - streams a class performance report as a PDF.
router.get('/pdf', async (req, res) => {
  const [students, stats] = await Promise.all([Student.find().sort({ name: 1 }), computeStats()]);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="student-performance-report.pdf"');

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(18).font('Helvetica-Bold').text('Student Performance Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#555').text(`Date generated: ${new Date().toLocaleString()}`, {
    align: 'center',
  });
  doc.fillColor('#000');
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').text('Class Statistics');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Students: ${stats.totalStudents}`);
  doc.text(`Total Marks: ${stats.totalMarks}`);
  doc.text(`Average Marks: ${stats.averageMarks}`);
  doc.text(`Highest-Performing Student: ${stats.highestStudent ? `${stats.highestStudent.name} (${stats.highestStudent.marks})` : 'N/A'}`);
  doc.text(`Lowest-Performing Student: ${stats.lowestStudent ? `${stats.lowestStudent.name} (${stats.lowestStudent.marks})` : 'N/A'}`);
  doc.text(`Passing Students: ${stats.passingCount}`);
  doc.text(`Failing Students: ${stats.failingCount}`);
  doc.text(`Grade Distribution: ${Object.entries(stats.gradeDistribution).map(([g, c]) => `${g}: ${c}`).join(', ') || 'N/A'}`);
  doc.moveDown(1);

  doc.fontSize(13).font('Helvetica-Bold').text('Student Records');
  doc.moveDown(0.5);

  const columns = [
    { label: 'Name', width: 100 },
    { label: 'Major', width: 100 },
    { label: 'Course', width: 100 },
    { label: 'Marks', width: 45 },
    { label: 'Grade', width: 40 },
    { label: 'Status', width: 45 },
  ];
  const startX = doc.page.margins.left;
  let y = doc.y;

  function drawRow(values, isHeader = false) {
    let x = startX;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    values.forEach((val, i) => {
      doc.text(String(val), x, y, { width: columns[i].width, ellipsis: true });
      x += columns[i].width;
    });
    y += 18;
    if (y > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  }

  drawRow(columns.map((c) => c.label), true);
  doc.moveTo(startX, y - 4).lineTo(startX + columns.reduce((s, c) => s + c.width, 0), y - 4).stroke();

  students.forEach((s) => {
    drawRow([s.name, s.major, s.course, s.marks, s.letterGrade, s.passFail]);
  });

  doc.end();
});

module.exports = router;
