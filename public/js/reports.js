async function loadSnapshot() {
  try {
    const { data: stats } = await Api.getStats();
    document.getElementById('rTotalStudents').textContent = stats.totalStudents;
    document.getElementById('rAverageMarks').textContent = stats.averageMarks;
    document.getElementById('rPassing').textContent = stats.passingCount;
    document.getElementById('rFailing').textContent = stats.failingCount;
  } catch (err) {
    showAlert(`Failed to load snapshot: ${err.message}`);
  }
}

async function downloadPdfReport() {
  const btn = document.getElementById('downloadPdfBtn');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    const res = await fetch('/api/reports/pdf');
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error((body && body.errors && body.errors.join(' ')) || 'Failed to generate report.');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-performance-report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Report downloaded.');
  } catch (err) {
    showAlert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download PDF Report';
  }
}

document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdfReport);

loadSnapshot();
