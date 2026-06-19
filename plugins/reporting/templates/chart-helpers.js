// Helpers Chart.js TechTown
const TECHTOWN_BLUE = '#1C62ED';
const TECHTOWN_ACCENT = '#3B7EFF';
const TECHTOWN_LIGHT = 'rgba(28, 98, 237, 0.15)';

function createBarChart(canvasId, { labels, data, label }) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: TECHTOWN_LIGHT,
        borderColor: TECHTOWN_BLUE,
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function createLineChart(canvasId, { labels, datasets }) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const colors = [TECHTOWN_BLUE, TECHTOWN_ACCENT, '#10B981', '#F59E0B'];
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({
        ...d,
        borderColor: colors[i % colors.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } },
      },
    },
  });
}

function createDoughnutChart(canvasId, { labels, data }) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [TECHTOWN_BLUE, TECHTOWN_ACCENT, '#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } },
    },
  });
}
