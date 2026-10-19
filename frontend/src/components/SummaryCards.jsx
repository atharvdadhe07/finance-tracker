import React from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

export function formatCurrency(amount, currency = 'USD') {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';
    return `${symbol}${num.toFixed(2)}`;
  }
}

export default function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <LoadingSpinner message="Calculating metrics..." />
      </div>
    );
  }

  const currency = summary?.currency || 'USD';
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netBalance =
    summary?.netBalance !== undefined
      ? summary.netBalance
      : totalIncome - totalExpenses;

  const isNetPositive = netBalance >= 0;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(0) : 0;

  return (
    <div className="summary-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
      
      {/* Total Income Card */}
      <div
        className="card summary-card"
        style={{
          borderLeft: '4px solid var(--accent-green)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.04) 100%)',
          padding: '1.15rem 1.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Total Inflow
            </div>
            <div className="amount-income num" style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.2rem' }}>
              +{formatCurrency(totalIncome, currency)}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-green-bg)',
              color: 'var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: 'var(--income-glow)',
              border: '1px solid var(--accent-green-border)',
              flexShrink: 0,
            }}
          >
            ↗
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span className="chip income" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
            ● Verified
          </span>
          <span>Earned this period</span>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div
        className="card summary-card"
        style={{
          borderLeft: '4px solid var(--accent-red)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(244, 63, 94, 0.04) 100%)',
          padding: '1.15rem 1.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Total Outflow
            </div>
            <div className="amount-expense num" style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.2rem' }}>
              -{formatCurrency(totalExpenses, currency)}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-red-bg)',
              color: 'var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: 'var(--expense-glow)',
              border: '1px solid var(--accent-red-border)',
              flexShrink: 0,
            }}
          >
            ↘
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span className="chip expense" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
            ● Outflow
          </span>
          <span>Expenses recorded</span>
        </div>
      </div>

      {/* Net Liquidity / Balance Card */}
      <div
        className="card summary-card"
        style={{
          borderLeft: `4px solid ${isNetPositive ? 'var(--brand-primary)' : 'var(--accent-red)'}`,
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)',
          padding: '1.15rem 1.35rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Net Balance
            </div>
            <div
              className={`num ${isNetPositive ? 'amount-income' : 'amount-expense'}`}
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                marginTop: '0.2rem',
                color: isNetPositive ? 'var(--brand-primary)' : 'var(--accent-red)',
                textShadow: isNetPositive ? '0 0 15px rgba(99, 102, 241, 0.3)' : undefined,
              }}
            >
              {isNetPositive ? '+' : ''}{formatCurrency(netBalance, currency)}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              flexShrink: 0,
            }}
          >
            ✦
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 700, color: isNetPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {isNetPositive ? 'Surplus' : 'Deficit'}
            </span>
            <span>• Net Cash Flow</span>
          </span>
          {totalIncome > 0 && (
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              {savingsRate}% saved
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
