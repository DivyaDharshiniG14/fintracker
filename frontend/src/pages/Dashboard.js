import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { transactionAPI } from '../services/api';

const COLORS = ['#4f8ef7', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

const CATEGORIES = ['FOOD', 'RENT', 'EMI', 'SALARY', 'INVESTMENT', 'ENTERTAINMENT', 'TRANSPORT', 'UTILITIES', 'HEALTHCARE', 'SHOPPING', 'OTHER'];

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, expenseByCategory: {} });
  const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', category: 'FOOD' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, sumRes] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getSummary()
      ]);
      setTransactions(txRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await transactionAPI.add({
        ...form,
        amount: parseFloat(form.amount),
        date: new Date().toISOString()
      });
      setForm({ description: '', amount: '', type: 'EXPENSE', category: 'FOOD' });
      fetchData();
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transactionAPI.delete(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const pieData = Object.entries(summary.expenseByCategory || {}).map(([name, value]) => ({
    name, value: parseFloat(value)
  }));

  return (
    <div>
      <div className="navbar">
        <h1>💰 FinTracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#888' }}>👤 {username}</span>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Income</h3>
            <div className="amount income">₹{parseFloat(summary.totalIncome || 0).toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <h3>Total Expense</h3>
            <div className="amount expense">₹{parseFloat(summary.totalExpense || 0).toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <h3>Balance</h3>
            <div className="amount balance">₹{parseFloat(summary.balance || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3 style={{ marginBottom: '16px', color: '#888', fontSize: '14px', textTransform: 'uppercase' }}>Expense Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name}) => name}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>No expense data yet</div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: '#888', fontSize: '14px', textTransform: 'uppercase' }}>Add Transaction</h3>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleAdd}>
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
                required
                min="1"
              />
              <div className="form-grid">
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-success" style={{width:'100%'}} disabled={loading}>
                {loading ? 'Adding...' : '+ Add Transaction'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#888', fontSize: '14px', textTransform: 'uppercase' }}>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>No transactions yet. Add one above!</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.description}</td>
                    <td>{tx.category}</td>
                    <td>
                      <span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span>
                    </td>
                    <td className={tx.type === 'INCOME' ? 'income' : 'expense'}>
                      {tx.type === 'INCOME' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                    </td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger" style={{padding:'4px 10px', fontSize:'12px'}} onClick={() => handleDelete(tx.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
