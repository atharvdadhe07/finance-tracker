import React, { useState, useEffect } from 'react';
import { formatCurrency } from './SummaryCards';

export default function BudgetBar({ budget, totalExpenses = 0, onBudgetChange }) {
  const budgetAmount = Number(budget?.amount) || 0;
  const currency = budget?.currency || 'USD';
  const [newAmount, setNewAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (budgetAmount > 0) {
      setNewAmount(budgetAmount.toString());
    } else {
      setNewAmount('');
    }
  }, [budgetAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(newAmount);
    if (!isNaN(parsed) && parsed >= 0) {
      onBudgetChange({
        ...budget,
        amount: parsed,
        currency: currency,
      });
      setIsEditing(false);
    }
  };

  const percentage = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const isExceeded = budgetAmount > 0 && totalExpenses > budgetAmount;
  const remaining = budgetAmount - totalExpenses;

  return (
    <div
      className="card budget-card"
      style={{
        marginBottom: '1.5rem',
        background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.03) 100%)',
      }}
    >
      <div className="card-header" style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            🎯
          </div>
          <div>
            <h4 className="card-title" style={{ fontSize: '0.975rem', margin: 0 }}>
              Monthly Budget
            </h4>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Spending Cap &amp; Velocity
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsEditing(!isEditing)}
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
        >
          {isEditing ? 'Cancel' : budgetAmount > 0 ? 'Edit Cap' : '+ Set Budget'}
        </button>
      </div>

      {budgetAmount === 0 ? (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.825rem',
          }}
        >
          <div style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>🛡️</div>
          No budget threshold defined. Set a monthly limit to track your spending velocity.
        </div>
      ) : (
        <>
          {/* Status Pill & Percentage */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span
              className={`chip ${isExceeded ? 'expense' : 'income'}`}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}
            >
              {isExceeded ? '⚠️ Cap Exceeded' : '⚡ On Track'}
            </span>
            <span className="num" style={{ fontSize: '0.875rem', fontWeight: 700, color: isExceeded ? 'var(--accent-red)' : 'var(--text-primary)' }}>
              {percentage.toFixed(1)}% consumed
            </span>
          </div>

          {/* Glowing Progress Track */}
          <div className="progress-container" style={{ margin: '0.5rem 0 0.85rem' }}>
            <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-secondary)' }}>
              <div
                className={`progress-fill ${isExceeded ? 'exceeded' : ''}`}
                style={{ width: `${clampedPercentage}%` }}
              />
            </div>
          </div>

          {/* High-end Breakdown Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              fontSize: '0.775rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Expended
              </div>
              <div className={`num ${isExceeded ? 'amount-expense' : ''}`} style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatCurrency(totalExpenses, currency)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isExceeded ? 'Deficit' : 'Remaining'}
              </div>
              <div
                className="num"
                style={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: isExceeded ? 'var(--accent-red)' : 'var(--accent-green)',
                }}
              >
                {isExceeded
                  ? `-${formatCurrency(Math.abs(remaining), currency)}`
                  : `+${formatCurrency(remaining, currency)}`}
              </div>
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            placeholder="e.g. 3500.00"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            autoFocus
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
