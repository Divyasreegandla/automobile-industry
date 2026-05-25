import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const ProductionChart = () => {
  const [data] = useState([
    { name: 'Mon', actual: 45, target: 50 },
    { name: 'Tue', actual: 52, target: 50 },
    { name: 'Wed', actual: 48, target: 50 },
    { name: 'Thu', actual: 55, target: 50 },
    { name: 'Fri', actual: 60, target: 50 },
    { name: 'Sat', actual: 42, target: 50 },
    { name: 'Sun', actual: 38, target: 40 },
  ]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="actual" fill="#3b82f6" name="Actual Production" />
        <Bar dataKey="target" fill="#f59e0b" name="Target" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const QualityChart = () => {
  const data = [
    { name: 'Passed', value: 85 },
    { name: 'Failed', value: 15 },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const CostTrendChart = () => {
  const data = [
    { month: 'Jan', cost: 450000 },
    { month: 'Feb', cost: 480000 },
    { month: 'Mar', cost: 520000 },
    { month: 'Apr', cost: 510000 },
    { month: 'May', cost: 550000 },
    { month: 'Jun', cost: 580000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
        <Legend />
        <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Total Cost" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const EfficiencyChart = () => {
  const data = [
    { name: 'Line 1', efficiency: 92 },
    { name: 'Line 2', efficiency: 88 },
    { name: 'Line 3', efficiency: 95 },
    { name: 'Line 4', efficiency: 78 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="efficiency" fill="#8b5cf6" name="Efficiency %" />
      </BarChart>
    </ResponsiveContainer>
  );
};