// Client-side mirror of utils/grading.js, used only for instant form previews.
// The server is the source of truth and recalculates on every save.
const GRADING_SCALE = [
  { min: 93, max: 100, letterGrade: 'A', performanceMeaning: 'Excellent / Outstanding', colorHex: '#1b5e20' },
  { min: 90, max: 92, letterGrade: 'A-', performanceMeaning: 'Excellent', colorHex: '#2e7d32' },
  { min: 87, max: 89, letterGrade: 'B+', performanceMeaning: 'Very Good', colorHex: '#66bb6a' },
  { min: 83, max: 86, letterGrade: 'B', performanceMeaning: 'Good', colorHex: '#1565c0' },
  { min: 80, max: 82, letterGrade: 'B-', performanceMeaning: 'Above Average', colorHex: '#4fc3f7' },
  { min: 77, max: 79, letterGrade: 'C+', performanceMeaning: 'Satisfactory Plus', colorHex: '#c0ca33' },
  { min: 73, max: 76, letterGrade: 'C', performanceMeaning: 'Satisfactory', colorHex: '#fdd835' },
  { min: 70, max: 72, letterGrade: 'C-', performanceMeaning: 'Minimum Satisfactory', colorHex: '#fb8c00' },
  { min: 67, max: 69, letterGrade: 'D+', performanceMeaning: 'Poor but Passing', colorHex: '#ef5350' },
  { min: 60, max: 66, letterGrade: 'D', performanceMeaning: 'Minimum Passing', colorHex: '#e53935' },
  { min: 0, max: 59, letterGrade: 'F', performanceMeaning: 'Failing', colorHex: '#b71c1c' },
];

function evaluateMarksClient(marks) {
  const numericMarks = Number(marks);
  if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) return null;
  const band = GRADING_SCALE.find((b) => numericMarks >= b.min && numericMarks <= b.max);
  return {
    letterGrade: band.letterGrade,
    performanceMeaning: band.performanceMeaning,
    colorHex: band.colorHex,
    passFail: numericMarks >= 60 ? 'Pass' : 'Fail',
  };
}
