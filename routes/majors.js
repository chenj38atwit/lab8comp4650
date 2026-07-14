const express = require('express');
const Major = require('../models/Major');

const router = express.Router();

// GET /api/majors - list all majors with their courses, for dynamic dropdowns.
router.get('/', async (req, res) => {
  const majors = await Major.find().sort({ name: 1 });
  res.json({ success: true, data: majors });
});

module.exports = router;
