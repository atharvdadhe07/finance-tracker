import React, { useState } from 'react';
import { formatCurrency } from '../SummaryCards';

export default function BudgetsView({ budget, totalExpenses = 0, onBudgetChange }) {
  const budgetAmount = Number(budget?.amount) || 3000;
  const currency = budget?.currency || 'USD';
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budgetAmount.toString());

  const pct = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
  const isExceeded = budgetAmount > 0 && totalExpenses > budgetAmount;

  const handleSave = (e) => {
    e.preventDefault();
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0) {
      onBudgetChange({
        ...budget,
        amount: val,
        currency,
      });
      setIsEditing(false);
    }
  };

  const categoryBudgets = [
    { name: 'Food', spent: 300, target: 500 },
    { name: 'Shopping', spent: 150, target: 300 },
    { name: 'Entertainment', spent: 100, target: 200 },
    { name: 'Housing & Bills', spent: 800, target: 1200 },
  ];

  return (
    <div className="budgets-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Current Monthly Budget Main Card */}
      <div className="tracker-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Current monthly budget
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.35rem 0' }}>
              Spent <span className={isExceeded ? 'amount-expense' : 'amount-income'}>{formatCurrency(totalExpenses, currency)}</span> of{' '}
              <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(budgetAmount, currency)}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Budget'}
          </button>
        </div>

        {/* Big Glowing Progress Bar */}
        <div className="progress-track" style={{ height: '10px', margin: '1rem 0 0.5rem' }}>
          <div
            className={`progress-indicator ${isExceeded ? 'exceeded' : ''}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: isExceeded ? 'var(--accent-red)' : 'var(--text-muted)' }}>
          <span>{pct.toFixed(1)}% of total threshold used</span>
          <span>
            {isExceeded
              ? `Exceeded by ${formatCurrency(totalExpenses - budgetAmount, currency)}`
              : `${formatCurrency(budgetAmount - totalExpenses, currency)} remaining`}
          </span>
        </div>

        {isEditing && (
          <form
            onSubmit={handleSave}
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. 3000"
              style={{ maxWidth: '240px' }}
              autoFocus
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Save Budget
            </button>
          </form>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {categoryBudgets.map((cat) => {
          const catPct = (cat.spent / cat.target) * 100;
          return (
            <div key={cat.name} className="tracker-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</span>
                <span className="num" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  <span className="amount-income">{formatCurrency(cat.spent, currency)}</span> of{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(cat.target, currency)}</span>
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-indicator"
                  style={{ width: `${Math.min(catPct, 100)}%` }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {catPct.toFixed(0)}% allocated • {formatCurrency(cat.target - cat.spent, currency)} left
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Budget Action Button */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setIsEditing(true)}
          style={{ minWidth: '240px', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
        >
          Create New Budget
        </button>
      </div>
    </div>
  );
}
