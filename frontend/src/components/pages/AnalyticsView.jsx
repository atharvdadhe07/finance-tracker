import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
} from 'recharts';
import { formatCurrency } from '../SummaryCards';

const PALETTE = ['#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6'];

export default function AnalyticsView({ summary, history = [] }) {
  const [periodTab, setPeriodTab] = useState('Monthly');
  const currency = summary?.currency || 'USD';

  // Donut data from summary or fallback to screenshot distribution
  const donutData = useMemo(() => {
    if (summary?.expenseByCategory && Object.keys(summary.expenseByCategory).length > 0) {
      return Object.entries(summary.expenseByCategory).map(([name, value], i) => ({
        name,
        value: Number(value),
        color: PALETTE[i % PALETTE.length],
      }));
    }
    return [
      { name: 'Housing', value: 40, color: '#06b6d4' },
      { name: 'Food', value: 25, color: '#10b981' },
      { name: 'Entertainment', value: 15, color: '#f43f5e' },
      { name: 'Utilities', value: 10, color: '#f59e0b' },
      { name: 'Others', value: 10, color: '#8b5cf6' },
    ];
  }, [summary]);

  // Spend history weekly/monthly sample data matching screenshot
  const spendHistoryData = useMemo(() => {
    if (periodTab === 'Weekly') {
      return [
        { label: 'Mon', spend: 40, trend: 50 },
        { label: 'Tue', spend: 80, trend: 75 },
        { label: 'Wed', spend: 65, trend: 90 },
        { label: 'Thu', spend: 120, trend: 110 },
        { label: 'Fri', spend: 190, trend: 160 },
        { label: 'Sat', spend: 140, trend: 150 },
        { label: 'Sun', spend: 100, trend: 130 },
      ];
    }
    if (history && history.length > 0) {
      return history.map((item) => ({
        label: item.month,
        spend: Number(item.expense || 0),
        trend: Number(item.income || 0),
      }));
    }
    return [
      { label: 'May', spend: 90, trend: 120 },
      { label: 'Jun', spend: 140, trend: 160 },
      { label: 'Jul', spend: 110, trend: 140 },
      { label: 'Aug', spend: 180, trend: 190 },
      { label: 'Sep', spend: 120, trend: 150 },
      { label: 'Oct', spend: 160, trend: 175 },
    ];
  }, [periodTab, history]);

  return (
    <div className="analytics-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top: Monthly Spend Donut Card */}
      <div className="tracker-card">
        <h3 className="tracker-card-title" style={{ marginBottom: '1.25rem' }}>
          Monthly Spend
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ height: 220, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  formatter={(val, name) => [`${val}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {donutData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {typeof item.value === 'number' && item.value < 100 ? `${item.value}%` : formatCurrency(item.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Transaction Breakdown & Spend History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Transaction Breakdown List */}
        <div className="tracker-card">
          <h3 className="tracker-card-title" style={{ marginBottom: '1.25rem' }}>
            Transaction
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {donutData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                    }}
                  >
                    ●
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                </div>

                <span className="num" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {typeof item.value === 'number' && item.value <= 100 ? `${item.value}%` : formatCurrency(item.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spend History Chart with Tabs */}
        <div className="tracker-card">
          <div className="tracker-card-header">
            <h3 className="tracker-card-title">Spend history</h3>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: '6px' }}>
              {['Weekly', 'Monthly', 'Yearly'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPeriodTab(tab)}
                  style={{
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: periodTab === tab ? 'var(--accent-green)' : 'transparent',
                    color: periodTab === tab ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={spendHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="spend" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Line type="monotone" dataKey="trend" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
