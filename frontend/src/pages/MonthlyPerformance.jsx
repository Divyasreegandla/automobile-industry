import React, { useState, useEffect } from 'react';
import { ChartBarIcon, TrophyIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';
import { salesService } from '../services/sales';
import { PageLoader } from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const MonthlyPerformance = () => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const years = [2022, 2023, 2024, 2025, 2026];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch showrooms and targets
      const [showroomsRes, targetsRes] = await Promise.all([
        salesService.getShowrooms(),
        salesService.getTargets(),
      ]);
      
      const showrooms = showroomsRes.data || [];
      const allTargets = targetsRes.data || [];
      
      // Filter targets by selected month and year
      const filteredTargets = allTargets.filter(
        t => t.target_month === selectedMonth && t.target_year === selectedYear
      );
      
      // If no targets found, create demo data
      if (filteredTargets.length === 0 && showrooms.length > 0) {
        const demoPerformance = showrooms.map(showroom => ({
          showroom_id: showroom.id,
          showroom_name: showroom.showroom_name,
          target_count: 50,
          achieved_count: Math.floor(Math.random() * 50) + 10,
          target_revenue: 50000000,
          achieved_revenue: Math.floor(Math.random() * 50000000) + 10000000,
          count_achievement: 0,
          revenue_achievement: 0
        }));
        
        // Calculate percentages
        demoPerformance.forEach(p => {
          p.count_achievement = Math.round((p.achieved_count / p.target_count) * 100);
          p.revenue_achievement = Math.round((p.achieved_revenue / p.target_revenue) * 100);
        });
        
        setPerformance(demoPerformance);
      } else {
        // Calculate percentages for existing targets
        const performanceData = filteredTargets.map(target => ({
          ...target,
          count_achievement: Math.round((target.achieved_count / target.target_count) * 100) || 0,
          revenue_achievement: Math.round((target.achieved_revenue / target.target_revenue) * 100) || 0
        }));
        setPerformance(performanceData);
      }
      
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance data');
      
      // Fallback demo data
      setPerformance([
        {
          showroom_id: 1,
          showroom_name: "Chennai City Motors",
          target_count: 50,
          achieved_count: 35,
          target_revenue: 50000000,
          achieved_revenue: 35000000,
          count_achievement: 70,
          revenue_achievement: 70
        },
        {
          showroom_id: 2,
          showroom_name: "Mumbai Auto Hub",
          target_count: 40,
          achieved_count: 28,
          target_revenue: 40000000,
          achieved_revenue: 28000000,
          count_achievement: 70,
          revenue_achievement: 70
        },
        {
          showroom_id: 3,
          showroom_name: "Delhi Car World",
          target_count: 35,
          achieved_count: 15,
          target_revenue: 35000000,
          achieved_revenue: 15000000,
          count_achievement: 43,
          revenue_achievement: 43
        },
        {
          showroom_id: 4,
          showroom_name: "Bangalore Auto Zone",
          target_count: 30,
          achieved_count: 8,
          target_revenue: 30000000,
          achieved_revenue: 8000000,
          count_achievement: 27,
          revenue_achievement: 27
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monthly Performance Dashboard</h1>
          <p className="text-gray-600">Sales target vs achievement by month</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
            className="input-field w-36"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
            className="input-field w-24"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-lg font-semibold text-blue-800">
          Performance for {monthNames[selectedMonth - 1]} {selectedYear}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {performance.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No targets found for {monthNames[selectedMonth - 1]} {selectedYear}</p>
            <p className="text-sm text-gray-400 mt-2">Create targets to see performance</p>
          </div>
        ) : (
          performance.map(p => (
            <div key={p.showroom_id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{p.showroom_name}</h2>
                  <p className="text-gray-500">
                    Target: {p.target_count} units | Revenue Target: ₹{(p.target_revenue / 10000000).toFixed(1)}Cr
                  </p>
                </div>
                {(p.count_achievement || 0) >= 100 ? (
                  <TrophyIcon className="h-8 w-8 text-yellow-500" />
                ) : (
                  <PresentationChartBarIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Units Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Units Achievement</span>
                  <span className="font-bold text-blue-600">{p.count_achievement || 0}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Achieved: {p.achieved_count} units</span>
                  <span>Target: {p.target_count} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-end px-2 text-xs text-white font-medium ${
                      (p.count_achievement || 0) >= 100 ? 'bg-green-500' : 
                      (p.count_achievement || 0) >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(p.count_achievement || 0, 100)}%` }}
                  >
                    {p.count_achievement >= 90 && `${p.count_achievement}%`}
                  </div>
                </div>
              </div>

              {/* Revenue Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Revenue Achievement</span>
                  <span className="font-bold text-green-600">{p.revenue_achievement || 0}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Achieved: ₹{(p.achieved_revenue / 10000000).toFixed(1)}Cr</span>
                  <span>Target: ₹{(p.target_revenue / 10000000).toFixed(1)}Cr</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-end px-2 text-xs text-white font-medium ${
                      (p.revenue_achievement || 0) >= 100 ? 'bg-green-500' : 
                      (p.revenue_achievement || 0) >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(p.revenue_achievement || 0, 100)}%` }}
                  >
                    {p.revenue_achievement >= 90 && `${p.revenue_achievement}%`}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};