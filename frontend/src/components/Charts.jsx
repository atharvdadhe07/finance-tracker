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

const DONUT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
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
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 600, color: data.payload.fill || 'var(--text-primary)' }}>
            {data.name}
          </div>
          <div>Amount: {formatCurrency(val, currency)}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Share: {pct}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h4 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
        Expenses by Category
      </h4>

      {loading ? (
        <LoadingSpinner message="Loading chart..." />
      ) : donutData.length === 0 ? (
        <EmptyState
          icon="🍩"
          title="No expenses"
          subtitle="No expense data recorded for this period"
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text for donut chart */}
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
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              Total
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
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
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ color: entry.color, margin: '0.15rem 0' }}>
              {entry.name}: {formatCurrency(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h4 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
        Income vs Expense Trend
      </h4>

      {loading ? (
        <LoadingSpinner message="Loading monthly trend..." />
      ) : chartData.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No history yet"
          subtitle="Monthly history will show here as you track your finances"
        />
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="displayMonth"
                stroke="var(--text-secondary)"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.8rem', paddingTop: '0.5rem' }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
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
