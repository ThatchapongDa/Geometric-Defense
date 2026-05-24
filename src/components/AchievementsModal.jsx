// src/components/AchievementsModal.jsx
// Achievements modal dialog displaying list of locked/unlocked trophies
import React from 'react';
import { ACHIEVEMENT_DEFS } from '../hooks/useGameState';

export default function AchievementsModal({ state, onClose }) {
  const { achievements = {} } = state;
  const unlockedCount = Object.keys(achievements || {}).length;
  const totalCount = Object.keys(ACHIEVEMENT_DEFS).length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass animate-waveIn"
        style={{
          width: 440,
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          background: 'linear-gradient(135deg, rgba(20,24,35,0.95), rgba(7,11,20,0.95))',
          border: '1.5px solid rgba(240, 180, 41, 0.3)',
          borderRadius: 16,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span style={{
              fontSize: 16, fontWeight: 800,
              fontFamily: 'Orbitron, monospace',
              color: '#F0B429',
              letterSpacing: '1px',
            }}>Achievements</span>
          </div>
          <span style={{
            fontSize: '11px',
            fontFamily: 'Orbitron, monospace',
            fontWeight: 700,
            color: '#F0B429',
            background: 'rgba(240,180,41,0.12)',
            padding: '3px 10px',
            borderRadius: '10px',
          }}>
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {/* Scrollable list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '340px',
          overflowY: 'auto',
          paddingRight: '6px',
          marginBottom: 20,
        }}>
          {Object.entries(ACHIEVEMENT_DEFS).map(([id, def]) => {
            const isUnlocked = !!achievements[id];
            return (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'rgba(240,180,41,0.05)' : 'rgba(255,255,255,0.02)',
                  border: isUnlocked ? '1.5px solid rgba(240,180,41,0.25)' : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: isUnlocked ? '0 0 12px rgba(240,180,41,0.05)' : 'none',
                  opacity: isUnlocked ? 1 : 0.45,
                }}
              >
                <span style={{
                  fontSize: '28px',
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                }}>{def.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: isUnlocked ? '#F0B429' : '#ccc' }}>
                    {def.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {def.desc}
                  </span>
                </div>
                {isUnlocked && (
                  <span style={{ marginLeft: 'auto', color: '#F0B429', fontWeight: 700 }}>✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #F0B429, #D4901A)',
            color: '#000',
            fontWeight: 800,
            border: 'none',
            fontFamily: 'Orbitron, monospace',
            fontSize: '13px',
            padding: '10px',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(240, 180, 41, 0.25)',
          }}
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
