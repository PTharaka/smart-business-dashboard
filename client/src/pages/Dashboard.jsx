import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics, reports
  const [sales, setSales] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [newSale, setNewSale] = useState({ amount: '', category: '', product: '' });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || '';
  const ax = axios.create({ 
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` } 
  });

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

  const exportCSV = () => {
    const header = "Date,Category,Product,Amount\n";
    const csvRows = sales.map(s => `"${new Date(s.date).toLocaleDateString()}","${s.category}","${s.product}","${s.amount}"`);
    const csvString = header + csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Sales_Report.csv";
    a.click();
  };

  // Prepare overall variables
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);

  // Prepare Line Chart Data (Revenue Timeline)
  const lineChartData = {
    labels: sales.map((s, i) => new Date(s.date).toLocaleDateString()),
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

  // Prepare Doughnut Chart Data (Sales By Category)
  const categoryCounts = sales.reduce((acc, sale) => {
    acc[sale.category] = (acc[sale.category] || 0) + Number(sale.amount);
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      data: Object.values(categoryCounts),
      backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      hoverOffset: 4,
      borderColor: 'rgba(255,255,255,0.1)'
    }]
  };

  // Renders Sidebar
  const renderNavItems = () => {
    const navs = [
      { id: 'overview', label: 'Overview' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'reports', label: 'Reports' }
    ];

    return navs.map(nav => (
      <p 
        key={nav.id} 
        onClick={() => setActiveTab(nav.id)} 
        style={{ 
          cursor: 'pointer', 
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '8px',
          background: activeTab === nav.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          color: activeTab === nav.id ? '#fff' : 'var(--text-muted)',
          fontWeight: activeTab === nav.id ? '600' : '400',
          transition: 'all 0.2s ease'
        }}
      >
        {nav.label}
      </p>
    ));
  };

  return (
    <>
      <div className="sidebar glass-panel" style={{ margin: '16px', height: 'calc(100vh - 32px)' }}>
        <h2 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '40px' }}>
          SmartDash
        </h2>
        <nav style={{ flex: 1 }}>
          {renderNavItems()}
        </nav>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="main-content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-grid">
              <div className="glass-panel">
                <p className="kpi-label">Total Revenue</p>
                <p className="kpi-value">${totalRevenue.toFixed(2)}</p>
                <p className="trend-up">+14% vs last period</p>
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
                <h3>Revenue Timeline</h3>
                <div style={{ height: '300px', marginTop: '16px' }}>
                  <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, color: '#f8fafc', scales: { x: { ticks: { color: '#94a3b8'} }, y: { ticks: { color: '#94a3b8'} } } }} />
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
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="glass-panel">
              <h3>Sales by Category</h3>
              <div style={{ height: '300px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                {sales.length > 0 ? (
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f8fafc'} } } }} />
                ) : <p>No data to analyze yet.</p>}
              </div>
            </div>
            <div className="glass-panel">
              <h3>Insights Engine</h3>
              {sales.length > 0 ? (
                <div style={{ marginTop: '16px'}}>
                  <p><strong>Top Category:</strong> {Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)}</p>
                  <p style={{ marginTop: '12px' }}><strong>Total Transactions:</strong> {sales.length}</p>
                  <p style={{ marginTop: '12px' }}><strong>Average Order Value:</strong> ${(totalRevenue / sales.length).toFixed(2)}</p>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0'}} />
                  <p>AI suggests continuing promotions on your top category to maintain current {prediction?.trend?.toLowerCase() || 'momentum'}.</p>
                </div>
              ) : <p>No data to analyze yet.</p>}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Historical Data Ledger</h3>
              <button onClick={exportCSV} className="btn" style={{ background: 'var(--success)' }}>
                Export CSV
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{new Date(sale.date).toLocaleString()}</td>
                      <td>{sale.product}</td>
                      <td>{sale.category}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>${sale.amount}</td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Dashboard;
