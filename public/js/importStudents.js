// Parses a CSV file and imports it via POST /api/students/import/bulk.
// Only the Name, Major/Program of Study, Course, and Marks columns are read; all others are ignored.

const CSV_HEADER_ALIASES = {
  name: ['name', 'fullname', 'studentname'],
  major: ['major', 'program', 'programofstudy', 'majorprogramofstudy', 'majorprogram'],
  course: ['course'],
  marks: ['marks', 'mark', 'score'],
};

function normalizeHeader(header) {
  return String(header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function mapCsvToRecords(rows) {
  if (rows.length === 0) {
    throw new Error('The CSV file is empty.');
  }

  const headerRow = rows[0];
  const columnIndex = {};
  headerRow.forEach((header, idx) => {
    const normalized = normalizeHeader(header);
    Object.entries(CSV_HEADER_ALIASES).forEach(([field, aliases]) => {
      if (aliases.includes(normalized) && !(field in columnIndex)) {
        columnIndex[field] = idx;
      }
    });
  });

  const missing = ['name', 'major', 'course', 'marks'].filter((field) => !(field in columnIndex));
  if (missing.length > 0) {
    throw new Error(`CSV is missing required column(s): ${missing.join(', ')}.`);
  }

  return rows.slice(1).map((row) => ({
    name: (row[columnIndex.name] || '').trim(),
    major: (row[columnIndex.major] || '').trim(),
    course: (row[columnIndex.course] || '').trim(),
    marks: (row[columnIndex.marks] || '').trim(),
  }));
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsText(file);
  });
}

function renderImportSummary(result) {
  const summary = document.getElementById('importSummary');
  const failedList = result.failed
    .map((f) => `<li>Row ${f.row}: ${escapeHtml(f.errors.join(' '))}</li>`)
    .join('');

  summary.innerHTML = `
    <div class="alert alert-${result.failedCount > 0 ? 'error' : 'success'}">
      ${result.createdCount} record(s) imported successfully.${result.failedCount > 0 ? ` ${result.failedCount} record(s) failed.` : ''}
    </div>
    ${failedList ? `<ul>${failedList}</ul>` : ''}
  `;
}

function openImportModal() {
  document.getElementById('csvFileInput').value = '';
  document.getElementById('csvFileError').textContent = '';
  document.getElementById('importSummary').innerHTML = '';
  document.getElementById('importModalOverlay').classList.remove('hidden');
}

function closeImportModal() {
  document.getElementById('importModalOverlay').classList.add('hidden');
}

async function handleImportSubmit() {
  const fileInput = document.getElementById('csvFileInput');
  const fileError = document.getElementById('csvFileError');
  const importBtn = document.getElementById('importSubmitBtn');
  fileError.textContent = '';
  document.getElementById('importSummary').innerHTML = '';

  const file = fileInput.files[0];
  if (!file) {
    fileError.textContent = 'Please choose a CSV file.';
    return;
  }

  importBtn.disabled = true;
  try {
    const text = await readFileAsText(file);
    const records = mapCsvToRecords(parseCsvText(text));
    if (records.length === 0) {
      throw new Error('The CSV file has no data rows.');
    }

    const result = await Api.importStudents(records);
    renderImportSummary(result);
    if (result.createdCount > 0) {
      showToast(`${result.createdCount} student(s) imported successfully.`);
    }
  } catch (err) {
    fileError.textContent = err.message;
  } finally {
    importBtn.disabled = false;
  }
}

document.getElementById('openImportBtn').addEventListener('click', openImportModal);
document.getElementById('importCancelBtn').addEventListener('click', closeImportModal);
document.getElementById('importSubmitBtn').addEventListener('click', handleImportSubmit);
