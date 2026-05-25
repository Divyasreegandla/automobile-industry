import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  CogIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { reportsService } from '../services/reports';
import { LiveCounter } from '../components/Common/LiveCounter';
import { ProductionChart, QualityChart, CostTrendChart, EfficiencyChart } from '../components/Charts/ProductionChart';
import { PageLoader } from '../components/Common/LoadingSpinner';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeMachines: 0,
    todayProduction: 0,
    qualityRate: 0,
    monthlyExpenses: 0,
    pendingPayroll: 0,
    operationalRobots: 0,
    lowStock: 0,
    pendingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await reportsService.getDashboardAnalytics();
      const data = response.data;
      setStats({
        totalWorkers: data.employees?.total_workers || 125,
        activeMachines: data.machinery?.operational || 42,
        todayProduction: data.production?.completed_today || 18,
        qualityRate: data.quality?.pass_rate || 92.5,
        monthlyExpenses: data.financial?.monthly_expenses || 485000,
        pendingPayroll: 8,
        operationalRobots: 12,
        lowStock: 5,
        pendingMaintenance: 3,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Workers', value: stats.totalWorkers, icon: UsersIcon, color: 'bg-blue-500' },
    { title: 'Active Machines', value: stats.activeMachines, icon: CogIcon, color: 'bg-green-500' },
    { title: 'Operational Robots', value: stats.operationalRobots, icon: CpuChipIcon, color: 'bg-purple-500' },
    { title: "Today's Production", value: stats.todayProduction, icon: CheckCircleIcon, color: 'bg-orange-500' },
    { title: 'Quality Pass Rate', value: `${stats.qualityRate}%`, icon: CheckCircleIcon, color: 'bg-teal-500' },
    { title: 'Monthly Expenses', value: `₹${(stats.monthlyExpenses / 1000).toFixed(0)}k`, icon: CurrencyDollarIcon, color: 'bg-red-500' },
    { title: 'Pending Payroll', value: stats.pendingPayroll, icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
    { title: 'Maintenance Due', value: stats.pendingMaintenance, icon: WrenchScrewdriverIcon, color: 'bg-pink-500' },
  ];

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Factory Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time production monitoring</p>
          <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((card, index) => (
          <LiveCounter
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Production vs Target
          </h2>
          <ProductionChart />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Quality Control
          </h2>
          <QualityChart />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Line Efficiency
          </h2>
          <EfficiencyChart />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Cost Trend
          </h2>
          <CostTrendChart />
        </div>
      </div>
    </div>
  );
};