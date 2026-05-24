// src/components/AchievementNotification.jsx
// Achievement unlock toast notification that slides in and auto-dismisses
import React, { useEffect } from 'react';

export default function AchievementNotification({ activeAchievement, onClose }) {
  useEffect(() => {
    if (activeAchievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeAchievement, onClose]);

  if (!activeAchievement) return null;

  const { label, desc, icon } = activeAchievement;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      background: 'linear-gradient(135deg, rgba(20,24,35,0.95), rgba(7,11,20,0.95))',
      border: '1.5px solid #F0B429',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(240, 180, 41, 0.25), 0 0 16px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(12px)',
      animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      color: '#fff',
      maxWidth: '320px',
    }}>
      {/* Icon with circular glowing backdrop */}
      <div style={{
        fontSize: '32px',
        background: 'rgba(240, 180, 41, 0.15)',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 0 12px rgba(240, 180, 41, 0.2)',
      }}>
        {icon}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#F0B429',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'Orbitron, sans-serif',
        }}>
          🏆 Achievement Unlocked!
        </span>
        <span style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'Orbitron, sans-serif',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '12px',
          color: '#A0AEC0',
          lineHeight: 1.4,
        }}>
          {desc}
        </span>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#718096',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '4px',
          alignSelf: 'flex-start',
          marginLeft: 'auto',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = '#718096'}
      >
        ✕
      </button>

      {/* Slide-in keyframe animation inserted dynamically */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
