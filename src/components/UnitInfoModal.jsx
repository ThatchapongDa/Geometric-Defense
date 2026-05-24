import React, { useEffect } from 'react';
import { UNIT_DATA, getUnitStats } from '../constants/units';

const UNIT_ICONS = {
  triangle: '▲',
  square:   '■',
  circle:   '●',
  pentagon: '⬠',
  hexagon:  '⬡',
  diamond:  '◆',
};

export default function UnitInfoModal({ type, onClose }) {
  const data = UNIT_DATA[type];
  if (!data) return null;

  // We show base stats (Tier 0) and Tier 3 stats for comparison, or just a comprehensive list.
  const baseStats = getUnitStats(type, 0);
  const maxStats = getUnitStats(type, 2); // Tier 3 is index 2

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }} 
        onClick={onClose}
      />
      
      <div style={{
        position: 'relative',
        width: '400px',
        maxWidth: '90%',
        background: 'rgba(15, 23, 42, 0.95)',
        border: `1px solid ${data.color}`,
        borderRadius: '16px',
        padding: '24px',
        color: '#FFF',
        boxShadow: `0 0 30px ${data.color}44`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${data.color}44, ${data.color}11)`,
            border: `2px solid ${data.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: data.color,
            textShadow: `0 0 10px ${data.color}`,
          }}>
            {UNIT_ICONS[type] || '▲'} 
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: data.color, fontSize: '24px' }}>{data.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {data.arkClass}
              </span>
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {data.placementType}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: '#FFF', fontSize: '24px', cursor: 'pointer', opacity: 0.5
            }}
          >×</button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Stats */}
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94A3B8' }}>Base Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div>Cost: <strong style={{ color: '#FCD34D' }}>{data.baseCost}</strong></div>
            {data.baseDmg > 0 && <div>Damage: <strong style={{ color: '#F87171' }}>{baseStats.dmg}</strong></div>}
            {data.healAmount > 0 && <div>Heal: <strong style={{ color: '#4ADE80' }}>{baseStats.healAmount}</strong></div>}
            {data.baseHp > 0 && <div>HP: <strong>{data.baseHp}</strong></div>}
            <div>Attack Interval: <strong>{data.attackInterval}s</strong></div>
            <div>Range: <strong>{baseStats.range}</strong> cells</div>
            {data.blockByTier[0] > 0 && <div>Block: <strong>{data.blockByTier[0]}</strong></div>}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Tier 3 Skill */}
        {data.skills?.t3 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94A3B8' }}>Tier III Ability: <span style={{ color: '#EAB308' }}>{data.skills.t3.label}</span></h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#CBD5E1' }}>
              {data.skills.t3.description}
            </p>
          </div>
        )}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Combos */}
        {data.combosWith && data.combosWith.length > 0 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94A3B8' }}>Synergy Combo</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {data.combosWith.map(comboType => {
                const comboData = UNIT_DATA[comboType];
                return (
                  <span key={comboType} style={{
                    fontSize: '12px',
                    background: `linear-gradient(135deg, ${comboData.color}33, ${comboData.color}11)`,
                    border: `1px solid ${comboData.color}66`,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    color: comboData.color,
                  }}>
                    + {comboData.name}
                  </span>
                );
              })}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
              Place adjacent to trigger combo buffs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
