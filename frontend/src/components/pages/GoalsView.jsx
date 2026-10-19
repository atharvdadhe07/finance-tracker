import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../SummaryCards';

export default function GoalsView() {
  const [goals, setGoals] = useState([
    { id: 1, name: 'Vacation Goal', target: 2000, saved: 1500, percentage: 75 },
    { id: 2, name: 'Emergency Fund', target: 10000, saved: 4000, percentage: 40 },
    { id: 3, name: 'Tech Ecosystem', target: 3500, saved: 2800, percentage: 80 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    const t = parseFloat(newGoalTarget);
    const s = parseFloat(newGoalSaved) || 0;
    if (newGoalName.trim() && !isNaN(t) && t > 0) {
      const pct = Math.min(Math.round((s / t) * 100), 100);
      setGoals([
        ...goals,
        { id: Date.now(), name: newGoalName.trim(), target: t, saved: s, percentage: pct },
      ]);
      toast.success(`Goal "${newGoalName}" created!`);
      setShowAddModal(false);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalSaved('');
    }
  };

  return (
    <div className="goals-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Savings Goals</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Reserves &amp; Wealth Milestones</div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {goals.map((goal) => (
          <div key={goal.id} className="tracker-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{goal.name}</h4>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Target: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.target)}</strong>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Saved: <strong className="amount-income">{formatCurrency(goal.saved)}</strong>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="circular-progress-box">
              {goal.percentage}%
            </div>
          </div>
        ))}
      </div>

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">+ Create Savings Target</h3>
            <form onSubmit={handleAddGoal}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. New Car, House Downpayment"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="form-control"
                  placeholder="5000"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Amount Saved ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  placeholder="1000"
                  value={newGoalSaved}
                  onChange={(e) => setNewGoalSaved(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
