import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useSummary } from './hooks/useSummary';
import { useBudget } from './hooks/useBudget';
import { getCategories, addCategory as apiAddCategory, seedData, exportCsv } from './api';

import {
  IconWallet,
  IconDashboard,
  IconAnalytics,
  IconBudgets,
  IconCards,
  IconGoals,
  IconSettings,
  IconBell,
  IconPlus,
  IconDownload,
} from './components/ui/Icons';

import DashboardView from './components/pages/DashboardView';
import AnalyticsView from './components/pages/AnalyticsView';
import BudgetsView from './components/pages/BudgetsView';
import CardsView from './components/pages/CardsView';
import GoalsView from './components/pages/GoalsView';

import FilterBar from './components/FilterBar';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';

function MainApp() {
  const { dark, toggle: toggleTheme } = useTheme();
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics' | 'budgets' | 'cards' | 'goals' | 'transactions'

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

  // Core data hooks
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

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      // Ignore initial empty error
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle filter changes
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

  // Add Category
  const handleAddCategory = async (name) => {
    try {
      const res = await apiAddCategory(name);
      toast.success(`Category "${name}" created`);
      loadCategories();
      return res;
    } catch (e) {
      // Handled by axios interceptor
    }
  };

  // Seed sample data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedData();
      toast.success('Sample data loaded into Redis!');
      refetchTransactions();
      refetchSummary();
      refetchBudget();
      loadCategories();
    } finally {
      setIsSeeding(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportCsv(month);
    toast.success('Exporting transactions to CSV...');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { id: 'analytics', label: 'Analytics', icon: <IconAnalytics /> },
    { id: 'budgets', label: 'Budgets', icon: <IconBudgets /> },
    { id: 'cards', label: 'Cards', icon: <IconCards /> },
    { id: 'goals', label: 'Goals', icon: <IconGoals /> },
    { id: 'transactions', label: 'Transactions', icon: <span style={{ fontSize: '1rem' }}>📋</span> },
  ];

  return (
    <div className="tracker-app">
      {/* Left Sidebar */}
      <aside className="app-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <IconWallet size={20} />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">Daily Finance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tracker</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="nav-item"
            onClick={handleSeedData}
            disabled={isSeeding}
            style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            title="Seed transactions into Redis"
          >
            <span>✨</span>
            <span>{isSeeding ? 'Seeding...' : 'Load Sample Data'}</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={handleExportCsv}
            style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            title="Download CSV export"
          >
            <IconDownload size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={toggleTheme}
            style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
          >
            <span>{dark ? '☀️' : '🌙'}</span>
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Area */}
      <main className="app-main">
        {/* Top App Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h2>
              {activeTab === 'dashboard'
                ? 'Welcome back, Alex!'
                : activeTab === 'analytics'
                ? 'Spend Analytics'
                : activeTab === 'budgets'
                ? 'Budgets & Limits'
                : activeTab === 'cards'
                ? 'My Wallet & Savings'
                : activeTab === 'goals'
                ? 'Savings Goals'
                : 'All Transactions'}
            </h2>
          </div>

          <div className="top-bar-actions">
            {/* Quick Add Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              <IconPlus size={15} />
              <span>Add Transaction</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              className="btn-icon"
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <IconBell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-red)',
                }}
              />
            </button>

            {/* User Profile Avatar */}
            <div className="user-profile-badge">
              <div className="avatar-circle">A</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, paddingRight: '0.35rem' }}>
                Alex
              </span>
            </div>
          </div>
        </header>

        {/* View Body */}
        <div className="view-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              transactions={transactions}
              onAddClick={() => setShowAddForm(true)}
              onEditTransaction={(tx) => setEditingTransaction(tx)}
              onDeleteTransaction={(tx) => handleDelete(tx.id)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              summary={summary}
              history={history}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budget={budget}
              totalExpenses={summary?.totalExpenses ?? 0}
              onBudgetChange={updateBudget}
            />
          )}

          {activeTab === 'cards' && (
            <CardsView />
          )}

          {activeTab === 'goals' && (
            <GoalsView />
          )}

          {activeTab === 'transactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                categories={categories}
              />
              <TransactionList
                transactions={transactions}
                loading={txLoading}
                onEdit={(tx) => setEditingTransaction(tx)}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Transaction Modal Overlay */}
      {(showAddForm || editingTransaction) && (
        <div className="modal-overlay" onClick={() => { setShowAddForm(false); setEditingTransaction(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '1.25rem' }}>
            <TransactionForm
              categories={categories}
              initialValues={editingTransaction}
              onSubmit={editingTransaction ? handleUpdate : handleAdd}
              onCancel={() => { setShowAddForm(false); setEditingTransaction(null); }}
              onAddCategory={handleAddCategory}
            />
          </div>
        </div>
      )}
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
