require('dotenv').config();
const connectDB = require('../config/db');
const Major = require('../models/Major');

const MAJORS = [
  {
    name: 'Computer Science',
    courses: ['Web Development', 'Data Structures', 'Database Systems'],
  },
  {
    name: 'Information Technology',
    courses: ['Networking', 'Cloud Computing', 'System Administration'],
  },
  {
    name: 'Cybersecurity',
    courses: ['Ethical Hacking', 'Secure Software Development', 'Digital Forensics'],
  },
  {
    name: 'Data Science',
    courses: ['Data Analytics', 'Machine Learning', 'Statistics'],
  },
  {
    name: 'Software Engineering',
    courses: ['Software Design', 'Testing', 'Agile Development'],
  },
];

async function seed() {
  await connectDB();

  for (const major of MAJORS) {
    await Major.findOneAndUpdate({ name: major.name }, major, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  console.log(`Seeded ${MAJORS.length} majors.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
