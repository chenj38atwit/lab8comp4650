// Official undergraduate grading scale, evaluated highest-to-lowest.
const GRADING_SCALE = [
  { min: 93, max: 100, letterGrade: 'A', performanceMeaning: 'Excellent / Outstanding', colorLabel: 'Dark Green' },
  { min: 90, max: 92, letterGrade: 'A-', performanceMeaning: 'Excellent', colorLabel: 'Green' },
  { min: 87, max: 89, letterGrade: 'B+', performanceMeaning: 'Very Good', colorLabel: 'Light Green' },
  { min: 83, max: 86, letterGrade: 'B', performanceMeaning: 'Good', colorLabel: 'Blue' },
  { min: 80, max: 82, letterGrade: 'B-', performanceMeaning: 'Above Average', colorLabel: 'Light Blue' },
  { min: 77, max: 79, letterGrade: 'C+', performanceMeaning: 'Satisfactory Plus', colorLabel: 'Yellow-Green' },
  { min: 73, max: 76, letterGrade: 'C', performanceMeaning: 'Satisfactory', colorLabel: 'Yellow' },
  { min: 70, max: 72, letterGrade: 'C-', performanceMeaning: 'Minimum Satisfactory', colorLabel: 'Orange' },
  { min: 67, max: 69, letterGrade: 'D+', performanceMeaning: 'Poor but Passing', colorLabel: 'Light Red' },
  { min: 60, max: 66, letterGrade: 'D', performanceMeaning: 'Minimum Passing', colorLabel: 'Red' },
  { min: 0, max: 59, letterGrade: 'F', performanceMeaning: 'Failing', colorLabel: 'Dark Red' },
];

// Hex values matching the suggested color labels, for frontend badges/charts.
const COLOR_HEX = {
  'Dark Green': '#1b5e20',
  'Green': '#2e7d32',
  'Light Green': '#66bb6a',
  'Blue': '#1565c0',
  'Light Blue': '#4fc3f7',
  'Yellow-Green': '#c0ca33',
  'Yellow': '#fdd835',
  'Orange': '#fb8c00',
  'Light Red': '#ef5350',
  'Red': '#e53935',
  'Dark Red': '#b71c1c',
};

function evaluateMarks(marks) {
  const numericMarks = Number(marks);
  if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
    throw new Error('Marks must be a number between 0 and 100.');
  }

  const band = GRADING_SCALE.find((b) => numericMarks >= b.min && numericMarks <= b.max);

  return {
    letterGrade: band.letterGrade,
    performanceMeaning: band.performanceMeaning,
    colorLabel: band.colorLabel,
    colorHex: COLOR_HEX[band.colorLabel],
    passFail: numericMarks >= 60 ? 'Pass' : 'Fail',
  };
}

module.exports = { GRADING_SCALE, COLOR_HEX, evaluateMarks };
