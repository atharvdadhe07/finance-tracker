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
      <div className="card" style={{ marginBottom: '1rem' }}>
        <LoadingSpinner message="Calculating summary..." />
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

  return (
    <div className="grid grid-cols-3 summary-cards-grid" style={{ marginBottom: '1.25rem' }}>
      {/* Total Income */}
      <div className="card summary-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Total Income
          </span>
          <span style={{ fontSize: '1.25rem' }}>📈</span>
        </div>
        <div className="amount-income" style={{ fontSize: '1.5rem', wordBreak: 'break-all' }}>
          +{formatCurrency(totalIncome, currency)}
        </div>
      </div>

      {/* Total Expenses */}
      <div className="card summary-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Total Expenses
          </span>
          <span style={{ fontSize: '1.25rem' }}>📉</span>
        </div>
        <div className="amount-expense" style={{ fontSize: '1.5rem', wordBreak: 'break-all' }}>
          -{formatCurrency(totalExpenses, currency)}
        </div>
      </div>

      {/* Net Balance */}
      <div className="card summary-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Net Balance
          </span>
          <span style={{ fontSize: '1.25rem' }}>⚖️</span>
        </div>
        <div
          className={isNetPositive ? 'amount-income' : 'amount-expense'}
          style={{ fontSize: '1.5rem', wordBreak: 'break-all' }}
        >
          {isNetPositive ? '+' : ''}{formatCurrency(netBalance, currency)}
        </div>
      </div>
    </div>
  );
}
