import React from 'react';
import { format } from 'date-fns';

export default function FilterBar({ filters, onChange, categories = [] }) {
  const currentMonth = format(new Date(), 'yyyy-MM');

  const handleFieldChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClear = () => {
    onChange({
      month: currentMonth,
      type: '',
      category: '',
      q: '',
    });
  };

  const hasActiveFilters =
    filters.type !== '' ||
    filters.category !== '' ||
    (filters.q && filters.q.trim() !== '') ||
    (filters.month && filters.month !== currentMonth);

  return (
    <div
      className="card filter-bar-card"
      style={{
        marginBottom: '1.25rem',
        padding: '1.15rem',
        background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.02) 100%)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Month Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-month">
            Period
          </label>
          <input
            id="filter-month"
            type="month"
            className="form-control"
            value={filters.month || currentMonth}
            onChange={(e) => handleFieldChange('month', e.target.value)}
          />
        </div>

        {/* Type Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-type">
            Flow Type
          </label>
          <select
            id="filter-type"
            className="form-control"
            value={filters.type || ''}
            onChange={(e) => handleFieldChange('type', e.target.value)}
          >
            <option value="">All Flows</option>
            <option value="INCOME">✦ Income (Inflow)</option>
            <option value="EXPENSE">● Expense (Outflow)</option>
          </select>
        </div>

        {/* Category Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-category">
            Category
          </label>
          <select
            id="filter-category"
            className="form-control"
            value={filters.category || ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => {
              const name = typeof cat === 'string' ? cat : cat.name;
              const id = typeof cat === 'object' && cat.id ? cat.id : idx;
              return (
                <option key={id} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Search Notes Input */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-search">
            Search
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filter-search"
              type="text"
              className="form-control"
              placeholder="Search memo & notes..."
              value={filters.q || ''}
              onChange={(e) => handleFieldChange('q', e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                fontSize: '0.85rem',
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Reset / Clear Button */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            style={{
              width: '100%',
              opacity: hasActiveFilters ? 1 : 0.6,
              cursor: hasActiveFilters ? 'pointer' : 'default',
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
