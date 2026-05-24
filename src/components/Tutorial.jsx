// src/components/Tutorial.jsx
// 6-step interactive tutorial overlay

import React from 'react';

const STEPS = [
  {
    title: 'Welcome to Geometric Defense!',
    content: 'Defend your base against waves of geometric enemies. Place units on the grid to attack enemies as they travel along the glowing paths.',
    highlight: null,
    icon: '🎮',
  },
  {
    title: 'Select a Unit',
    content: 'Click any unit card in the left panel to select it. Each unit has a unique role — Triangle for damage, Square for blocking, Circle for healing, Pentagon for AOE, and Hexagon for slowing.',
    highlight: '#unit-btn-triangle',
    icon: '▲',
  },
  {
    title: 'Place Units on the Grid',
    content: 'After selecting a unit, click any empty cell on the grid (not on a path!) to place it. Units cost Energy — earn more by defeating enemies.',
    highlight: '#game-canvas',
    icon: '📍',
  },
  {
    title: 'Upgrade Your Units',
    content: 'Click a placed unit to see its stats. Upgrade to Tier II or Tier III to boost damage, HP, and range. Tier III unlocks a powerful special skill!',
    highlight: null,
    icon: '⬆️',
  },
  {
    title: 'Start Waves',
    content: 'Click "Start Wave" in the top bar when you\'re ready. Enemies follow the colored paths. If they reach the right edge, you lose Base HP!',
    highlight: '#btn-start-wave',
    icon: '🌊',
  },
  {
    title: 'Unlock Achievements & Combos',
    content: 'Click the 🏆 Trophy button in the top bar to view Achievements! Deploy adjacent units to trigger powerful synergies like the "Melee Vanguard" (+20% Guard Attack Speed).',
    highlight: '#btn-achievements',
    icon: '🏆',
  },
];

export default function Tutorial({ step, onNext, onSkip }) {
  if (step >= STEPS.length) return null;
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 0 24px 0',
    }}>
      <div
        className="glass animate-fadeIn"
        style={{
          width: 440,
          padding: '20px 24px',
          border: '1px solid rgba(155,127,221,0.3)',
          boxShadow: '0 -8px 40px rgba(155,127,221,0.15)',
          pointerEvents: 'auto',
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? '#9B7FDD' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {s.content}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onSkip} style={{ fontSize: 12 }}>
            Skip Tutorial
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            style={{ fontSize: 12, padding: '7px 20px' }}
          >
            {isLast ? '✓ Got it!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
