// src/components/HUD.jsx
// Top HUD bar: HP, Energy, Wave, Score, Units placed, Pause controls, Speed controls

import React from 'react';
import { MAPS, generateWave } from '../constants/waves';

const SPEED_OPTIONS = [1, 1.5, 2];

export default function HUD({ state, actions, onOpenSettings, onOpenAchievements, onSave, onOpenEnemyInfo, onOpenBuffInfo, onOpenUnitGallery, onQuitToMenu }) {
  const { hp, maxHp, energy, wave, score, speed, waveActive, betweenWaves, phase, achievements, paused } = state;
  const hpPct = (hp / maxHp) * 100;
  const unlockedCount = Object.keys(achievements || {}).length;
  const totalCount = 7; // We have 7 achievements in ACHIEVEMENT_DEFS

  // Calculate total enemies in current wave
  const groups = generateWave(wave, state.mapId);
  const totalEnemies = groups.reduce((acc, g) => acc + g.count, 0);

  // Deployed units count
  const deployedCount = Object.keys(state.units || {}).length;
  const maxUnits = (MAPS[state.mapId]?.maxUnits || 8) + (state.activeBuffs?.deploymentLimit || 0);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <span style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '13px',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #E8643A, #9B7FDD)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '1px',
        whiteSpace: 'nowrap',
      }}>
        GEO DEF
      </span>

      <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

      {/* HP */}
      <StatBlock
        icon="❤️"
        label="BASE HP"
        value={`${hp}/${maxHp}`}
        barPct={hpPct}
        barColor={hpPct > 50 ? '#2ECC97' : hpPct > 25 ? '#F39C12' : '#E74C3C'}
        color="var(--col-hp)"
      />

      {/* Energy */}
      <StatBlock
        icon="⚡"
        label="ENERGY"
        value={energy}
        color="var(--col-energy)"
      />

      {/* Wave */}
      <StatBlock
        icon="🌊"
        label="WAVE"
        value={wave + 1}
        color="var(--col-wave)"
      />

      {/* Enemies Killed / Total */}
      <StatBlock
        icon="👾"
        label="ENEMIES"
        value={waveActive ? `${state.waveEnemiesKilled || 0}/${totalEnemies}` : `Total: ${totalEnemies}`}
        color="#9B7FDD"
        minWidth={78}
      />

      {/* Deployed Units count (Deployment Limit) */}
      <StatBlock
        icon="👥"
        label="UNITS"
        value={`${deployedCount}/${maxUnits}`}
        color={deployedCount >= maxUnits ? '#E74C3C' : '#00D4FF'}
        glow={state.activeBuffs?.deploymentLimit > 0}
        extraLabel={state.activeBuffs?.deploymentLimit > 0 ? `(+${state.activeBuffs.deploymentLimit})` : ''}
      />

      {/* Score */}
      <StatBlock
        icon="🏆"
        label="SCORE"
        value={score.toLocaleString()}
        color="var(--col-score)"
      />

      <div style={{ flex: 1 }} />

      {/* Wave start / between waves */}
      {betweenWaves && phase === 'playing' && (
        <button
          className="btn btn-primary animate-pulse"
          id="btn-start-wave"
          onClick={actions.startWave}
          style={{ fontSize: '13px', padding: '7px 20px' }}
        >
          ▶ Start Wave {wave + 1}
        </button>
      )}

      {/* Modals Triggers */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={onOpenUnitGallery}
            title="คลังภาพตัวละคร & Splash Art"
            style={{ padding: '6px 10px', fontSize: '13px' }}
          >🎴</button>
          <button
            className="btn btn-secondary"
            onClick={onOpenEnemyInfo}
            title="สารานุกรมข้อมูลศัตรู"
            style={{ padding: '6px 10px', fontSize: '13px' }}
          >📖</button>
          <button
            className="btn btn-secondary"
            onClick={onOpenBuffInfo}
            title="ดูบัฟและดีบัพที่เลือกไปแล้ว"
            style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ⚡ <span style={{ fontSize: '11px', fontWeight: 700 }}>บัฟ & ดีบัพ ({
              Object.values(state?.activeBuffs || {}).filter(v => v > 0).length + 
              Object.keys(state?.selectedContracts || {}).filter(k => state?.selectedContracts[k]).length
            })</span>
          </button>
        </div>
      )}

      {/* Pause Button */}
      {phase === 'playing' && (
        <button
          className={`btn ${paused ? 'btn-danger animate-pulse' : 'btn-secondary'}`}
          id="btn-pause"
          onClick={() => actions.setPaused(!paused)}
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: paused ? '0 0 12px rgba(231,76,60,0.4)' : 'none',
          }}
        >
          {paused ? '▶ RESUME' : '⏸️ PAUSE'}
        </button>
      )}

      {/* Quit Button */}
      {phase === 'playing' && (
        <button
          className="btn btn-secondary"
          onClick={onQuitToMenu}
          title="ออกจากเกมกลับเมนูหลัก"
          style={{ padding: '6px 10px', fontSize: '13px', color: '#E74C3C' }}
        >🏠</button>
      )}

      {/* Speed controls */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            className={`btn ${speed === s ? 'btn-gold' : 'btn-secondary'}`}
            id={`btn-speed-${s}`}
            onClick={() => actions.setSpeed(s)}
            style={{ padding: '5px 10px', fontSize: '12px' }}
            disabled={paused} // disable speed changes when paused
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        className="btn btn-secondary"
        id="btn-save"
        onClick={onSave}
        title="Save game"
        style={{ padding: '6px 10px', fontSize: '13px' }}
      >💾</button>

      {/* Achievements / Trophies */}
      <button
        className="btn btn-secondary"
        id="btn-achievements"
        onClick={onOpenAchievements}
        title="Achievements"
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          background: 'linear-gradient(135deg, rgba(240,180,41,0.15), rgba(212,144,26,0.15))',
          border: '1px solid rgba(240,180,41,0.4)',
          color: '#F0B429',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        🏆 <span style={{ fontWeight: 700 }}>{unlockedCount}/{totalCount}</span>
      </button>

      {/* Settings */}
      <button
        className="btn btn-secondary"
        id="btn-settings"
        onClick={onOpenSettings}
        style={{ padding: '6px 10px', fontSize: '13px' }}
      >⚙️</button>
    </div>
  );
}

function StatBlock({ icon, label, value, barPct, barColor, color, minWidth, glow, extraLabel }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: minWidth || 64,
      padding: glow ? '2px 8px' : '0px',
      background: glow ? 'rgba(240, 180, 41, 0.08)' : 'transparent',
      borderRadius: glow ? '6px' : '0px',
      border: glow ? '1px solid rgba(240, 180, 41, 0.3)' : 'none',
      boxShadow: glow ? '0 0 10px rgba(240, 180, 41, 0.15)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '12px' }}>{icon}</span>
        <span style={{ fontSize: '9px', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {label} {extraLabel && <span style={{ color: '#F0B429', fontWeight: 800 }}>{extraLabel}</span>}
        </span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'Orbitron, monospace' }}>
        {value}
      </span>
      {barPct !== undefined && (
        <div className="progress-bar" style={{ width: '100%', marginTop: 2 }}>
          <div
            className="progress-fill"
            style={{ width: `${barPct}%`, background: barColor }}
          />
        </div>
      )}
    </div>
  );
}
