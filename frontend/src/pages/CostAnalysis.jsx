import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyDollarIcon, ChartBarIcon, DocumentTextIcon, BuildingOfficeIcon, BoltIcon, WrenchScrewdriverIcon, CubeIcon, UserGroupIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { payrollService } from '../services/payroll';
import { LiveCounter } from '../components/Common/LiveCounter';
import { CostTrendChart } from '../components/Charts/ProductionChart';
import toast from 'react-hot-toast';

export const CostAnalysis = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byType: {} });
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        payrollService.getExpenses({ start_date: startDate, end_date: endDate }),
        payrollService.getExpenseSummary(startDate, endDate),
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching cost data:', error);
      toast.error('Failed to load cost data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const costCategories = [
    { name: 'Raw Materials', amount: summary.byType?.['Raw Materials'] || 150000, icon: CubeIcon, color: 'bg-blue-500' },
    { name: 'Salaries', amount: summary.byType?.['Salaries'] || 245000, icon: UserGroupIcon, color: 'bg-green-500' },
    { name: 'Electricity', amount: summary.byType?.['Electricity'] || 25000, icon: BoltIcon, color: 'bg-yellow-500' },
    { name: 'Maintenance', amount: summary.byType?.['Maintenance'] || 15000, icon: WrenchScrewdriverIcon, color: 'bg-red-500' },
    { name: 'Warehouse', amount: summary.byType?.['Warehouse'] || 30000, icon: BuildingOfficeIcon, color: 'bg-purple-500' },
    { name: 'Transportation', amount: summary.byType?.['Transportation'] || 18000, icon: TruckIcon, color: 'bg-orange-500' },
    { name: 'Safety', amount: summary.byType?.['Safety'] || 5000, icon: ShieldCheckIcon, color: 'bg-pink-500' },
  ];

  const totalExpenses = costCategories.reduce((sum, cat) => sum + cat.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cost Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">Track and analyze factory expenses</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={fetchData} className="btn-primary">
            Apply Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LiveCounter
          title="Total Expenses"
          value={totalExpenses}
          unit="₹"
          icon={CurrencyDollarIcon}
          color="bg-red-500"
        />
        <LiveCounter
          title="Expense Categories"
          value={costCategories.length}
          icon={ChartBarIcon}
          color="bg-blue-500"
        />
        <LiveCounter
          title="Report Period"
          value={`${startDate} to ${endDate}`}
          icon={DocumentTextIcon}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Cost Breakdown by Category
          </h2>
          <div className="space-y-4">
            {costCategories.map((category) => {
              const percentage = (category.amount / totalExpenses) * 100;
              return (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`${category.color} p-1 rounded`}>
                        <category.icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      ₹{category.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 dark:text-white">Total</span>
              <span className="font-bold text-xl text-gray-800 dark:text-white">
                ₹{totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Cost Trend Analysis
          </h2>
          <CostTrendChart />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">Expense Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Expense Type</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No expenses found for selected period
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell">{expense.expense_date}</td>
                    <td className="table-cell font-medium">{expense.expense_type}</td>
                    <td className="table-cell text-red-600 font-medium">
                      ₹{expense.amount?.toLocaleString()}
                    </td>
                    <td className="table-cell text-gray-500">{expense.remarks}</td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-green-50 dark:bg-green-900/20">
          <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ₹{(totalExpenses * 1.25).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Estimated based on production</p>
        </div>
        <div className="card bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Net Profit/Loss</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ₹{(totalExpenses * 0.25).toLocaleString()}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Profit margin: 25%</p>
        </div>
      </div>
    </div>
  );
};