import React, { useMemo } from 'react';
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
  CartesianGrid,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';
import { formatCurrency } from './SummaryCards';

const LUXURY_PALETTE = [
  '#6366f1', // Electric Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose Coral
  '#f59e0b', // Amber Gold
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Hot Pink
  '#3b82f6', // Azure Blue
  '#14b8a6', // Teal
];

export function ExpenseDonut({ summary, loading }) {
  const currency = summary?.currency || 'USD';

  const donutData = useMemo(() => {
    if (!summary?.expenseByCategory) return [];
    if (Array.isArray(summary.expenseByCategory)) {
      return summary.expenseByCategory
        .map((item) => ({
          name: item.category || item.name || 'Other',
          value: Number(item.amount ?? item.value ?? 0),
        }))
        .filter((d) => d.value > 0);
    }
    if (typeof summary.expenseByCategory === 'object') {
      return Object.entries(summary.expenseByCategory)
        .map(([name, value]) => ({
          name,
          value: Number(value) || 0,
        }))
        .filter((d) => d.value > 0);
    }
    return [];
  }, [summary]);

  const totalExpense = useMemo(() => {
    if (summary?.totalExpenses !== undefined) {
      return Number(summary.totalExpenses) || 0;
    }
    return donutData.reduce((acc, curr) => acc + curr.value, 0);
  }, [summary, donutData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = Number(data.value) || 0;
      const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : '0';
      return (
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--card-shadow-hover)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: data.payload.fill || 'var(--brand-primary)',
              }}
            />
            {data.name}
          </div>
          <div className="num" style={{ fontWeight: 700, fontSize: '0.925rem' }}>
            {formatCurrency(val, currency)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem', marginTop: '0.15rem' }}>
            {pct}% of monthly burn
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: '0.85rem' }}>
        <div>
          <h4 className="card-title" style={{ fontSize: '0.975rem', margin: 0 }}>
            Allocation Breakdown
          </h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Expense Distribution by Category
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Aggregating categories..." />
      ) : donutData.length === 0 ? (
        <EmptyState
          icon="🍩"
          title="Zero Outflow"
          subtitle="No expenses recorded for the active period"
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={LUXURY_PALETTE[index % LUXURY_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Glowing Center Metric Badge */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              maxWidth: '120px',
            }}
          >
            <div
              style={{
                fontSize: '0.675rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              Total Burn
            </div>
            <div
              className="num"
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
                marginTop: '0.15rem',
              }}
            >
              {formatCurrency(totalExpense, currency)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthlyBarChart({ history = [], loading }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return history.map((item) => {
      let label = item.month || '';
      try {
        if (/^\d{4}-\d{2}$/.test(item.month)) {
          label = format(new Date(`${item.month}-01T00:00:00`), 'MMM');
        } else if (/^\d{4}-\d{2}-\d{2}/.test(item.month)) {
          label = format(new Date(item.month), 'MMM');
        }
      } catch (e) {
        label = item.month;
      }
      return {
        month: item.month,
        displayMonth: label,
        income: Number(item.income ?? item.totalIncome ?? 0),
        expense: Number(item.expense ?? item.totalExpense ?? item.totalExpenses ?? 0),
      };
    });
  }, [history]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--card-shadow-hover)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.85rem', margin: '0.2rem 0' }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
              <span className="num" style={{ fontWeight: 700 }}>{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: '0.85rem' }}>
        <div>
          <h4 className="card-title" style={{ fontSize: '0.975rem', margin: 0 }}>
            Macro Velocity (6 Mo)
          </h4>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Cash Flow Trend: Inflow vs Outflow
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating trends..." />
      ) : chartData.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Awaiting Historical Data"
          subtitle="Past months will graph automatically as transactions are recorded"
        />
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#be123c" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="displayMonth"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.75rem', fontWeight: 600 }}
              />
              <Bar
                dataKey="income"
                name="Inflow"
                fill="url(#incomeGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="Outflow"
                fill="url(#expenseGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Charts({ summary, history = [], loading }) {
  return (
    <div className="charts-container">
      <ExpenseDonut summary={summary} loading={loading} />
      <MonthlyBarChart history={history} loading={loading} />
    </div>
  );
}
