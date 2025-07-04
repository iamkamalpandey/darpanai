//@ts-nocheck
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChart = ({ data }: { data: any }) => {
  const chartData = {
    labels: ["Hot Leads", "Warm Leads", "Cold Leads", "Unknown Leads"],

    datasets: [
      {
        label: "Leads Distribution",
        data: [data.hotCount, data.warmCount, data.coldCount, data.unassigned],
        backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#94a3b8"],
        borderColor: ["#ef4444", "#f59e0b", "#3b82f6", "#94a3b8"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
