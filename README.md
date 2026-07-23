# Student Performance Management System

## Description

A full-stack academic records dashboard for managing student performance. It stores student records in MongoDB, automatically computes letter grades and pass/fail status from marks using the university's undergraduate grading scale, and reports class-level statistics through a browser dashboard, a searchable/sortable records table, and a downloadable PDF report.

## Technologies Used

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose (ODM)
- **Other libraries:** `cors`, `dotenv`, `pdfkit` (PDF report generation), `nodemon` (dev auto-reload)

## Installation Instructions

1. Clone the repository and move into the project directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and adjust values if needed:
   ```
   cp .env.example .env
   ```
   This sets `PORT` (defaults to `5000`) and `MONGODB_URI` (defaults to a local MongoDB instance).
4. Seed the example majors and courses (required before adding students, since the Add Student form loads majors/courses from the database):
   ```
   npm run seed
   ```

## How to Run the Backend Server

- Start the server normally:
  ```
  npm start
  ```
- Start with auto-reload during development:
  ```
  npm run dev
  ```
- Once running, open `http://localhost:5000` (or the port set in `.env`) in your browser. The Express server also serves the static frontend from the `public/` folder.

## How to Connect to MongoDB

1. Make sure a MongoDB instance is available — either running locally or hosted on MongoDB Atlas.
2. Set `MONGODB_URI` in your `.env` file to the connection string:
   - Local example: `mongodb://127.0.0.1:27017/student_performance_db`
   - Atlas example: `mongodb+srv://<user>:<password>@<cluster-url>/student_performance_db`
3. The connection is established in `config/db.js` via Mongoose when the server starts (`server.js`). If the connection fails, the server logs the error and exits rather than starting without a database.

## How to Use the Application

- **Dashboard** (`/index.html`): View live class-wide statistics — total students, total/average marks, pass/fail counts and percentages, the highest/lowest performer, and the grade distribution.
- **Add Student** (`/add.html`): Fill in a student's name, major, and course (course list updates based on the selected major), and marks. A live grade preview shows the resulting letter grade before submitting.
- **Student Records** (`/students.html`): Search by name and filter by major, course, grade, or pass/fail status. Click column headers to sort. Edit or delete existing records directly from the table (delete requires confirmation).
- **Reports** (`/reports.html`): Download a PDF report containing every student record along with class statistics.

## Main Features Implemented

- Dashboard with live class statistics and grade distribution.
- Full CRUD for student records (create, read, update, delete) via a REST API and matching UI.
- Server-side grade computation: letter grade, performance meaning, color label, and pass/fail status are always derived from marks so they can never drift out of sync with the underlying data.
- Search, filter (by major, course, grade, pass/fail), and sort on the Student Records page.
- Bulk import endpoint (`POST /api/students/import/bulk`) that validates each row independently and reports per-row success/failure.
- Downloadable PDF class report.
- Client- and server-side validation, with duplicate (name + major + course) records rejected.
- Majors and their course lists are stored in the database and seeded via `seed/seedMajors.js`, so new programs can be added without code changes.

### Grading Scale

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

### API Overview

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

## Known Issues or Limitations

- No authentication or authorization — anyone with access to the server can view, add, edit, or delete records.
- The bulk import endpoint (`POST /api/students/import/bulk`) exists on the backend, but there is no corresponding file-upload UI in the frontend yet; it must be called directly (e.g. via a script or API client).
- Majors and courses can only be added or changed by editing `seed/seedMajors.js` and re-running `npm run seed` — there is no admin UI for managing them.
- No automated test suite is included.
- The app assumes a single class/dataset; there is no multi-class, multi-term, or multi-user separation of records.
