const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;

let majorsCache = [];

async function loadMajorOptions() {
  const majorSelect = document.getElementById('major');
  try {
    const { data } = await Api.getMajors();
    majorsCache = data;
    majorSelect.innerHTML =
      '<option value="">Select a major&hellip;</option>' +
      data.map((m) => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');
  } catch (err) {
    showAlert(`Failed to load majors: ${err.message}`);
  }
}

function updateCourseOptions() {
  const majorSelect = document.getElementById('major');
  const courseSelect = document.getElementById('course');
  const selectedMajor = majorsCache.find((m) => m.name === majorSelect.value);

  if (!selectedMajor) {
    courseSelect.innerHTML = '<option value="">Select a major first&hellip;</option>';
    courseSelect.disabled = true;
    return;
  }

  courseSelect.disabled = false;
  courseSelect.innerHTML =
    '<option value="">Select a course&hellip;</option>' +
    selectedMajor.courses.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
}

function validateForm() {
  clearFieldErrors();
  let valid = true;

  const name = document.getElementById('name').value.trim();
  const major = document.getElementById('major').value;
  const course = document.getElementById('course').value;
  const marks = document.getElementById('marks').value;

  if (!name) {
    document.getElementById('nameError').textContent = 'Student name cannot be empty.';
    valid = false;
  } else if (!NAME_PATTERN.test(name)) {
    document.getElementById('nameError').textContent = 'Name must not contain numbers or unsupported symbols.';
    valid = false;
  }

  if (!major) {
    document.getElementById('majorError').textContent = 'Please select a major.';
    valid = false;
  }

  if (!course) {
    document.getElementById('courseError').textContent = 'Please select a course.';
    valid = false;
  }

  if (marks === '') {
    document.getElementById('marksError').textContent = 'Marks are required.';
    valid = false;
  } else if (Number.isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > 100) {
    document.getElementById('marksError').textContent = 'Marks must be a number between 0 and 100.';
    valid = false;
  }

  return valid;
}

function updatePreview() {
  const marks = document.getElementById('marks').value;
  const previewCard = document.getElementById('previewCard');
  const result = evaluateMarksClient(marks);

  if (!result) {
    previewCard.hidden = true;
    return;
  }

  previewCard.hidden = false;
  document.getElementById('previewBadge').innerHTML =
    `<span class="badge" style="background:${result.colorHex}">${result.letterGrade}</span>`;
  document.getElementById('previewMeaning').textContent = result.performanceMeaning;
  document.getElementById('previewStatus').innerHTML =
    `<span class="status-pill ${result.passFail === 'Pass' ? 'status-pass' : 'status-fail'}">${result.passFail}</span>`;
}

async function handleSubmit(event) {
  event.preventDefault();
  clearAlert();

  if (!validateForm()) return;

  const payload = {
    name: document.getElementById('name').value.trim(),
    major: document.getElementById('major').value,
    course: document.getElementById('course').value,
    marks: Number(document.getElementById('marks').value),
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    await Api.createStudent(payload);
    showToast(`${payload.name} added successfully.`);
    event.target.reset();
    updateCourseOptions();
    document.getElementById('previewCard').hidden = true;
  } catch (err) {
    showAlert(err.message);
  } finally {
    submitBtn.disabled = false;
  }
}

document.getElementById('major').addEventListener('change', updateCourseOptions);
document.getElementById('marks').addEventListener('input', updatePreview);
document.getElementById('addStudentForm').addEventListener('submit', handleSubmit);
document.getElementById('resetBtn').addEventListener('click', () => {
  clearFieldErrors();
  clearAlert();
  setTimeout(() => {
    updateCourseOptions();
    document.getElementById('previewCard').hidden = true;
  }, 0);
});

loadMajorOptions();
