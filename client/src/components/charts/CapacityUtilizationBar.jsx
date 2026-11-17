import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CapacityUtilizationBar({ events = [] }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-10 text-xs text-slate-400">No events data available</div>;
  }

  // Shorten titles for legible chart labels
  const labels = events.map((e) =>
    e.title.length > 20 ? e.title.substring(0, 18) + '...' : e.title
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Registered Students',
        data: events.map((e) => e.current_registrations || 0),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
      {
        label: 'Venue Capacity',
        data: events.map((e) => e.max_capacity || 0),
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11, family: "'Inter', sans-serif" },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="relative w-full h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
