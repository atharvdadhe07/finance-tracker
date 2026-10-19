import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

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
        category: categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0].name) : '',
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
      errs.amount = 'Amount must be greater than 0';
    }

    if (!formData.type) {
      errs.type = 'Type is required';
    }

    if (!formData.category || !formData.category.trim()) {
      errs.category = 'Category is required';
    }

    if (!formData.date) {
      errs.date = 'Date is required';
    } else {
      try {
        const selectedDate = startOfDay(parseISO(formData.date));
        const today = startOfDay(new Date());
        if (isAfter(selectedDate, today)) {
          errs.date = 'Date cannot be in the future';
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
          category: categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0].name) : '',
          date: todayStr,
          note: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card transaction-form-card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <h3 className="card-title">
          {isEditMode ? '✏️ Edit Transaction' : '➕ Add New Transaction'}
        </h3>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-amount">
              Amount ($) *
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
            />
            {errors.amount && <div className="form-error">{errors.amount}</div>}
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-type">
              Type *
            </label>
            <select
              id="tx-type"
              className={`form-control ${errors.type ? 'is-invalid' : ''}`}
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            {errors.type && <div className="form-error">{errors.type}</div>}
          </div>

          {/* Category */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="tx-category">
                Category *
              </label>
              <button
                type="button"
                className="btn-icon"
                style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', border: 'none', color: 'var(--accent-blue)' }}
                onClick={() => setShowAddCat(!showAddCat)}
              >
                {showAddCat ? 'Select existing' : '+ New category'}
              </button>
            </div>

            {showAddCat ? (
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="text"
                  placeholder="New category name"
                  className="form-control"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCreateCategory}
                >
                  Add
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
                  return (
                    <option key={id} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            )}
            {errors.category && <div className="form-error">{errors.category}</div>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">
              Date *
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

        {/* Note */}
        <div className="form-group">
          <label className="form-label" htmlFor="tx-note">
            Note (optional)
          </label>
          <textarea
            id="tx-note"
            rows="2"
            placeholder="Add description or details..."
            className="form-control"
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
          >
            {submitting
              ? 'Saving...'
              : isEditMode
              ? 'Update Transaction'
              : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
