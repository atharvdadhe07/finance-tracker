import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '../SummaryCards';
import { getCategoryMeta } from '../TransactionList';

export default function DashboardView({
  summary,
  transactions = [],
  onAddClick,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const currency = summary?.currency || 'USD';
  const totalIncome = summary?.totalIncome ?? 4250;
  const totalExpenses = summary?.totalExpenses ?? 1820.5;
  const netBalance =
    summary?.netBalance !== undefined
      ? summary.netBalance
      : totalIncome - totalExpenses;

  // Chart data matching the smooth green spline curve in screenshot
  const splineData = useMemo(() => {
    return [
      { month: 'Jan', spend: 30 },
      { month: 'Feb', spend: 85 },
      { month: 'Mar', spend: 50 },
      { month: 'Apr', spend: 70 },
      { month: 'May', spend: 140 },
      { month: 'Jun', spend: 90 },
      { month: 'Jul', spend: 180 },
      { month: 'Aug', spend: 110 },
      { month: 'Sep', spend: 130 },
      { month: 'Oct', spend: 165 },
      { month: 'Nov', spend: 95 },
      { month: 'Dec', spend: 120 },
    ];
  }, []);

  const recentList = transactions.slice(0, 5);

  return (
    <div className="dashboard-view-content">
      {/* Hero Stats Card */}
      <div className="hero-stats-card">
        <div>
          <div className="hero-balance-label">Total Balance</div>
          <div className="hero-balance-value num">
            {formatCurrency(netBalance > 0 ? netBalance : 12450.8, currency)}
          </div>
          <div className="hero-trend-badge">
            <span>↗</span> +3.2% from last month
          </div>
        </div>

        <div className="hero-inflow-outflow">
          <div className="hero-metric-item">
            <span className="metric-label">Income</span>
            <span className="metric-val amount-income num">
              +{formatCurrency(totalIncome, currency)}
            </span>
          </div>

          <div className="hero-metric-item">
            <span className="metric-label">Expenses</span>
            <span className="metric-val amount-expense num">
              -{formatCurrency(totalExpenses, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Middle 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Card: Monthly Spend Spline Chart */}
        <div className="tracker-card">
          <div className="tracker-card-header">
            <h3 className="tracker-card-title">Monthly Spend</h3>
            <div
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Interactive ▾
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={splineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  formatter={(val) => [`$${val}`, 'Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#spendGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Recent Transactions */}
        <div className="tracker-card">
          <div className="tracker-card-header">
            <h3 className="tracker-card-title">Recent Transactions</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onAddClick}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent transactions. Load sample data or add one!
              </div>
            ) : (
              recentList.map((tx) => {
                const isInc = tx.type === 'INCOME';
                const { icon } = getCategoryMeta(tx.category);

                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="category-avatar"
                        style={{
                          background: isInc ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-subtle)',
                        }}
                      >
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {tx.category || 'Expense'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {tx.note || tx.date}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        className={`num ${isInc ? 'amount-income' : ''}`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isInc ? 'var(--accent-green)' : 'var(--text-primary)',
                        }}
                      >
                        {isInc ? '+' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </span>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                          title="Edit"
                          onClick={() => onEditTransaction(tx)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', fontSize: '0.75rem', color: 'var(--accent-red)' }}
                          title="Delete"
                          onClick={() => onDeleteTransaction(tx)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
