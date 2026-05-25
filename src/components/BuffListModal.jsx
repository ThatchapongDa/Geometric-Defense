import React from 'react';

const BUFF_LABELS_TH = {
  // Player Buffs
  sniperSpeed: { label: '🏹 ความเร็วโจมตีของยูนิต Sniper', format: (v) => `+${Math.round(v * 100)}%` },
  defenderHp: { label: '🧱 พลังชีวิตสูงสุดของ Defender', format: (v) => `+${v} HP` },
  defenderBlock: { label: '🛡️ จำนวนที่บล็อกได้ของ Defender', format: (v) => `+${v} ตัว` },
  healerAmount: { label: '🩹 พลังรักษา (ฮีล) ของ Medic', format: (v) => `+${v} HP` },
  supporterSlow: { label: '🌀 อัตราการสโลว์ของ Supporter', format: (v) => `+${Math.round(v * 100)}%` },
  casterCd: { label: '☄️ ความเร็วคูลดาวน์สกิลของ Caster', format: (v) => `+${Math.round(v * 100)}%` },
  guardDmg: { label: '🩸 พลังโจมตีของยูนิต Guard (Diamond)', format: (v) => `+${v} ATK` },
  energyReward: { label: '🔋 พลังงานที่ได้รับเมื่อกำจัดศัตรู', format: (v) => `+${v} หน่วย/ตัว` },
  enemySpeed: { label: '⏳ การชะลอความเร็วของศัตรู', format: (v) => `-${Math.round(v * 100)}%` },
  enemyArmor: { label: '🧪 การเจาะเกราะป้องกัน DEF ศัตรู', format: (v) => `+${Math.round(v * 100)}%` },
  deploymentLimit: { label: '👥 โควต้าวางยูนิตสูงสุดในสนาม', format: (v) => `+${v} ตัว` },

  // Enemy mutations / Penalties
  enemySpeedIncrease: { label: '🌪️ ความเร็วเคลื่อนที่ของศัตรูพื้นดิน', format: (v) => `+${Math.round(v * 100)}%` },
  enemyDefIncrease: { label: '🛡️ พลังป้องกัน DEF ของศัตรู', format: (v) => `+${v}` },
  enemyAtkIncrease: { label: '⚔️ พลังโจมตีของศัตรู', format: (v) => `+${Math.round(v * 100)}%` },
  enemyResIncrease: { label: '🔮 ต้านทานเวท RES ของศัตรู', format: (v) => `+${Math.round(v * 100)}%` },
  enemyHpIncrease: { label: '❤️ พลังชีวิตเสริมของศัตรู', format: (v) => `+${v} HP` },
  sniperGuardDmgPenalty: { label: '📉 ดาเมจ Sniper & Guard ลดลง', format: (v) => `-${Math.round(v * 100)}%` },
  playerHpPenalty: { label: '📉 พลังชีวิตสูงสุดยูนิตเราลดลง', format: (v) => `-${Math.round(v * 100)}%` },
};

const CONTRACT_LABELS_TH = {
  hp_restrict: '🚨 HP Restriction (เลือดสูงสุดฐานเหลือ 5)',
  unit_hp_debuff: '🧪 Environmental Acid (เลือดสูงสุดยูนิต -25%)',
  enemy_speed_buff: '🌪️ Sandstorm (ความเร็วศัตรู +20%)',
  enemy_def_buff: '🛡️ Heavy Shielding (เกราะศัตรู DEF +30 / RES +15%)',
};

export default function BuffListModal({ state, onClose }) {
  const { activeBuffs, selectedContracts, difficultyMod } = state;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-panel)',
        animation: 'fadeUp 0.3s ease forwards',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontFamily: 'Orbitron, monospace',
              color: '#F0B429',
              letterSpacing: '1px'
            }}>⚡ บัฟและดีบัพที่ใช้งานอยู่</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              ระดับความยากของด่านในปัจจุบัน: {Math.round(difficultyMod * 100)}%
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            ปิดหน้าต่าง
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Pre-game Contingency Contracts */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#E8643A', fontFamily: 'Orbitron, monospace', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🚨 สัญญาความเสี่ยงก่อนเริ่มเกม (Contingency Contracts)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.keys(selectedContracts).filter(k => selectedContracts[k]).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', italic: 'true', padding: '4px' }}>— ไม่มีสัญญาความเสี่ยงถูกใช้งาน —</div>
              ) : (
                Object.keys(selectedContracts).filter(k => selectedContracts[k]).map(key => (
                  <div key={key} style={{ 
                    background: 'rgba(232,100,58,0.06)', 
                    borderLeft: '4px solid #E8643A',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {CONTRACT_LABELS_TH[key] || key.replace(/_/g, ' ').toUpperCase()}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Player Buffs */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#2ECC97', fontFamily: 'Orbitron, monospace', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🟢 บัฟพลังยูนิตฝ่ายเรา (Active Player Buffs)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '8px' }}>
              {Object.entries(activeBuffs).filter(([k,v]) => v > 0 && !k.toLowerCase().includes('enemy') && !k.toLowerCase().includes('penalty')).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px', gridColumn: 'span 2' }}>— ไม่มีบัฟความสามารถพิเศษฝ่ายเราเปิดใช้งาน —</div>
              ) : (
                Object.entries(activeBuffs).map(([key, value]) => {
                  if (value > 0 && !key.toLowerCase().includes('enemy') && !key.toLowerCase().includes('penalty')) {
                    const info = BUFF_LABELS_TH[key] || { label: key, format: (v) => `+${v}` };
                    return (
                      <div key={key} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderLeft: '4px solid #2ECC97',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{info.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Orbitron, monospace', marginTop: '4px' }}>
                          {info.format(value)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>
          </div>

          {/* 3. Double-Edged Drawbacks */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#E74C3C', fontFamily: 'Orbitron, monospace', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🔴 ดีบัพและสถานะเสริมพลังฝั่งศัตรู (Double-Edged Drawbacks)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '8px' }}>
              {Object.entries(activeBuffs).filter(([k,v]) => v > 0 && (k.toLowerCase().includes('enemy') || k.toLowerCase().includes('penalty'))).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px', gridColumn: 'span 2' }}>— ไม่มีเงื่อนไขหรือการกลายพันธุ์ของศัตรู —</div>
              ) : (
                Object.entries(activeBuffs).map(([key, value]) => {
                  if (value > 0 && (key.toLowerCase().includes('enemy') || key.toLowerCase().includes('penalty'))) {
                    const info = BUFF_LABELS_TH[key] || { label: key, format: (v) => `+${v}` };
                    return (
                      <div key={key} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderLeft: '4px solid #E74C3C',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{info.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#E74C3C', fontFamily: 'Orbitron, monospace', marginTop: '4px' }}>
                          {info.format(value)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
