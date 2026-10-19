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

  return (
    <div className="card budget-card" style={{ marginBottom: '1.25rem' }}>
      <div className="card-header" style={{ marginBottom: '0.5rem' }}>
        <h4 className="card-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🎯</span> Monthly Budget
        </h4>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : budgetAmount > 0 ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      {budgetAmount === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
          No budget set for this month. Set a target to keep track of spending.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <span>
              Spent:{' '}
              <strong className={isExceeded ? 'amount-expense' : ''}>
                {formatCurrency(totalExpenses, currency)}
              </strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Budget: <strong>{formatCurrency(budgetAmount, currency)}</strong>
            </span>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className={`progress-fill ${isExceeded ? 'exceeded' : ''}`}
                style={{ width: `${clampedPercentage}%` }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: isExceeded ? 'var(--accent-red)' : 'var(--text-secondary)',
              fontWeight: isExceeded ? 600 : 400,
            }}
          >
            <span>{percentage.toFixed(1)}% of budget used</span>
            {isExceeded ? (
              <span>Over budget by {formatCurrency(totalExpenses - budgetAmount, currency)}!</span>
            ) : (
              <span>{formatCurrency(budgetAmount - totalExpenses, currency)} remaining</span>
            )}
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
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            placeholder="Enter budget amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{ flex: 1 }}
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
