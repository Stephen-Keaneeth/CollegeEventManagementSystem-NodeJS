import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryDoughnut({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-xs text-slate-400">No category data available</div>;
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.event_count || d.registration_count || 1),
        backgroundColor: data.map((d) => d.color || '#6366f1'),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 16,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="relative w-full h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
