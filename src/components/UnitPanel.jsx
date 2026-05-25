// src/components/UnitPanel.jsx
// Left sidebar — unit selection palette

import React, { useState, useRef } from 'react';
import { UNIT_DATA, getUnitStats } from '../constants/units';
import { UNIT_SPRITES } from '../constants/sprites';
import UnitInfoModal from './UnitInfoModal';

const UNIT_ICONS = {
  triangle: '▲',
  square:   '■',
  circle:   '●',
  pentagon: '⬠',
  hexagon:  '⬡',
  diamond:  '◆',
};

const ROLE_LABELS = {
  dps:      'DPS',
  tank:     'Tank',
  healer:   'Healer',
  aoe:      'AOE',
  debuffer: 'Debuff',
  melee:    'Guard',
};

export default function UnitPanel({ state, actions }) {
  const { selectedUnitType, energy } = state;
  const [showInfoFor, setShowInfoFor] = useState(null);

  return (
    <div style={{
      width: 160,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px 8px',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: '10px',
        letterSpacing: '1px',
        color: 'var(--text-muted)',
        fontWeight: 700,
        padding: '0 4px 4px',
        borderBottom: '1px solid var(--border)',
      }}>
        DEPLOY UNIT
      </div>

      {Object.entries(UNIT_DATA).map(([type, data]) => {
        const stats = getUnitStats(type, 0);
        const canAfford = energy >= data.baseCost;
        const isSelected = selectedUnitType === type;

        return (
          <UnitCard
            key={type}
            type={type}
            data={data}
            stats={stats}
            icon={UNIT_ICONS[type]}
            isSelected={isSelected}
            canAfford={canAfford}
            onClick={() => {
              if (isSelected) actions.deselect();
              else if (canAfford) actions.selectUnitType(type);
            }}
            onLongPress={() => setShowInfoFor(type)}
          />
        );
      })}

      {showInfoFor && (
        <UnitInfoModal 
          type={showInfoFor}
          onClose={() => setShowInfoFor(null)} 
        />
      )}

      <div style={{
        marginTop: 'auto',
        padding: '8px 4px 0',
        borderTop: '1px solid var(--border)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>How to play</strong>
        Select a unit → click grid cell to place
        <br/>Click a placed unit to upgrade/sell
      </div>
    </div>
  );
}

function UnitCard({ type, data, stats, icon, isSelected, canAfford, onClick, onLongPress }) {
  const timerRef = useRef(null);
  const wasLongPress = useRef(false);
  const [imgError, setImgError] = React.useState(false);

  const startPress = (e) => {
    if (e.button === 2) return; // Right click
    wasLongPress.current = false;
    timerRef.current = setTimeout(() => {
      wasLongPress.current = true;
      onLongPress();
    }, 500);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e) => {
    if (wasLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  return (
    <button
      id={`unit-btn-${type}`}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); cancelPress(); onLongPress(); }} // Also allow right click to view info
      onClick={handleClick}
      disabled={!canAfford && !isSelected}
      style={{
        width: '100%',
        padding: '10px 8px',
        background: isSelected
          ? `linear-gradient(135deg, ${data.color}22, ${data.color}11)`
          : canAfford
          ? 'var(--bg-card)'
          : 'rgba(0,0,0,0.08)',
        border: isSelected
          ? `1px solid ${data.color}`
          : `1px solid var(--border)`,
        borderRadius: 10,
        cursor: canAfford ? 'pointer' : 'not-allowed',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        opacity: canAfford ? 1 : 0.45,
        boxShadow: isSelected ? `0 0 16px ${data.color}44` : 'none',
        textAlign: 'left',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {UNIT_SPRITES[type] && !imgError ? (
          <img 
            src={UNIT_SPRITES[type].icon} 
            alt={data.name}
            onError={() => setImgError(true)}
            style={{ width: 28, height: 28, objectFit: 'contain', filter: isSelected ? `drop-shadow(0 0 6px ${data.color})` : 'none' }}
          />
        ) : (
          <span style={{
            fontSize: '20px',
            color: data.color,
            textShadow: isSelected ? `0 0 12px ${data.color}` : 'none',
            lineHeight: 1,
          }}>{icon}</span>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? data.color : 'var(--text-primary)', lineHeight: 1.2 }}>
            {data.name}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: '8px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              background: `${data.color}22`,
              padding: '1px 4px',
              borderRadius: 3,
              textTransform: 'uppercase',
            }}>
              {ROLE_LABELS[data.role]}
            </span>
            <span style={{
              fontSize: '8px',
              fontWeight: 800,
              color: data.placementType === 'ground' ? '#2ECC97' : '#4A90D9',
              background: data.placementType === 'ground' ? 'rgba(46,204,151,0.12)' : 'rgba(74,144,217,0.12)',
              border: data.placementType === 'ground' ? '1px solid rgba(46,204,151,0.3)' : '1px solid rgba(74,144,217,0.3)',
              padding: '0px 3px',
              borderRadius: 3,
              textTransform: 'uppercase',
            }}>
              {data.placementType}
            </span>
          </div>
        </div>
      </div>

      {/* Stats mini-row */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <MiniStat label="⚡" value={data.baseCost} color="var(--col-energy)" />
        {data.baseDmg > 0 && <MiniStat label="⚔" value={stats.dmg} color="#E8643A" />}
        {data.healAmount && <MiniStat label="💚" value={stats.healAmount} color="#2ECC97" />}
        <MiniStat label="↗" value={stats.range} color="var(--text-secondary)" />
      </div>

      {/* Block count */}
      {data.blockByTier[0] > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Block:</span>
          {Array.from({ length: data.blockByTier[0] }).map((_, i) => (
            <span key={i} style={{ fontSize: '8px', color: data.color }}>▐</span>
          ))}
        </div>
      )}
    </button>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <span style={{
      fontSize: '10px',
      color: color || 'var(--text-secondary)',
      background: 'var(--bg-hover)',
      padding: '1px 5px',
      borderRadius: 4,
      fontWeight: 600,
    }}>
      {label} {value}
    </span>
  );
}
