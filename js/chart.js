/* BEGIN Shendeti */

let chartInstance = null;

window.renderHistoryChart = renderHistoryChart;
window.clearChart = clearChart;

function renderHistoryChart(points) {
  console.log("[v1] renderHistoryChart called with", points.length, "data points");

  if (typeof Chart === "undefined") {
    console.error("[v1] Chart.js is not loaded!");
    return;
  }

  const canvas = document.getElementById("historyChart");
  if (!canvas) {
    console.error("[v1] Chart canvas element not found!");
    return;
  }

  const labels = points.map((p) => {
    const d = new Date(p[0]);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  });

  const data = points.map((p) => p[1]);

  if (chartInstance) {
    console.log("[v1] Destroying previous chart instance");
    chartInstance.destroy();
  }

  console.log("[v1] Creating new chart with", data.length, "data points");

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Price (USD)",
          data,
          borderColor: "#7380ec",
          backgroundColor: "rgba(115, 128, 236, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#7380ec",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              family: "Poppins",
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(54, 57, 73, 0.95)",
          padding: 12,
          titleFont: {
            family: "Poppins",
            size: 13,
          },
          bodyFont: {
            family: "Poppins",
            size: 12,
          },
          borderColor: "#7380ec",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "Poppins",
              size: 11,
            },
          },
        },
        y: {
          display: true,
          grid: {
            color: "rgba(115, 128, 236, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              family: "Poppins",
              size: 11,
            },
            callback: (value) => "$" + value.toLocaleString(),
          },
        },
      },
    },
  });

  console.log("[v1] Chart created successfully!");
}

function clearChart() {
  if (chartInstance) {
    console.log("[v1] Clearing chart");
    chartInstance.destroy();
  }
  chartInstance = null;
}

/* END Shendeti */