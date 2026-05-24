// src/components/Stage4ClearedScreen.jsx
// Stunning cinematic victory screen showing HELLO WORLD for Stage 4

import React from 'react';

export default function Stage4ClearedScreen({ score, hp, maxHp, onRestart, onMainMenu }) {
  const hpPct = Math.round((hp / maxHp) * 100);
  const stars = hpPct === 100 ? 3 : hpPct > 50 ? 2 : 1;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(13, 27, 62, 0.98) 0%, rgba(5, 7, 12, 1) 100%)',
      backdropFilter: 'blur(20px)',
      color: '#fff',
      padding: '24px 16px',
      overflowY: 'auto',
      animation: 'fadeIn 0.8s ease-out forwards',
    }}>
      {/* Cinematic neon glowing title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(44px, 8vw, 88px)',
          fontWeight: 900,
          letterSpacing: '8px',
          background: 'linear-gradient(135deg, #00D4FF 0%, #E8643A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 24px rgba(0, 212, 255, 0.6), 0 0 48px rgba(0, 212, 255, 0.2)',
          margin: '0 0 12px 0',
          lineHeight: 1.0,
          animation: 'pulseGlow 2.5s infinite ease-in-out',
        }}>
          HELLO WORLD
        </h1>
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(11px, 2.5vw, 14px)',
          letterSpacing: '3px',
          color: '#E8643A',
          textShadow: '0 0 8px rgba(232, 100, 58, 0.4)',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          ★ Special Stage Cleared Successfully ★
        </div>
      </div>

      {/* Battle Report Box */}
      <div className="glass" style={{
        padding: '32px 40px',
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(7, 11, 20, 0.82)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        boxShadow: '0 12px 40px rgba(0, 212, 255, 0.08)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        textAlign: 'center',
        marginTop: '24px',
        animation: 'fadeUp 0.6s ease-out forwards 0.3s',
        opacity: 0,
      }}>
        {/* Star Rating display */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          fontSize: '36px',
        }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              style={{
                color: i < stars ? '#FFD700' : 'rgba(255,255,255,0.08)',
                textShadow: i < stars ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none',
                transform: i < stars ? 'scale(1.15) rotate(0deg)' : 'none',
                display: 'inline-block',
                transition: 'all 0.5s ease',
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Detailed Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          background: 'rgba(0,0,0,0.35)',
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.03)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Final Score
            </span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#00D4FF', fontFamily: 'Orbitron, monospace' }}>
              {score.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Base HP Left
            </span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#2ECC97', fontFamily: 'Orbitron, monospace' }}>
              {hpPct}%
            </span>
          </div>
        </div>

        {/* Victory Message */}
        <p style={{
          fontSize: '13px',
          color: '#A0AEC0',
          lineHeight: '1.6',
          margin: 0,
          padding: '0 8px',
        }}>
          ยินดีด้วย! คุณสามารถต้านทานภัยคุกคามในเขตพิเศษเสื่อมโทรม Deserted Sector ได้สำเร็จ ด่านการบุกเวฟพิเศษนี้ถูกกำราบด้วยสติปัญญาและแผนกลยุทธ์อันยอดเยี่ยมของคุณแล้ว!
        </p>

        {/* Buttons layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={onRestart}
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '12px',
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(135deg, #00D4FF 0%, #008CBF 100%)',
              boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
              border: 'none',
              letterSpacing: '1px',
            }}
          >
            ↺ Replay Stage 4
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={onMainMenu}
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '12px',
              fontFamily: 'Orbitron, monospace',
              border: '1px solid rgba(255,255,255,0.1)',
              letterSpacing: '1px',
            }}
          >
            🏠 Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
