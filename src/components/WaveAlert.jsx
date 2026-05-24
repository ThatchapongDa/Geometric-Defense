// src/components/WaveAlert.jsx
// Wave incoming banner animation

import React, { useEffect, useState } from 'react';
import { isBossWave } from '../constants/waves';

export default function WaveAlert({ wave, visible }) {
  const [show, setShow] = useState(false);
  const boss = isBossWave(wave);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(t);
    }
  }, [visible, wave]);

  if (!show) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 40,
    }}>
      <div style={{
        padding: '16px 40px',
        background: boss
          ? 'linear-gradient(135deg, rgba(142,68,173,0.9), rgba(44,62,80,0.9))'
          : 'linear-gradient(135deg, rgba(232,100,58,0.9), rgba(20,30,55,0.9))',
        border: `2px solid ${boss ? '#8E44AD' : '#E8643A'}`,
        borderRadius: 12,
        boxShadow: `0 0 60px ${boss ? '#8E44AD88' : '#E8643A88'}`,
        animation: 'waveIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        {boss && <div style={{ fontSize: 28, marginBottom: 4 }}>⚠️</div>}
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: boss ? 26 : 22,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '2px',
          textShadow: `0 0 20px ${boss ? '#8E44AD' : '#E8643A'}`,
        }}>
          {boss ? '⚡ BOSS WAVE' : `WAVE ${wave + 1}`}
        </div>
        {boss && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Prepare for a powerful enemy!
          </div>
        )}
      </div>
    </div>
  );
}
