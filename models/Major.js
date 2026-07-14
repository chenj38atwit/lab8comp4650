const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    courses: {
      type: [String],
      default: [],
      validate: {
        validator: (list) => Array.isArray(list) && list.length > 0,
        message: 'A major must have at least one course.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Major', majorSchema);
