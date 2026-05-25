// src/components/SettingsPanel.jsx
// Settings overlay: API key, sound toggle, volume

import React from 'react';

export default function SettingsPanel({ state, actions, onClose }) {
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
        style={{ width: 400, padding: '24px', boxShadow: 'var(--shadow-panel)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{
            fontSize: 16, fontWeight: 800,
            fontFamily: 'Orbitron, monospace',
            color: 'var(--text-primary)',
          }}>⚙️ Settings</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>


        {/* Sound settings */}
        <Section title="🔊 Audio">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>Sound Effects</label>
            <ToggleSwitch
              id="toggle-sound"
              value={state.soundEnabled}
              onChange={actions.setSound}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>Volume</label>
            <input
              id="slider-volume"
              type="range"
              min="0" max="1" step="0.05"
              value={state.volume}
              onChange={e => actions.setVolume(parseFloat(e.target.value))}
              style={{ width: 120, accentColor: '#9B7FDD' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 30 }}>
              {Math.round(state.volume * 100)}%
            </span>
          </div>
        </Section>

        {/* Theme settings */}
        <Section title="🎨 Themes (ปรับเปลี่ยนธีม)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
              Black & White (ภาพขาว-ดำ)
            </label>
            <ToggleSwitch
              id="toggle-bw-theme"
              value={state.grayscaleTheme || false}
              onChange={(val) => {
                actions.setGrayscaleTheme(val);
                if (val) {
                  document.body.classList.add('theme-grayscale');
                } else {
                  document.body.classList.remove('theme-grayscale');
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
              Light Theme (ธีมสว่างอ่านง่าย)
            </label>
            <ToggleSwitch
              id="toggle-light-theme"
              value={state.lightTheme || false}
              onChange={(val) => {
                actions.setLightTheme(val);
                if (val) {
                  document.body.classList.add('theme-light');
                } else {
                  document.body.classList.remove('theme-light');
                }
              }}
            />
          </div>
        </Section>

        {/* Save / Load */}
        <Section title="💾 Save / Load">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { actions.saveGame(); onClose(); }}>
              Save Game
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { actions.loadGame(); onClose(); }}>
              Load Game
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Save includes: wave progress, units, energy, score.
          </div>
        </Section>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ id, value, onChange }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? '#2ECC97' : 'rgba(255,255,255,0.1)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: value ? 22 : 3,
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }} />
    </button>
  );
}
