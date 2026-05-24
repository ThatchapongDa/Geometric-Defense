import React from 'react';

const BUFF_ICONS = {
  sniperSpeed: '🏹',
  defenderHp: '🛡️',
  defenderBlock: '🧱',
  healerAmount: '💚',
  supporterSlow: '❄️',
  casterCd: '🔮',
  guardDmg: '⚔️',
  energyReward: '⚡',
  enemySpeed: '🐌',
  enemyArmor: '📉',
  deploymentLimit: '👥',
};

const MUTATION_ICONS = {
  enemySpeedIncrease: '⚡',
  enemyDefIncrease: '🛡️',
  enemyAtkIncrease: '⚔️',
  enemyResIncrease: '🔮',
  enemyHpIncrease: '❤️',
  sniperGuardDmgPenalty: '📉',
  playerHpPenalty: '💔',
};

export default function BuffStatusBar({ activeBuffs }) {
  if (!activeBuffs) return null;

  // Filter out buffs that are active (value > 0)
  const activePlayerBuffs = Object.entries(activeBuffs)
    .filter(([key, val]) => BUFF_ICONS[key] && val > 0);
    
  const activeMutations = Object.entries(activeBuffs)
    .filter(([key, val]) => MUTATION_ICONS[key] && val > 0);

  if (activePlayerBuffs.length === 0 && activeMutations.length === 0) {
    return null; // Don't render if no buffs
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '12px',
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      padding: '8px 16px',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 50,
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    }}>
      {/* Player Buffs */}
      {activePlayerBuffs.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#4ADE80', fontWeight: 'bold', marginRight: '4px' }}>BUFFS:</span>
          {activePlayerBuffs.map(([key, val]) => (
            <div key={key} title={key} style={{
              background: 'rgba(74, 222, 128, 0.2)',
              border: '1px solid rgba(74, 222, 128, 0.5)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#4ADE80'
            }}>
              {BUFF_ICONS[key]}
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {activePlayerBuffs.length > 0 && activeMutations.length > 0 && (
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
      )}

      {/* Enemy Mutations / Debuffs */}
      {activeMutations.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#F87171', fontWeight: 'bold', marginRight: '4px' }}>MUTATIONS:</span>
          {activeMutations.map(([key, val]) => (
            <div key={key} title={key} style={{
              background: 'rgba(248, 113, 113, 0.2)',
              border: '1px solid rgba(248, 113, 113, 0.5)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#F87171'
            }}>
              {MUTATION_ICONS[key]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
