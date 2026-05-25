import React, { useState, useEffect, useCallback } from 'react';
import { DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { reportsService } from '../services/reports';
import { ProductionChart, QualityChart, CostTrendChart } from '../components/Charts/ProductionChart';
import { PageLoader } from '../components/Common/LoadingSpinner';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('production');
  const [productionData, setProductionData] = useState({ daily: null, monthly: null });
  const [qualityData, setQualityData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'production') {
        const [daily, monthly] = await Promise.all([
          reportsService.getDailyProduction(),
          reportsService.getMonthlyProduction(selectedYear, selectedMonth),
        ]);
        setProductionData({ daily: daily.data, monthly: monthly.data });
      } else if (activeTab === 'quality') {
        const quality = await reportsService.getQualitySummary(dateRange.start, dateRange.end);
        setQualityData(quality.data);
      } else if (activeTab === 'cost') {
        const cost = await reportsService.getExpenseReport(dateRange.start, dateRange.end);
        setCostData(cost.data);
      } else if (activeTab === 'efficiency') {
        const efficiency = await reportsService.getMachinePerformance();
        setEfficiencyData(efficiency.data);
      } else if (activeTab === 'maintenance') {
        const maintenance = await reportsService.predictMaintenance();
        setMaintenanceData(maintenance.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedMonth, selectedYear, dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportToExcel = () => {
    let exportData = [];
    let filename = '';

    if (activeTab === 'production' && productionData.monthly) {
      exportData = [productionData.monthly];
      filename = 'production_report';
    } else if (activeTab === 'quality' && qualityData) {
      exportData = [qualityData];
      filename = 'quality_report';
    } else if (activeTab === 'cost' && costData) {
      exportData = costData.expenses_by_type ? Object.entries(costData.expenses_by_type).map(([key, value]) => ({ category: key, amount: value })) : [];
      filename = 'cost_report';
    } else if (activeTab === 'efficiency' && efficiencyData) {
      exportData = efficiencyData;
      filename = 'efficiency_report';
    } else if (activeTab === 'maintenance' && maintenanceData?.predictions) {
      exportData = maintenanceData.predictions;
      filename = 'maintenance_report';
    }

    if (exportData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Report exported successfully');
    } else {
      toast.error('No data to export');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'production'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Production Report
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'quality'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Quality Report
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'cost'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Cost Report
        </button>
        <button
          onClick={() => setActiveTab('efficiency')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'efficiency'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Efficiency Report
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'maintenance'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Maintenance Report
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            {activeTab === 'production' && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input-field w-32"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-field w-24"
                >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </>
            )}
            {(activeTab === 'quality' || activeTab === 'cost') && (
              <>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="input-field w-auto"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="input-field w-auto"
                />
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="btn-secondary flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center">
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 print:p-0">
        {activeTab === 'production' && productionData.monthly && (
          <div>
            <h2 className="text-xl font-bold mb-4">Production Report - {selectedMonth}/{selectedYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Total Vehicles Produced</p>
                <p className="text-3xl font-bold text-blue-600">
                  {productionData.monthly?.vehicles_completed || 0}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Total Production Cost</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{productionData.monthly?.total_production_cost?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <ProductionChart />
          </div>
        )}

        {activeTab === 'quality' && qualityData && (
          <div>
            <h2 className="text-xl font-bold mb-4">Quality Control Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Total Checks</p>
                <p className="text-3xl font-bold">{qualityData.total_checks || 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">{qualityData.pass_rate || 0}%</p>
              </div>
            </div>
            <QualityChart />
          </div>
        )}

        {activeTab === 'cost' && costData && (
          <div>
            <h2 className="text-xl font-bold mb-4">Cost Analysis Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{costData.total_amount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-500">Expense Categories</p>
                <p className="text-3xl font-bold">
                  {Object.keys(costData.expenses_by_type || {}).length}
                </p>
              </div>
            </div>
            <CostTrendChart />
          </div>
        )}

        {activeTab === 'efficiency' && efficiencyData && (
          <div>
            <h2 className="text-xl font-bold mb-4">Production Efficiency Report</h2>
            <div className="space-y-4">
              {efficiencyData.slice(0, 5).map((machine, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{machine.machine_name}</span>
                    <span className="text-sm text-gray-500">{machine.machine_code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Running Hours</p>
                      <p className="font-semibold">{machine.running_hours} hrs</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Maintenance Count</p>
                      <p className="font-semibold">{machine.maintenance_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Downtime</p>
                      <p className="font-semibold">{machine.total_downtime_hours || 0} hrs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && maintenanceData?.predictions && (
          <div>
            <h2 className="text-xl font-bold mb-4">Maintenance Forecast Report</h2>
            <div className="space-y-4">
              {maintenanceData.predictions.map((prediction, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    prediction.status === 'urgent'
                      ? 'bg-red-50 border-red-200'
                      : prediction.status === 'upcoming'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{prediction.machine_name}</h3>
                      <p className="text-sm mt-1">
                        Next maintenance due in {prediction.days_until_next_maintenance} days
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{prediction.recommendation}</p>
                    </div>
                    <span
                      className={`status-badge ${
                        prediction.status === 'urgent'
                          ? 'bg-red-200 text-red-800'
                          : prediction.status === 'upcoming'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {prediction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};