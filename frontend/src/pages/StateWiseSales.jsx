import React, { useState, useEffect } from 'react';
import { salesService } from '../services/sales';
import { PageLoader } from '../components/Common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const StateWiseSales = () => {
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const [stateRes, cityRes] = await Promise.all([
        salesService.getStateWiseSales(),
        salesService.getCityWiseSales(),
      ]);
      
      if (stateRes.data && stateRes.data.length > 0) {
        setStateData(stateRes.data);
        setSelectedState(stateRes.data[0].state);
      } else {
        // Use demo data if API returns empty
        const demoStateData = [
          { state: 'Tamil Nadu', total_sales: 125, total_revenue: 125000000 },
          { state: 'Maharashtra', total_sales: 98, total_revenue: 98000000 },
          { state: 'Karnataka', total_sales: 76, total_revenue: 76000000 },
          { state: 'Delhi', total_sales: 65, total_revenue: 65000000 },
          { state: 'Telangana', total_sales: 54, total_revenue: 54000000 },
          { state: 'Uttar Pradesh', total_sales: 42, total_revenue: 42000000 },
          { state: 'Gujarat', total_sales: 38, total_revenue: 38000000 },
          { state: 'West Bengal', total_sales: 35, total_revenue: 35000000 },
        ];
        setStateData(demoStateData);
        setSelectedState('Tamil Nadu');
        
        const demoCityData = [
          { state: 'Tamil Nadu', city: 'Chennai', total_sales: 85, total_revenue: 85000000 },
          { state: 'Tamil Nadu', city: 'Coimbatore', total_sales: 40, total_revenue: 40000000 },
          { state: 'Maharashtra', city: 'Mumbai', total_sales: 68, total_revenue: 68000000 },
          { state: 'Maharashtra', city: 'Pune', total_sales: 30, total_revenue: 30000000 },
          { state: 'Karnataka', city: 'Bangalore', total_sales: 76, total_revenue: 76000000 },
          { state: 'Delhi', city: 'New Delhi', total_sales: 65, total_revenue: 65000000 },
          { state: 'Telangana', city: 'Hyderabad', total_sales: 54, total_revenue: 54000000 },
        ];
        setCityData(demoCityData);
      }
      
      setCityData(cityRes.data || []);
      
    } catch (error) {
      console.error('Error fetching state data:', error);
      toast.error('Failed to load state data, showing demo data');
      
      // Fallback demo data
      setStateData([
        { state: 'Tamil Nadu', total_sales: 125, total_revenue: 125000000 },
        { state: 'Maharashtra', total_sales: 98, total_revenue: 98000000 },
        { state: 'Karnataka', total_sales: 76, total_revenue: 76000000 },
        { state: 'Delhi', total_sales: 65, total_revenue: 65000000 },
      ]);
      setSelectedState('Tamil Nadu');
      
      setCityData([
        { state: 'Tamil Nadu', city: 'Chennai', total_sales: 85, total_revenue: 85000000 },
        { state: 'Tamil Nadu', city: 'Coimbatore', total_sales: 40, total_revenue: 40000000 },
        { state: 'Maharashtra', city: 'Mumbai', total_sales: 68, total_revenue: 68000000 },
        { state: 'Maharashtra', city: 'Pune', total_sales: 30, total_revenue: 30000000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = selectedState 
    ? cityData.filter(c => c.state === selectedState) 
    : [];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">State-wise Sales Reports</h1>
        <p className="text-gray-600">Sales analytics by state and city</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sales by State</h2>
          {stateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stateData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="state" width={100} />
                <Tooltip formatter={(v) => `${v} units`} />
                <Bar dataKey="total_sales" fill="#3b82f6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No data available</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Select State for City Details
          </h2>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input-field mb-4"
          >
            <option value="">Select a state</option>
            {stateData.map(s => (
              <option key={s.state} value={s.state}>
                {s.state} ({s.total_sales} units)
              </option>
            ))}
          </select>
          
          {selectedState && (
            <div>
              <h3 className="font-medium mb-3">
                Cities in {selectedState}
              </h3>
              {filteredCities.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCities.map(c => (
                    <div key={c.city} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{c.city}</span>
                      <span className="font-bold">{c.total_sales} units</span>
                      <span className="text-green-600">
                        ₹{(c.total_revenue / 100000).toFixed(1)}L
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No city data available for {selectedState}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};