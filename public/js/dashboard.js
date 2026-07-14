async function loadDashboard() {
  try {
    const { data: stats } = await Api.getStats();

    document.getElementById('statTotalStudents').textContent = stats.totalStudents;
    document.getElementById('statAverageMarks').textContent = stats.averageMarks;
    document.getElementById('statTotalMarks').textContent = stats.totalMarks;
    document.getElementById('statPassing').textContent = stats.passingCount;
    document.getElementById('statFailing').textContent = stats.failingCount;

    const pct = (n) => (stats.totalStudents > 0 ? `${((n / stats.totalStudents) * 100).toFixed(1)}% of class` : '');
    document.getElementById('statPassingPct').textContent = pct(stats.passingCount);
    document.getElementById('statFailingPct').textContent = pct(stats.failingCount);

    document.getElementById('statHighest').textContent = stats.highestStudent
      ? `${stats.highestStudent.name} (${stats.highestStudent.marks} - ${stats.highestStudent.letterGrade})`
      : 'No records yet';
    document.getElementById('statLowest').textContent = stats.lowestStudent
      ? `${stats.lowestStudent.name} (${stats.lowestStudent.marks} - ${stats.lowestStudent.letterGrade})`
      : 'No records yet';

    renderGradeDistribution(stats.gradeDistribution, stats.totalStudents);
  } catch (err) {
    showAlert(`Failed to load dashboard: ${err.message}`);
  }
}

function renderGradeDistribution(distribution, total) {
  const order = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
  const colors = {
    A: '#1b5e20', 'A-': '#2e7d32', 'B+': '#66bb6a', B: '#1565c0', 'B-': '#4fc3f7',
    'C+': '#c0ca33', C: '#fdd835', 'C-': '#fb8c00', 'D+': '#ef5350', D: '#e53935', F: '#b71c1c',
  };
  const container = document.getElementById('gradeDistribution');

  if (!total) {
    container.innerHTML = '<p class="text-muted">No records yet.</p>';
    return;
  }

  container.innerHTML = order
    .map((grade) => {
      const count = distribution[grade] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return `
        <div class="grade-bar-row">
          <span class="grade-label">${grade}</span>
          <div class="grade-bar-track">
            <div class="grade-bar-fill" style="width:${pct}%; background:${colors[grade]}"></div>
          </div>
          <span class="grade-bar-count">${count}</span>
        </div>`;
    })
    .join('');
}

loadDashboard();
