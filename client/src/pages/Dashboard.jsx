import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [intelligence, setIntelligence] = useState({ anomalies: [], insights: [], segments: {} });
  const [prediction, setPrediction] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [newSale, setNewSale] = useState({ amount: '', category: '', product: '' });
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', description: '' });
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '', category: 'Revenue' });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const ax = React.useMemo(() => axios.create({ 
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` } 
  }), [API_URL, token]);

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('light-theme');
  };

  const fetchData = useCallback(async () => {
    try {
      const [salesRes, expRes, goalRes, intelRes, predRes] = await Promise.all([
        ax.get('/api/sales'),
        ax.get('/api/expenses'),
        ax.get('/api/goals'),
        ax.get('/api/intelligence'),
        ax.get('/api/sales/prediction')
      ]);
      setSales(salesRes.data);
      setExpenses(expRes.data);
      setGoals(goalRes.data);
      setIntelligence(intelRes.data);
      setPrediction(predRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [ax]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await ax.post('/api/expenses', newExpense);
      setNewExpense({ amount: '', category: '', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await ax.post('/api/goals', newGoal);
      setNewGoal({ title: '', targetAmount: '', deadline: '', category: 'Revenue' });
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

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
       const text = event.target.result;
       const lines = text.split("\n").slice(1); // skip header
       const salesData = lines.filter(l => l.trim()).map(line => {
         const parts = line.split(",").map(i => i.replaceAll('"', '').trim());
         return {
           date: parts[0],
           category: parts[1],
           product: parts[2],
           amount: parts[3]
         };
       });

       try {
         await ax.post('/api/sales/bulk', { salesData });
         alert(`Successfully imported ${salesData.length} records!`);
         fetchData();
       } catch (err) {
         console.error(err);
         alert("Failed to import CSV. Ensure the format matches the export.");
       }
    };
    reader.readAsText(file);
  };

  const themeColor = isDarkMode ? '#f8fafc' : '#0f172a';

  // Prepare overall variables
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

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

  // Prepare Segmentation Chart Data
  const segmentData = {
    labels: Object.keys(intelligence.segments || {}),
    datasets: [{
      data: Object.values(intelligence.segments || {}),
      backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
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
          background: activeTab === nav.id ? 'var(--glass-border)' : 'transparent',
          color: activeTab === nav.id ? 'var(--text-main)' : 'var(--text-muted)',
          fontWeight: activeTab === nav.id ? '700' : '400',
          transition: 'all 0.2s ease',
          border: activeTab === nav.id ? '1px solid var(--accent-primary)' : '1px solid transparent'
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
        <button onClick={toggleTheme} className="btn" style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}>
          {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
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

              <div className="glass-panel">
                <p className="kpi-label">Total Expenses</p>
                <p className="kpi-value">${totalExpenses.toFixed(2)}</p>
                <p className="trend-down">-8% vs last period</p>
              </div>

              <div className="glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
                <p className="kpi-label">Net Profit</p>
                <p className="kpi-value">${netProfit.toFixed(2)}</p>
                <p className={netProfit >= 0 ? 'trend-up' : 'trend-down'}>
                  {netProfit >= 0 ? 'Profit' : 'Loss'} identified
                </p>
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

            {intelligence.anomalies.length > 0 && (
              <div className="glass-panel" style={{ marginBottom: '24px', border: '1px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                <h3>🧠 Smart Alerts & Anomalies</h3>
                <div style={{ marginTop: '12px' }}>
                  {intelligence.anomalies.map((anno, i) => (
                    <p key={i} style={{ color: anno.severity === 'high' ? 'var(--danger)' : '#f59e0b', marginBottom: '8px' }}>
                      {anno.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="glass-panel">
                <h3>Goal Progress</h3>
                <div style={{ marginTop: '16px' }}>
                  {goals.length > 0 ? goals.map(goal => (
                    <div key={goal._id} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>{goal.title}</span>
                        <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`, height: '100%', background: 'var(--accent-gradient)' }} />
                      </div>
                    </div>
                  )) : <p>No goals set yet.</p>}
                </div>
              </div>

              <div className="glass-panel">
                <h3>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                   <button className="btn" onClick={() => document.getElementById('sale-form').scrollIntoView({ behavior: 'smooth' })}>Add Sale</button>
                   <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} onClick={() => document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth' })}>Add Expense</button>
                   <button className="btn" style={{ background: '#3b82f6' }} onClick={() => document.getElementById('goal-form').scrollIntoView({ behavior: 'smooth' })}>Set Goal</button>
                </div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="glass-panel" id="sale-form">
                <h3>Add Sale Record</h3>
                <form onSubmit={handleAddSale} style={{ marginTop: '16px' }}>
                  <input type="number" placeholder="Amount ($)" value={newSale.amount} onChange={e => setNewSale({...newSale, amount: e.target.value})} required />
                  <input type="text" placeholder="Category" value={newSale.category} onChange={e => setNewSale({...newSale, category: e.target.value})} required />
                  <input type="text" placeholder="Product Name" value={newSale.product} onChange={e => setNewSale({...newSale, product: e.target.value})} required />
                  <button type="submit" className="btn" style={{ width: '100%' }}>Add Sale</button>
                </form>
              </div>

              <div className="glass-panel" id="expense-form">
                <h3>Add Expense Record</h3>
                <form onSubmit={handleAddExpense} style={{ marginTop: '16px' }}>
                  <input type="number" placeholder="Amount ($)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                  <input type="text" placeholder="Category" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} required />
                  <input type="text" placeholder="Description (Optional)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                  <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>Add Expense</button>
                </form>
              </div>
            </div>

            <div className="glass-panel" id="goal-form" style={{ marginBottom: '24px' }}>
               <h3>Set New Business Goal</h3>
               <form onSubmit={handleAddGoal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <input type="text" placeholder="Goal Title (e.g. Monthly Revenue)" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} required />
                  <input type="number" placeholder="Target Amount ($)" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} required />
                  <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} required />
                  <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}>
                    <option value="Revenue">Revenue</option>
                    <option value="Profit">Profit</option>
                    <option value="Expense Reduction">Expense Reduction</option>
                  </select>
                  <button type="submit" className="btn" style={{ background: 'var(--success)' }}>Active Goal</button>
               </form>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="glass-panel">
                <h3>Sales by Category</h3>
                <div style={{ height: '300px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                  {sales.length > 0 ? (
                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: themeColor } } } }} />
                  ) : <p>No data to analyze yet.</p>}
                </div>
              </div>
              <div className="glass-panel">
                 <h3>Customer Segmentation</h3>
                 <div style={{ height: '300px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                   {Object.keys(intelligence.segments).length > 0 ? (
                     <Doughnut data={segmentData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: themeColor } } } }} />
                   ) : <p>Generating customer segments...</p>}
                 </div>
              </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>🧠 Smart Business Recommendations</h3>
              <div className="dashboard-grid">
                {intelligence.insights.length > 0 ? intelligence.insights.map((insight, i) => (
                  <div key={i} className="glass-panel" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ color: 'var(--accent-primary)' }}>{insight.title}</h4>
                    <p style={{ margin: '12px 0' }}>{insight.text}</p>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>{insight.action}</button>
                  </div>
                )) : <p>Analyzing your data to generate custom recommendations...</p>}
              </div>
            </div>
          </>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Historical Data Ledger</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label className="btn" style={{ background: '#3b82f6', cursor: 'pointer' }}>
                  Import CSV
                  <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
                </label>
                <button onClick={exportCSV} className="btn" style={{ background: 'var(--success)' }}>
                  Export CSV
                </button>
              </div>
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
