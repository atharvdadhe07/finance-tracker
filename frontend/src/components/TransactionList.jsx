import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';
import ConfirmModal from './ui/ConfirmModal';
import { formatCurrency } from './SummaryCards';

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
      return (b.id || 0) - (a.id || 0);
    });
  }, [transactions]);

  const handleConfirmDelete = async () => {
    if (deletingTx) {
      await onDelete(deletingTx.id);
      setDeletingTx(null);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner message="Loading transactions..." />
      </div>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon="💸"
          title="No transactions found"
          subtitle="Add your first transaction above to get started!"
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Note</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const currency = tx.currency || 'USD';

              return (
                <tr key={tx.id || Math.random()}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateDisplay(tx.date)}</td>
                  <td>
                    <strong>{tx.category || 'General'}</strong>
                  </td>
                  <td>
                    <span className={`chip ${isIncome ? 'income' : 'expense'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                    {tx.note || '—'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span className={isIncome ? 'amount-income' : 'amount-expense'}>
                      {isIncome ? '+' : '−'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Edit transaction"
                        onClick={() => onEdit(tx)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Delete transaction"
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

      {/* Mobile Stacked Card View */}
      <div className="transaction-mobile-cards">
        {sortedTransactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          const currency = tx.currency || 'USD';

          return (
            <div key={tx.id || Math.random()} className="transaction-card-item">
              <div className="transaction-card-row">
                <div>
                  <strong style={{ fontSize: '1rem' }}>{tx.category || 'General'}</strong>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    {formatDateDisplay(tx.date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={isIncome ? 'amount-income' : 'amount-expense'} style={{ fontSize: '1.05rem' }}>
                    {isIncome ? '+' : '−'}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                  <span className={`chip ${isIncome ? 'income' : 'expense'}`} style={{ marginTop: '0.2rem' }}>
                    {tx.type}
                  </span>
                </div>
              </div>

              {tx.note && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {tx.note}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTx)}
        title="Delete Transaction"
        message={
          deletingTx
            ? `Are you sure you want to delete this ${deletingTx.type.toLowerCase()} of ${formatCurrency(
                deletingTx.amount,
                deletingTx.currency || 'USD'
              )} (${deletingTx.category})? This cannot be undone.`
            : 'Are you sure you want to delete this transaction?'
        }
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTx(null)}
      />
    </>
  );
}
