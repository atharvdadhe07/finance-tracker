import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClass = size === 'sm' ? 'spinner sm' : size === 'lg' ? 'spinner lg' : 'spinner';

  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className={sizeClass}></div>
      {message && <span style={{ fontSize: '0.875rem' }}>{message}</span>}
    </div>
  );
}
