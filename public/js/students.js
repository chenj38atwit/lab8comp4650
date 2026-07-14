const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;

let majorsCache = [];
let currentSort = { field: 'createdAt', order: 'desc' };
let pendingDeleteId = null;

const colorHexByGrade = {
  A: '#1b5e20', 'A-': '#2e7d32', 'B+': '#66bb6a', B: '#1565c0', 'B-': '#4fc3f7',
  'C+': '#c0ca33', C: '#fdd835', 'C-': '#fb8c00', 'D+': '#ef5350', D: '#e53935', F: '#b71c1c',
};

async function loadMajors() {
  const { data } = await Api.getMajors();
  majorsCache = data;

  const majorFilter = document.getElementById('filterMajor');
  majorFilter.innerHTML =
    '<option value="">All majors</option>' +
    data.map((m) => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');

  const editMajor = document.getElementById('editMajor');
  editMajor.innerHTML = data.map((m) => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>`).join('');
}

function updateCourseFilterOptions() {
  const majorFilter = document.getElementById('filterMajor');
  const courseFilter = document.getElementById('filterCourse');
  const selected = majorsCache.find((m) => m.name === majorFilter.value);

  courseFilter.innerHTML =
    '<option value="">All courses</option>' +
    (selected ? selected.courses : [...new Set(majorsCache.flatMap((m) => m.courses))])
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
      .join('');
}

function updateEditCourseOptions(preSelectCourse) {
  const editMajor = document.getElementById('editMajor');
  const editCourse = document.getElementById('editCourse');
  const selected = majorsCache.find((m) => m.name === editMajor.value);

  editCourse.innerHTML = (selected ? selected.courses : [])
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('');

  if (preSelectCourse && selected && selected.courses.includes(preSelectCourse)) {
    editCourse.value = preSelectCourse;
  }
}

function getFilters() {
  return {
    search: document.getElementById('searchInput').value.trim(),
    major: document.getElementById('filterMajor').value,
    course: document.getElementById('filterCourse').value,
    grade: document.getElementById('filterGrade').value,
    status: document.getElementById('filterStatus').value,
    sortBy: currentSort.field,
    order: currentSort.order,
  };
}

async function loadStudents() {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Loading records&hellip;</td></tr>';

  try {
    const { data } = await Api.getStudents(getFilters());
    renderStudents(data);
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Failed to load records: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderStudents(students) {
  const tbody = document.getElementById('studentTableBody');

  if (students.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No student records match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = students
    .map(
      (s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.major)}</td>
        <td>${escapeHtml(s.course)}</td>
        <td>${s.marks}</td>
        <td><span class="badge" style="background:${colorHexByGrade[s.letterGrade] || '#666'}">${s.letterGrade}</span></td>
        <td>${escapeHtml(s.performanceMeaning)}</td>
        <td><span class="status-pill ${s.passFail === 'Pass' ? 'status-pass' : 'status-fail'}">${s.passFail}</span></td>
        <td>
          <button class="btn btn-secondary btn-small" data-action="edit" data-id="${s._id}">Edit</button>
          <button class="btn btn-danger btn-small" data-action="delete" data-id="${s._id}" data-name="${escapeHtml(s.name)}">Delete</button>
        </td>
      </tr>`
    )
    .join('');

  tbody.querySelectorAll('[data-action="edit"]').forEach((btn) => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
  tbody.querySelectorAll('[data-action="delete"]').forEach((btn) =>
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name))
  );
}

async function openEditModal(id) {
  try {
    const { data: s } = await apiRequest(`/students/${id}`);
    document.getElementById('editId').value = s._id;
    document.getElementById('editName').value = s.name;
    document.getElementById('editMajor').value = s.major;
    updateEditCourseOptions(s.course);
    document.getElementById('editMarks').value = s.marks;
    document.querySelectorAll('#editForm .field-error').forEach((el) => (el.textContent = ''));
    document.getElementById('editModalOverlay').classList.remove('hidden');
  } catch (err) {
    showAlert(`Failed to load record: ${err.message}`);
  }
}

function closeEditModal() {
  document.getElementById('editModalOverlay').classList.add('hidden');
}

function validateEditForm() {
  document.querySelectorAll('#editForm .field-error').forEach((el) => (el.textContent = ''));
  let valid = true;

  const name = document.getElementById('editName').value.trim();
  const major = document.getElementById('editMajor').value;
  const course = document.getElementById('editCourse').value;
  const marks = document.getElementById('editMarks').value;

  if (!name) {
    document.getElementById('editNameError').textContent = 'Student name cannot be empty.';
    valid = false;
  } else if (!NAME_PATTERN.test(name)) {
    document.getElementById('editNameError').textContent = 'Name must not contain numbers or unsupported symbols.';
    valid = false;
  }
  if (!major) {
    document.getElementById('editMajorError').textContent = 'Please select a major.';
    valid = false;
  }
  if (!course) {
    document.getElementById('editCourseError').textContent = 'Please select a course.';
    valid = false;
  }
  if (marks === '' || Number.isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > 100) {
    document.getElementById('editMarksError').textContent = 'Marks must be a number between 0 and 100.';
    valid = false;
  }

  return valid;
}

async function handleEditSubmit(event) {
  event.preventDefault();
  if (!validateEditForm()) return;

  const id = document.getElementById('editId').value;
  const payload = {
    name: document.getElementById('editName').value.trim(),
    major: document.getElementById('editMajor').value,
    course: document.getElementById('editCourse').value,
    marks: Number(document.getElementById('editMarks').value),
  };

  try {
    await Api.updateStudent(id, payload);
    closeEditModal();
    showToast(`${payload.name}'s record was updated.`);
    loadStudents();
  } catch (err) {
    showAlert(err.message);
    closeEditModal();
  }
}

function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('deleteStudentName').textContent = name;
  document.getElementById('deleteModalOverlay').classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('deleteModalOverlay').classList.add('hidden');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  try {
    await Api.deleteStudent(pendingDeleteId);
    showToast('Student record deleted.');
    closeDeleteModal();
    loadStudents();
  } catch (err) {
    showAlert(err.message);
    closeDeleteModal();
  }
}

function setupSortHeaders() {
  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (currentSort.field === field) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort = { field, order: 'asc' };
      }
      loadStudents();
    });
  });
}

let searchDebounce;
function debouncedLoad() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadStudents, 300);
}

document.getElementById('searchInput').addEventListener('input', debouncedLoad);
document.getElementById('filterMajor').addEventListener('change', () => {
  updateCourseFilterOptions();
  loadStudents();
});
document.getElementById('filterCourse').addEventListener('change', loadStudents);
document.getElementById('filterGrade').addEventListener('change', loadStudents);
document.getElementById('filterStatus').addEventListener('change', loadStudents);
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterMajor').value = '';
  document.getElementById('filterCourse').value = '';
  document.getElementById('filterGrade').value = '';
  document.getElementById('filterStatus').value = '';
  updateCourseFilterOptions();
  loadStudents();
});

document.getElementById('editMajor').addEventListener('change', () => updateEditCourseOptions());
document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);

document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);
document.getElementById('deleteConfirmBtn').addEventListener('click', confirmDelete);

setupSortHeaders();
(async function init() {
  await loadMajors();
  updateCourseFilterOptions();
  await loadStudents();
})();
