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

const BUFF_TOOLTIPS_TH = {
  sniperSpeed: (v) => `🏹 ความเร็วโจมตี Sniper: +${Math.round(v * 100)}%`,
  defenderHp: (v) => `🧱 พลังชีวิตสูงสุด Defender: +${v} HP`,
  defenderBlock: (v) => `🛡️ บล็อกศัตรูเพิ่มเติมของ Defender: +${v} ตัว`,
  healerAmount: (v) => `🩹 พลังฮีลของ Medic: +${v} HP`,
  supporterSlow: (v) => `🌀 อัตราการสโลว์ของ Supporter: +${Math.round(v * 100)}%`,
  casterCd: (v) => `☄️ ความเร็วคูลดาวน์สกิล Caster: +${Math.round(v * 100)}%`,
  guardDmg: (v) => `🩸 พลังโจมตีของ Guard (Diamond): +${v} ATK`,
  energyReward: (v) => `🔋 พลังงานที่ได้จากการฆ่าศัตรู: +${v} หน่วย`,
  enemySpeed: (v) => `⏳ การชะลอความเร็วเคลื่อนที่ของศัตรู: -${Math.round(v * 100)}%`,
  enemyArmor: (v) => `🧪 การเจาะเกราะป้องกัน DEF ของศัตรู: +${Math.round(v * 100)}%`,
  deploymentLimit: (v) => `👥 โควต้าวางยูนิตสูงสุดในสนาม: +${v} ตัว`,

  enemySpeedIncrease: (v) => `🌪️ ความเร็วเคลื่อนที่ของศัตรู: +${Math.round(v * 100)}%`,
  enemyDefIncrease: (v) => `🛡️ พลังป้องกัน DEF ของศัตรู: +${v}`,
  enemyAtkIncrease: (v) => `⚔️ พลังโจมตีของศัตรู: +${Math.round(v * 100)}%`,
  enemyResIncrease: (v) => `🔮 ต้านทานเวท RES ของศัตรู: +${Math.round(v * 100)}%`,
  enemyHpIncrease: (v) => `❤️ พลังชีวิตเสริมของศัตรู: +${v} HP`,
  sniperGuardDmgPenalty: (v) => `📉 พลังโจมตี Sniper & Guard: -${Math.round(v * 100)}%`,
  playerHpPenalty: (v) => `📉 พลังชีวิตสูงสุดยูนิตฝ่ายเรา: -${Math.round(v * 100)}%`,
};

export default function BuffStatusBar({ activeBuffs, onClick }) {
  if (!activeBuffs) return null;

  // Filter out buffs that are active (value > 0)
  const activePlayerBuffs = Object.entries(activeBuffs)
    .filter(([key, val]) => BUFF_ICONS[key] && val > 0);
    
  const activeMutations = Object.entries(activeBuffs)
    .filter(([key, val]) => MUTATION_ICONS[key] && val > 0);

  if (activePlayerBuffs.length === 0 && activeMutations.length === 0) {
    return null; // Don't render if no buffs
  }

  const getTooltip = (key, val) => {
    const fn = BUFF_TOOLTIPS_TH[key];
    return fn ? fn(val) : `${key}: +${val}`;
  };

  return (
    <div 
      onClick={onClick}
      title="คลิกเพื่อดูรายละเอียดบัฟและดีบัพทั้งหมด"
      style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(12px)',
        padding: '8px 20px',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        zIndex: 50,
        boxShadow: 'var(--shadow-panel)',
        transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
        e.currentTarget.style.borderColor = '#F0B429';
        e.currentTarget.style.boxShadow = '0 0 16px rgba(240, 180, 41, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-panel)';
      }}
    >
      {/* Player Buffs */}
      {activePlayerBuffs.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#2ECC97', fontWeight: 'bold', marginRight: '4px', letterSpacing: '0.5px' }}>BUFFS:</span>
          {activePlayerBuffs.map(([key, val]) => (
            <div key={key} title={getTooltip(key, val)} style={{
              background: 'rgba(46, 204, 151, 0.15)',
              border: '1px solid rgba(46, 204, 151, 0.4)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#2ECC97',
              cursor: 'help',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
            >
              {BUFF_ICONS[key]}
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {activePlayerBuffs.length > 0 && activeMutations.length > 0 && (
        <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
      )}

      {/* Enemy Mutations / Debuffs */}
      {activeMutations.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#E74C3C', fontWeight: 'bold', marginRight: '4px', letterSpacing: '0.5px' }}>DEBUFFS:</span>
          {activeMutations.map(([key, val]) => (
            <div key={key} title={getTooltip(key, val)} style={{
              background: 'rgba(231, 76, 60, 0.15)',
              border: '1px solid rgba(231, 76, 60, 0.4)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#E74C3C',
              cursor: 'help',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
            >
              {MUTATION_ICONS[key]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
