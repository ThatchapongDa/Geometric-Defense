// src/components/UpgradeModal.jsx
// Click a placed unit to see stats and upgrade/sell options

import React from 'react';
import { UNIT_DATA, getUnitStats } from '../constants/units';

const TIER_NAMES = ['Tier I', 'Tier II', 'Tier III'];
const UNIT_ICONS = { triangle: '▲', square: '■', circle: '●', pentagon: '⬠', hexagon: '⬡', diamond: '◆' };
const ROLE_LABELS = { dps: 'DPS Attacker', tank: 'Tank', healer: 'Healer', aoe: 'AOE Dealer', debuffer: 'Debuffer', melee: 'Guard' };

export default function UpgradeModal({ unit, energy, onUpgrade, onSell, onClose }) {
  if (!unit) return null;
  const data = UNIT_DATA[unit.type];
  const currentStats = getUnitStats(unit.type, unit.tier);
  const nextStats = unit.tier < 2 ? getUnitStats(unit.type, unit.tier + 1) : null;
  const canUpgrade = nextStats && energy >= currentStats.upgradeCost;
  const refund = Math.round(data.baseCost * (0.5 + unit.tier * 0.1));

  return (
    <div
      className="glass animate-waveIn"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: 290,
        padding: '16px',
        zIndex: 150,
        boxShadow: `0 0 32px ${data.color}22, 0 12px 32px rgba(0,0,0,0.6)`,
        border: `1.5px solid ${data.color}55`,
        background: 'linear-gradient(135deg, rgba(20,24,35,0.95), rgba(7,11,20,0.95))',
        backdropFilter: 'blur(16px)',
        borderRadius: '14px',
        color: '#fff',
      }}
      onClick={e => e.stopPropagation()}
    >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 16 }}>
          <span style={{ fontSize: 36, color: data.color, textShadow: `0 0 20px ${data.color}` }}>
            {UNIT_ICONS[unit.type]}
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: data.color, fontFamily: 'Orbitron, monospace' }}>
              {data.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ROLE_LABELS[data.role]}</div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: `${data.color}22`,
              border: `1px solid ${data.color}55`,
              padding: '2px 8px',
              borderRadius: 20,
              marginTop: 4,
            }}>
              <span style={{ fontSize: 10, color: data.color, fontWeight: 700 }}>
                {TIER_NAMES[unit.tier]}
                {unit.tier === 2 && ' ★ MAX'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer',
            }}
          >✕</button>
        </div>

        {/* HP Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>HP</span>
            <span>{unit.currentHp} / {unit.maxHp}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(unit.currentHp / unit.maxHp) * 100}%`,
                background: unit.currentHp / unit.maxHp > 0.5 ? '#2ECC97' : '#F39C12',
              }}
            />
          </div>
        </div>

        {/* Current Stats */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 8,
          padding: '12px',
          marginBottom: 14,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          {unit.dmg > 0 && <StatRow label="⚔ Damage" current={currentStats.dmg} next={nextStats?.dmg} />}
          <StatRow label="❤ Max HP" current={currentStats.hp} next={nextStats?.hp} />
          <StatRow label="↗ Range" current={currentStats.range} next={nextStats?.range} />
          <StatRow label="🛡 Block" current={currentStats.blockCount} next={nextStats?.blockCount} />
          {unit.healAmount > 0 && <StatRow label="💚 Heal/s" current={currentStats.healAmount} next={nextStats?.healAmount} />}
          {currentStats.slowPercent > 0 && <StatRow label="❄ Slow" current={`${Math.round(currentStats.slowPercent*100)}%`} next={nextStats?.slowPercent ? `${Math.round(nextStats.slowPercent*100)}%` : null} />}
        </div>

        {/* T3 Skill preview */}
        {unit.tier === 2 && data.skills?.t3 && (
          <div style={{
            background: `${data.color}11`,
            border: `1px solid ${data.color}33`,
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: data.color, marginBottom: 4 }}>
              ✦ {data.skills.t3.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {data.skills.t3.description}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {nextStats ? (
            <button
              id={`btn-upgrade-${unit.id}`}
              className={`btn btn-gold ${canUpgrade ? '' : 'btn-disabled'}`}
              disabled={!canUpgrade}
              onClick={onUpgrade}
              style={{
                flex: 1.5,
                fontSize: '11px',
                padding: '8px 4px',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                minWidth: 0,
              }}
            >
              ↑ UPGRADE ({currentStats.upgradeCost}⚡)
            </button>
          ) : (
            <div style={{
              flex: 1.5, padding: '8px 4px', textAlign: 'center',
              background: `${data.color}11`, border: `1px solid ${data.color}33`,
              borderRadius: 6, fontSize: 11, color: data.color, fontWeight: 700,
              whiteSpace: 'nowrap',
            }}>
              ★ MAX TIER
            </div>
          )}
          <button
            id={`btn-sell-${unit.id}`}
            className="btn btn-danger"
            onClick={onSell}
            title={`Sell for ${refund} energy`}
            style={{
              flex: 1,
              fontSize: '11px',
              padding: '8px 4px',
              whiteSpace: 'nowrap',
              fontWeight: 'bold',
              minWidth: 0,
            }}
          >
            🗑 SELL ({refund}⚡)
          </button>
        </div>

        {/* Insufficient energy warning */}
        {!canUpgrade && nextStats && (
          <div style={{
            fontSize: '10px',
            color: '#E74C3C',
            marginTop: '8px',
            textAlign: 'center',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
          }}>
            ⚠️ ต้องการอีก {currentStats.upgradeCost - energy}⚡ เพื่ออัปเกรด
          </div>
        )}
      </div>
  );
}

function StatRow({ label, current, next }) {
  const hasUpgrade = next !== null && next !== undefined && next !== current;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{current}</span>
        {hasUpgrade && (
          <>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2ECC97' }}>{next}</span>
          </>
        )}
      </div>
    </div>
  );
}
