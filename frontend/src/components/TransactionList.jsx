import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';
import { formatCurrency } from './SummaryCards';

// Category icon & tint mapping for luxury visual hierarchy
export function getCategoryMeta(category = '') {
  const norm = category.toLowerCase();
  if (norm.includes('food') || norm.includes('dining') || norm.includes('grocery')) {
    return { icon: '🍱', color: '#f59e0b' };
  }
  if (norm.includes('transport') || norm.includes('travel') || norm.includes('car') || norm.includes('fuel')) {
    return { icon: '🚕', color: '#06b6d4' };
  }
  if (norm.includes('rent') || norm.includes('housing') || norm.includes('mortgage')) {
    return { icon: '🏠', color: '#8b5cf6' };
  }
  if (norm.includes('bill') || norm.includes('utility') || norm.includes('electricity')) {
    return { icon: '⚡', color: '#eab308' };
  }
  if (norm.includes('shop') || norm.includes('cloth') || norm.includes('amazon')) {
    return { icon: '🛍️', color: '#ec4899' };
  }
  if (norm.includes('health') || norm.includes('med') || norm.includes('fitness')) {
    return { icon: '🩺', color: '#10b981' };
  }
  if (norm.includes('entertain') || norm.includes('game') || norm.includes('movie') || norm.includes('netflix')) {
    return { icon: '🎬', color: '#6366f1' };
  }
  if (norm.includes('salary') || norm.includes('income') || norm.includes('paycheck') || norm.includes('dividend')) {
    return { icon: '💼', color: '#10b981' };
  }
  return { icon: '🏷️', color: '#64748b' };
}

export default function TransactionList({
  transactions = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const [deletingTx, setDeletingTx] = useState(null);

  const sortedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [transactions]);

  const handleConfirmDelete = async () => {
    if (deletingTx) {
      await onDelete(deletingTx.id);
      setDeletingTx(null);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return { main: '-', sub: '' };
    try {
      const d = new Date(dateStr);
      return {
        main: format(d, 'MMM dd, yyyy'),
        sub: format(d, 'EEEE'),
      };
    } catch (e) {
      return { main: dateStr, sub: '' };
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner message="Querying ledger records..." />
      </div>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon="✨"
          title="No Transactions Found"
          subtitle="Your ledger is currently clean. Add a transaction or load sample data to explore."
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Luxury Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Date</th>
              <th>Category &amp; Memo</th>
              <th style={{ width: '110px' }}>Flow</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Magnitude</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const currency = tx.currency || 'USD';
              const { main: dateMain, sub: dateSub } = formatDateDisplay(tx.date);
              const { icon } = getCategoryMeta(tx.category);

              return (
                <tr key={tx.id || Math.random()}>
                  {/* Date Column */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{dateMain}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dateSub}</div>
                  </td>

                  {/* Category & Memo */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="category-icon"
                        style={{
                          background: isIncome ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                          border: isIncome ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                        }}
                      >
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', letterSpacing: '-0.01em' }}>
                          {tx.category || 'General'}
                        </div>
                        {tx.note && (
                          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.1rem', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Flow Chip */}
                  <td>
                    <span className={`chip ${isIncome ? 'income' : 'expense'}`}>
                      {isIncome ? 'Inflow' : 'Outflow'}
                    </span>
                  </td>

                  {/* Amount with Tabular Monospace font */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div
                      className={`num ${isIncome ? 'amount-income' : 'amount-expense'}`}
                      style={{ fontSize: '1.05rem', fontWeight: 700 }}
                    >
                      {isIncome ? '+' : '−'}
                      {formatCurrency(tx.amount, currency)}
                    </div>
                  </td>

                  {/* Action buttons */}
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Edit entry"
                        onClick={() => onEdit(tx)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Delete entry"
                        style={{ color: 'var(--accent-red)' }}
                        onClick={() => setDeletingTx(tx)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (Apple Wallet Style) */}
      <div className="transaction-mobile-cards">
        {sortedTransactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const currency = tx.currency || 'USD';
          const { main: dateMain } = formatDateDisplay(tx.date);
          const { icon } = getCategoryMeta(tx.category);

          return (
            <div key={tx.id || Math.random()} className="transaction-card-item">
              <div className="transaction-card-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="category-icon">{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tx.category || 'General'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateMain}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`num ${isIncome ? 'amount-income' : 'amount-expense'}`} style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {isIncome ? '+' : '−'}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                  <span className={`chip ${isIncome ? 'income' : 'expense'}`} style={{ marginTop: '0.2rem', fontSize: '0.675rem' }}>
                    {isIncome ? 'Inflow' : 'Outflow'}
                  </span>
                </div>
              </div>

              {tx.note && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                  {tx.note}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.15rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(tx)}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeletingTx(tx)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTx)}
        title="Delete Transaction"
        message={
          deletingTx
            ? `Are you sure you want to remove this ${deletingTx.type.toLowerCase()} of ${formatCurrency(
                deletingTx.amount,
                deletingTx.currency || 'USD'
              )} (${deletingTx.category}) from your ledger?`
            : 'Are you sure you want to delete this transaction?'
        }
        confirmText="Confirm Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTx(null)}
      />
    </>
  );
}
