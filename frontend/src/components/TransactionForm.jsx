import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { getCategoryMeta } from './TransactionList';

export default function TransactionForm({
  categories = [],
  onSubmit,
  initialValues = null,
  onCancel,
  onAddCategory,
}) {
  const isEditMode = Boolean(initialValues && initialValues.id);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: todayStr,
    note: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    if (initialValues) {
      let formattedDate = todayStr;
      if (initialValues.date) {
        try {
          formattedDate = format(new Date(initialValues.date), 'yyyy-MM-dd');
        } catch (e) {
          formattedDate = initialValues.date.substring(0, 10);
        }
      }
      setFormData({
        amount: initialValues.amount !== undefined ? initialValues.amount.toString() : '',
        type: initialValues.type || 'EXPENSE',
        category: initialValues.category || '',
        date: formattedDate,
        note: initialValues.note || '',
      });
    } else {
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0].name) : 'Food',
        date: todayStr,
        note: '',
      });
    }
    setErrors({});
  }, [initialValues, categories]);

  const validate = () => {
    const errs = {};
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.type) {
      errs.type = 'Flow type is required';
    }

    if (!formData.category || !formData.category.trim()) {
      errs.category = 'Category selection is required';
    }

    if (!formData.date) {
      errs.date = 'Date is required';
    } else {
      try {
        const selectedDate = startOfDay(parseISO(formData.date));
        const today = startOfDay(new Date());
        if (isAfter(selectedDate, today)) {
          errs.date = 'Future dates are prohibited';
        }
      } catch (e) {
        errs.date = 'Invalid date format';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const catName = newCatInput.trim();
    if (onAddCategory) {
      await onAddCategory(catName);
    }
    setFormData((prev) => ({ ...prev, category: catName }));
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        note: formData.note ? formData.note.trim() : '',
      };

      await onSubmit(payload);

      if (!isEditMode) {
        setFormData({
          amount: '',
          type: 'EXPENSE',
          category: categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0].name) : 'Food',
          date: todayStr,
          note: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isIncome = formData.type === 'INCOME';

  return (
    <div
      className="card transaction-form-card"
      style={{
        marginBottom: '1.75rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow-hover)',
        background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.03) 100%)',
        padding: '1.5rem',
      }}
    >
      <div className="card-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h3 className="card-title" style={{ fontSize: '1.15rem', margin: 0 }}>
            {isEditMode ? '✏️ Edit Transaction Record' : '✦ Add Transaction to Ledger'}
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Instant update across all charts and balances
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Flow Type Segmented Switcher */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Flow Direction</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              background: 'var(--bg-secondary)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => handleChange('type', 'EXPENSE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                background: !isIncome ? 'var(--accent-red)' : 'transparent',
                color: !isIncome ? '#ffffff' : 'var(--text-muted)',
                boxShadow: !isIncome ? '0 4px 14px rgba(244, 63, 94, 0.35)' : 'none',
              }}
            >
              <span>↘ Outflow</span> (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'INCOME')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                background: isIncome ? 'var(--accent-green)' : 'transparent',
                color: isIncome ? '#ffffff' : 'var(--text-muted)',
                boxShadow: isIncome ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              }}
            >
              <span>↗ Inflow</span> (Income)
            </button>
          </div>
        </div>

        {/* Hero Amount Input */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="tx-amount">
            Transaction Amount ($)
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: isIncome ? 'var(--accent-green)' : 'var(--accent-red)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              $
            </span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={`form-control num ${errors.amount ? 'is-invalid' : ''}`}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                paddingLeft: '2.5rem',
                height: '52px',
                color: isIncome ? 'var(--accent-green)' : 'var(--accent-red)',
              }}
              required
            />
          </div>
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>

        {/* Category & Date Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Category Dropdown & Quick Add */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="tx-category">
                Category
              </label>
              <button
                type="button"
                className="btn-icon"
                style={{ fontSize: '0.75rem', height: 'auto', padding: '0.15rem 0.4rem', border: 'none', color: 'var(--brand-primary)', background: 'transparent' }}
                onClick={() => setShowAddCat(!showAddCat)}
              >
                {showAddCat ? '← Choose existing' : '+ Add custom'}
              </button>
            </div>

            {showAddCat ? (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="e.g. Investment, Freelance"
                  className="form-control"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCreateCategory}
                >
                  Create
                </button>
              </div>
            ) : (
              <select
                id="tx-category"
                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat, idx) => {
                  const name = typeof cat === 'string' ? cat : cat.name;
                  const id = typeof cat === 'object' && cat.id ? cat.id : idx;
                  const { icon } = getCategoryMeta(name);
                  return (
                    <option key={id} value={name}>
                      {icon} {name}
                    </option>
                  );
                })}
              </select>
            )}
            {errors.category && <div className="form-error">{errors.category}</div>}
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">
              Effective Date
            </label>
            <input
              id="tx-date"
              type="date"
              max={todayStr}
              className={`form-control ${errors.date ? 'is-invalid' : ''}`}
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>
        </div>

        {/* Note / Memo */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-note">
            Memo &amp; Notes (optional)
          </label>
          <textarea
            id="tx-note"
            rows="2"
            placeholder="Add recipient, vendor, invoice ref, or tags..."
            className="form-control"
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ minWidth: '160px' }}
          >
            {submitting
              ? 'Recording...'
              : isEditMode
              ? 'Update Record'
              : '✦ Save to Ledger'}
          </button>
        </div>
      </form>
    </div>
  );
}
