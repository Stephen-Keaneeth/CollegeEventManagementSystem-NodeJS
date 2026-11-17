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

export default function AttendanceBarChart({ present = 0, absent = 0 }) {
  const chartData = {
    labels: ['Attendance Distribution'],
    datasets: [
      {
        label: 'Present (Checked In)',
        data: [present],
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Absent',
        data: [absent],
        backgroundColor: '#f43f5e',
        borderRadius: 8,
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
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
    },
  };

  return (
    <div className="relative w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
