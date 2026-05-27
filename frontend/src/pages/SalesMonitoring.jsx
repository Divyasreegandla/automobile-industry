import React, { useState, useEffect } from 'react';
import { EyeIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { LiveCounter } from '../components/Common/LiveCounter';
import { PageLoader } from '../components/Common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const SalesMonitoring = () => {
  const [sales, setSales] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sales data
      const salesRes = await salesService.getSales();
      const salesData = salesRes.data || [];
      setSales(salesData);
      
      // Calculate stats
      const total = salesData.length;
      const revenue = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const delivered = salesData.filter(s => s.sale_status === 'delivered').length;
      const pending = total - delivered;
      
      setStats({ total, revenue, delivered, pending });
      
      // Process monthly data from sales
      const monthlyMap = {};
      salesData.forEach(sale => {
        if (sale.delivery_date) {
          const date = new Date(sale.delivery_date);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          
          if (year === selectedYear) {
            if (!monthlyMap[month]) {
              monthlyMap[month] = { month_name: month, sales_count: 0, revenue: 0 };
            }
            monthlyMap[month].sales_count += 1;
            monthlyMap[month].revenue += sale.total_amount || 0;
          }
        }
      });
      
      const monthlyArray = Object.values(monthlyMap);
      setMonthlyData(monthlyArray);
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to load sales data');
      
      // Demo data for testing
      setStats({ total: 25, revenue: 25000000, pending: 5, delivered: 20 });
      setMonthlyData([
        { month_name: 'Jan', sales_count: 5, revenue: 5000000 },
        { month_name: 'Feb', sales_count: 7, revenue: 7000000 },
        { month_name: 'Mar', sales_count: 4, revenue: 4000000 },
        { month_name: 'Apr', sales_count: 6, revenue: 6000000 },
        { month_name: 'May', sales_count: 3, revenue: 3000000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (value) => {
    if (!value || isNaN(value)) return '0';
    return (value / 100000).toFixed(1);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time sales tracking</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-24"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <button onClick={fetchData} className="btn-secondary">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LiveCounter 
          title="Total Sales" 
          value={stats.total} 
          icon={EyeIcon} 
          color="bg-blue-500" 
        />
        <LiveCounter 
          title="Total Revenue" 
          value={`₹${formatRevenue(stats.revenue)}L`} 
          icon={CurrencyDollarIcon} 
          color="bg-green-500" 
        />
        <LiveCounter 
          title="Delivered" 
          value={stats.delivered} 
          icon={CheckCircleIcon} 
          color="bg-green-500" 
        />
        <LiveCounter 
          title="Pending Delivery" 
          value={stats.pending} 
          icon={ClockIcon} 
          color="bg-orange-500" 
        />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Monthly Sales Trend - {selectedYear}</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales_count" stroke="#3b82f6" name="Units Sold" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No sales data for {selectedYear}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Invoice No</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No sales records found
                  </td>
                </tr>
              ) : (
                sales.slice(0, 10).map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell">{s.sales_invoice_number}</td>
                    <td className="table-cell">{s.customer_name || '-'}</td>
                    <td className="table-cell">{s.vehicle_model_name || '-'}</td>
                    <td className="table-cell">₹{(s.total_amount || 0).toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={`status-badge ${s.sale_status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {s.sale_status}
                      </span>
                    </td>
                    <td className="table-cell">{s.delivery_date || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};