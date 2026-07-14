# Student Performance Management System

A full-stack academic records dashboard built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB. It stores student records, calculates letter grades using the university's undergraduate grading scale, and reports class-level statistics.

## Features

- **Dashboard** — total students, total/average marks, pass/fail counts, highest/lowest performer, grade distribution.
- **Student Records** — searchable, filterable (major, course, grade, pass/fail), sortable table with edit and delete (with confirmation).
- **Add Student** — form with dynamic course lists per major, live grade preview, client + server validation.
- **Reports** — downloadable PDF report with every record and class statistics.
- Grades, performance meaning, color label, and pass/fail status are always computed server-side from marks, so they can never drift out of sync.

## Grading Scale

| Marks | Grade | Meaning | Color |
|---|---|---|---|
| 93–100 | A | Excellent / Outstanding | Dark Green |
| 90–92 | A- | Excellent | Green |
| 87–89 | B+ | Very Good | Light Green |
| 83–86 | B | Good | Blue |
| 80–82 | B- | Above Average | Light Blue |
| 77–79 | C+ | Satisfactory Plus | Yellow-Green |
| 73–76 | C | Satisfactory | Yellow |
| 70–72 | C- | Minimum Satisfactory | Orange |
| 67–69 | D+ | Poor but Passing | Light Red |
| 60–66 | D | Minimum Passing | Red |
| < 60 | F | Failing | Dark Red |

Pass = marks ≥ 60, Fail = marks < 60.

## Project Structure

```
├── server.js               # Express app entry point
├── config/db.js            # MongoDB connection
├── models/                 # Mongoose schemas (Student, Major)
├── middleware/              # Request validation
├── routes/                  # REST API: students, majors, stats, reports
├── utils/grading.js         # Single source of truth for grade calculation
├── seed/seedMajors.js       # Seeds example majors/courses
└── public/                  # Frontend (HTML, CSS, vanilla JS)
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and set `MONGODB_URI` (defaults to a local MongoDB instance):
   ```
   cp .env.example .env
   ```
3. Make sure MongoDB is running locally (or point `MONGODB_URI` at an Atlas cluster).
4. Seed the example majors and courses:
   ```
   npm run seed
   ```
5. Start the server:
   ```
   npm start
   ```
   or, for auto-reload during development:
   ```
   npm run dev
   ```
6. Open `http://localhost:5000` in your browser.

## API Overview

| Method | Route | Description |
|---|---|---|
| GET | `/api/majors` | List majors and their courses |
| GET | `/api/students` | List students (`search`, `major`, `course`, `grade`, `status`, `sortBy`, `order` query params) |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create a student record |
| PUT | `/api/students/:id` | Update a student record |
| DELETE | `/api/students/:id` | Delete a student record |
| POST | `/api/students/import/bulk` | Bulk import records (`{ records: [{Name, Major, Course, Marks}] }`), validates each row |
| GET | `/api/stats` | Class-level statistics |
| GET | `/api/reports/pdf` | Download the PDF performance report |

## Validation

- Name: required, letters/spaces/hyphens/apostrophes only.
- Major and course: required, and the course must belong to the selected major.
- Marks: required, numeric, 0–100.
- Duplicate (name + major + course) records are rejected with a clear error.
- All rules are enforced on both the frontend (instant feedback) and the backend (source of truth).

## Adding Majors/Courses

Majors and their course lists live in the `majors` collection (seeded by `seed/seedMajors.js`). Edit that file and re-run `npm run seed` to add new programs — the Add Student and edit forms pick up new majors/courses automatically via `GET /api/majors`.
