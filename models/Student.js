const mongoose = require('mongoose');
const { evaluateMarks } = require('../utils/grading');

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
      match: [NAME_PATTERN, 'Student name must not contain numbers or unsupported symbols.'],
    },
    major: {
      type: String,
      required: [true, 'Major is required.'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required.'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required.'],
      min: [0, 'Marks must be between 0 and 100.'],
      max: [100, 'Marks must be between 0 and 100.'],
    },
    letterGrade: { type: String },
    performanceMeaning: { type: String },
    colorLabel: { type: String },
    colorHex: { type: String },
    passFail: { type: String, enum: ['Pass', 'Fail'] },
  },
  { timestamps: true }
);

// Same student cannot have two records for the same course.
studentSchema.index({ name: 1, major: 1, course: 1 }, { unique: true });

studentSchema.pre('validate', function computeGrade(next) {
  if (this.marks !== undefined && this.marks !== null) {
    try {
      const { letterGrade, performanceMeaning, colorLabel, colorHex, passFail } = evaluateMarks(this.marks);
      this.letterGrade = letterGrade;
      this.performanceMeaning = performanceMeaning;
      this.colorLabel = colorLabel;
      this.colorHex = colorHex;
      this.passFail = passFail;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
