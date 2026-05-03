const API = "http://127.0.0.1:5000";

let chart; // global chart reference

window.onload = async () => {
  const res = await fetch(API + "/data");
  const data = await res.json();

  //  STATS
  document.getElementById("total").innerText = data.length;

  const avgIncome =
    data.reduce((a, b) => a + b["Annual Income (k$)"], 0) / data.length;

  const avgScore =
    data.reduce((a, b) => a + b["Spending Score (1-100)"], 0) / data.length;

  document.getElementById("avgIncome").innerText = avgIncome.toFixed(1);
  document.getElementById("avgScore").innerText = avgScore.toFixed(1);

  //  COLORS + NAMES
  const colors = ["#38bdf8", "#22c55e", "#facc15", "#ef4444"];
  const labels = [
    " High Value",
    " Careful",
    " Impulsive",
    " Low Value"
  ];

  //  DATASETS
  const datasets = [0, 1, 2, 3].map(cluster => ({
    label: labels[cluster],
    data: data
      .filter(d => d.cluster === cluster)
      .map(d => ({
        x: d["Annual Income (k$)"],
        y: d["Spending Score (1-100)"]
      })),
    backgroundColor: colors[cluster],
    pointRadius: 5
  }));

  //  Predicted point (empty initially)
  datasets.push({
    label: "Prediction",
    data: [],
    backgroundColor: "#ffffff",
    pointRadius: 8,
    borderWidth: 2,
    borderColor: "#000"
  });

  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `Income: ${ctx.raw.x}, Score: ${ctx.raw.y}`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Annual Income",
            color: "white"
          },
          ticks: { color: "white" }
        },
        y: {
          title: {
            display: true,
            text: "Spending Score",
            color: "white"
          },
          ticks: { color: "white" }
        }
      }
    }
  });
};

// PREDICT + HIGHLIGHT POINT
async function predict() {
  const income = +document.getElementById("income").value;
  const score = +document.getElementById("score").value;

  const res = await fetch(API + "/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ income, score })
  });

  const data = await res.json();

  const labels = [
    " High Value Customer",
    " Careful Customer",
    " Impulsive Buyer",
    " Low Value Customer"
  ];

  document.getElementById("result").innerText = labels[data.cluster];

  //  Add predicted point to chart
  const predictionDataset = chart.data.datasets[4]; // last dataset

  predictionDataset.data = [{ x: income, y: score }];

  chart.update();
}