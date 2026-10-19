import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useSummary } from './hooks/useSummary';
import { useBudget } from './hooks/useBudget';
import { getCategories, addCategory as apiAddCategory, seedData, exportCsv } from './api';
import SummaryCards from './components/SummaryCards';
import BudgetBar from './components/BudgetBar';
import Charts from './components/Charts';
import FilterBar from './components/FilterBar';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import './App.css';

function MainApp() {
  const { dark, toggle: toggleTheme } = useTheme();
  const currentMonth = format(new Date(), 'yyyy-MM');

  const [month, setMonth] = useState(currentMonth);
  const [filters, setFilters] = useState({
    month: currentMonth,
    type: '',
    category: '',
    q: '',
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [mobileTab, setMobileTab] = useState('transactions'); // 'transactions' | 'overview'

  // Hooks
  const {
    transactions,
    loading: txLoading,
    refetch: refetchTransactions,
    add: addTx,
    update: updateTx,
    remove: removeTx,
  } = useTransactions(filters);

  const {
    summary,
    history,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSummary(month);

  const {
    budget,
    update: updateBudget,
    refetch: refetchBudget,
  } = useBudget();

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      // If error or empty, keep empty array
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle filter changes (sync month with useSummary)
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.month && newFilters.month !== month) {
      setMonth(newFilters.month);
    }
  };

  // Add Transaction
  const handleAdd = async (txData) => {
    await addTx(txData);
    setShowAddForm(false);
    refetchSummary();
    refetchBudget();
    loadCategories();
  };

  // Update Transaction
  const handleUpdate = async (txData) => {
    if (editingTransaction?.id) {
      await updateTx(editingTransaction.id, txData);
      setEditingTransaction(null);
      refetchSummary();
      refetchBudget();
      loadCategories();
    }
  };

  // Delete Transaction
  const handleDelete = async (id) => {
    await removeTx(id);
    refetchSummary();
    refetchBudget();
  };

  // Add New Category
  const handleAddCategory = async (name) => {
    try {
      const res = await apiAddCategory(name);
      toast.success(`Category "${name}" added`);
      loadCategories();
      return res;
    } catch (e) {
      // Error handled by interceptor
    }
  };

  // Seed sample data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedData();
      toast.success('Sample data loaded successfully!');
      refetchTransactions();
      refetchSummary();
      refetchBudget();
      loadCategories();
    } catch (e) {
      // Handled by axios interceptor
    } finally {
      setIsSeeding(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportCsv(month);
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <h1>💰 Finance Tracker</h1>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSeedData}
            disabled={isSeeding}
            title="Load sample transactions and budget"
          >
            {isSeeding ? 'Loading...' : '📥 Load Sample Data'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCsv}
            title="Export transactions to CSV"
          >
            📄 Export CSV
          </button>

          <button
            type="button"
            className="btn btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ fontSize: '1rem', width: '34px', height: '34px' }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="app-layout">
        {/* Mobile View Toggle */}
        <div className="mobile-view-toggle">
          <button
            type="button"
            className={`mobile-toggle-btn ${mobileTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setMobileTab('transactions')}
          >
            Transactions
          </button>
          <button
            type="button"
            className={`mobile-toggle-btn ${mobileTab === 'overview' ? 'active' : ''}`}
            onClick={() => setMobileTab('overview')}
          >
            Overview & Charts
          </button>
        </div>

        {/* Sidebar: Summary Cards, Budget, Charts */}
        <aside className={`sidebar ${mobileTab === 'transactions' ? 'mobile-hidden' : ''}`}>
          <SummaryCards summary={summary} loading={summaryLoading} />
          <BudgetBar
            budget={budget}
            totalExpenses={summary?.totalExpenses ?? 0}
            onBudgetChange={updateBudget}
          />
          <Charts
            summary={summary}
            history={history}
            loading={summaryLoading}
          />
        </aside>

        {/* Content: Filters, Forms, List */}
        <section className={`content ${mobileTab === 'overview' ? 'mobile-hidden' : ''}`}>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            categories={categories}
          />

          <div className="content-top-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (editingTransaction) setEditingTransaction(null);
              }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add Transaction'}
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
            </span>
          </div>

          {showAddForm && (
            <TransactionForm
              categories={categories}
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              onAddCategory={handleAddCategory}
            />
          )}

          {editingTransaction && (
            <TransactionForm
              initialValues={editingTransaction}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTransaction(null)}
              onAddCategory={handleAddCategory}
            />
          )}

          <TransactionList
            transactions={transactions}
            loading={txLoading}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setShowAddForm(false);
              // On mobile, switch to transactions view to show the form
              setMobileTab('transactions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDelete={handleDelete}
            categories={categories}
          />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
