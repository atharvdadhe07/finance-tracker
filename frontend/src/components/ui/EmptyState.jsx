import React from 'react';

export default function EmptyState({ icon = '📂', title = 'No data available', subtitle = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
    </div>
  );
}
