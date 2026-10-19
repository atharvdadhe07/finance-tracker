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

  return (
    <div className="card filter-bar-card" style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Month Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="filter-month">
            Month
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
            Type
          </label>
          <select
            id="filter-type"
            className="form-control"
            value={filters.type || ''}
            onChange={(e) => handleFieldChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
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
            Search Notes
          </label>
          <input
            id="filter-search"
            type="text"
            className="form-control"
            placeholder="Search notes..."
            value={filters.q || ''}
            onChange={(e) => handleFieldChange('q', e.target.value)}
          />
        </div>

        {/* Clear Filters Button */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            style={{ width: '100%' }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
