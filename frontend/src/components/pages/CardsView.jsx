import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function CardsView() {
  const [activeCardTab, setActiveCardTab] = useState('Virtual Card');
  const [isFrozen, setIsFrozen] = useState(false);

  const handleFreezeToggle = () => {
    setIsFrozen(!isFrozen);
    toast.success(!isFrozen ? 'Card has been frozen temporarily' : 'Card has been un-frozen');
  };

  const handleViewPin = () => {
    toast('Your virtual card PIN is: 8492', { icon: '🔐' });
  };

  const handleLimits = () => {
    toast('Daily limit: $2,500.00 / Monthly limit: $10,000.00', { icon: '⚙️' });
  };

  return (
    <div className="cards-view-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
        {['Virtual Card', 'Debit Card'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveCardTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeCardTab === tab ? 'var(--accent-green)' : 'transparent',
              color: activeCardTab === tab ? '#ffffff' : 'var(--text-secondary)',
              transition: 'var(--transition)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards Pair Preview */}
      <div className="card-wrapper-pair">
        {/* Virtual Card */}
        <div className="luxury-bank-card virtual">
          <div className="bank-card-top">
            <span>Virtual</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Multi-Currency</span>
          </div>

          <div className="bank-card-number">
            •••• •••• •••• 9284
          </div>

          <div className="bank-card-bottom">
            <div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>Expiry</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>05/29</div>
            </div>

            <div className="card-mastercard-circles">
              <span className="circle red" />
              <span className="circle yellow" />
            </div>
          </div>
        </div>

        {/* Debit Card */}
        <div className="luxury-bank-card debit">
          <div className="bank-card-top">
            <span>Debit</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Primary Account</span>
          </div>

          <div className="bank-card-number">
            •••• •••• •••• 4129
          </div>

          <div className="bank-card-bottom">
            <div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>Expiry</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>09/28</div>
            </div>

            <div className="card-mastercard-circles">
              <span className="circle red" />
              <span className="circle yellow" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Details & Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Card Details Card */}
        <div className="tracker-card">
          <h3 className="tracker-card-title" style={{ marginBottom: '1rem' }}>Card Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Card Number:</span>
              <span className="num" style={{ fontWeight: 600 }}>•••• •••• •••• 4821</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expiry Date:</span>
              <span style={{ fontWeight: 600 }}>Jun 28</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cardholder:</span>
              <span style={{ fontWeight: 600 }}>Alex Morgan</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: isFrozen ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 700 }}>
                {isFrozen ? '● Frozen' : '● Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="tracker-card">
          <h3 className="tracker-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleFreezeToggle}
              style={{ flexDirection: 'column', padding: '1rem 0.5rem', gap: '0.4rem', height: 'auto' }}
            >
              <span style={{ fontSize: '1.25rem' }}>{isFrozen ? '🔓' : '❄️'}</span>
              <span style={{ fontSize: '0.775rem' }}>{isFrozen ? 'Unfreeze' : 'Freeze'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleViewPin}
              style={{ flexDirection: 'column', padding: '1rem 0.5rem', gap: '0.4rem', height: 'auto' }}
            >
              <span style={{ fontSize: '1.25rem' }}>🔑</span>
              <span style={{ fontSize: '0.775rem' }}>View Pin</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLimits}
              style={{ flexDirection: 'column', padding: '1rem 0.5rem', gap: '0.4rem', height: 'auto' }}
            >
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <span style={{ fontSize: '0.775rem' }}>Limits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
