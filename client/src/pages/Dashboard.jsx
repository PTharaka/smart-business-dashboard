import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [newSale, setNewSale] = useState({ amount: '', category: '', product: '' });

  const token = localStorage.getItem('token');
  const ax = axios.create({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, predRes] = await Promise.all([
        ax.get('/api/sales'),
        ax.get('/api/sales/prediction')
      ]);
      setSales(salesRes.data);
      setPrediction(predRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      await ax.post('/api/sales', newSale);
      setNewSale({ amount: '', category: '', product: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Prepare chart data
  const chartData = {
    labels: sales.map((s, i) => `Entry ${i+1}`),
    datasets: [
      {
        label: 'Revenue',
        data: sales.map(s => s.amount),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <>
      <div className="sidebar glass-panel" style={{ margin: '16px', height: 'calc(100vh - 32px)' }}>
        <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '40px' }}>
          SmartDash
        </h2>
        <nav style={{ flex: 1 }}>
          <p style={{ cursor: 'pointer', color: 'var(--text-main)', marginBottom: '16px', fontWeight: '500' }}>Overview</p>
          <p style={{ cursor: 'pointer', marginBottom: '16px' }}>Analytics</p>
          <p style={{ cursor: 'pointer', marginBottom: '16px' }}>Reports</p>
        </nav>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="main-content">
        <h1>Dashboard Overview</h1>
        
        <div className="dashboard-grid">
          <div className="glass-panel">
            <p className="kpi-label">Total Revenue</p>
            <p className="kpi-value">${totalRevenue.toFixed(2)}</p>
            <p className="trend-up">+14% vs last month</p>
          </div>

          <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-gradient)' }} />
            <p className="kpi-label">AI Forecast (Next Period)</p>
            {prediction ? (
              <>
                <p className="kpi-value">${prediction.predictedValue}</p>
                <p className={prediction.trend === 'Decline' ? 'trend-down' : 'trend-up'}>
                  {prediction.trend} ({prediction.percentage}%)
                </p>
              </>
            ) : <p>Analyzing...</p>}
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="glass-panel">
            <h3>Revenue Trends</h3>
            <div style={{ height: '300px', marginTop: '16px' }}>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="glass-panel">
            <h3>Add Record</h3>
            <form onSubmit={handleAddSale} style={{ marginTop: '16px' }}>
              <input type="number" placeholder="Amount ($)" value={newSale.amount} onChange={e => setNewSale({...newSale, amount: e.target.value})} required />
              <input type="text" placeholder="Category" value={newSale.category} onChange={e => setNewSale({...newSale, category: e.target.value})} required />
              <input type="text" placeholder="Product Name" value={newSale.product} onChange={e => setNewSale({...newSale, product: e.target.value})} required />
              <button type="submit" className="btn" style={{ width: '100%' }}>Add Sale</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
