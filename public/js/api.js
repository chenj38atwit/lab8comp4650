const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const errors = (body && body.errors) || ['Request failed.'];
    throw new Error(errors.join(' '));
  }

  return body;
}

const Api = {
  getMajors: () => apiRequest('/majors'),
  getStats: () => apiRequest('/stats'),
  getStudents: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiRequest(`/students${suffix}`);
  },
  createStudent: (data) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
};

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('toast-error', isError);
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function showAlert(message, type = 'error') {
  const container = document.getElementById('alertContainer');
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type === 'error' ? 'error' : 'success'}">${escapeHtml(message)}</div>`;
}

function clearAlert() {
  const container = document.getElementById('alertContainer');
  if (container) container.innerHTML = '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
