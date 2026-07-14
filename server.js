require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const majorsRouter = require('./routes/majors');
const studentsRouter = require('./routes/students');
const statsRouter = require('./routes/stats');
const reportsRouter = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/majors', majorsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/reports', reportsRouter);

// Centralized error handler for anything that slips past route-level try/catch.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, errors: ['Internal server error.'] });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
