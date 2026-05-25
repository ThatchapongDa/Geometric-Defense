// src/components/UnitGalleryModal.jsx
// Premium character archive and statistics gallery modal

import React, { useState } from 'react';
import { UNIT_DATA, getUnitStats } from '../constants/units';
import { UNIT_SPRITES } from '../constants/sprites';

const UNIT_ICONS = {
  triangle: '▲',
  square:   '■',
  circle:   '●',
  pentagon: '⬠',
  hexagon:  '⬡',
  diamond:  '◆',
};

const CLASS_LABELS = {
  triangle: '🎯 Sniper (ยิงไกล)',
  square:   '🛡️ Defender (ตัวบล็อก)',
  circle:   '💚 Medic (หน่วยแพทย์)',
  pentagon: '🔮 Caster (จอมเวท)',
  hexagon:  '❄️ Supporter (สนับสนุน)',
  diamond:  '⚔️ Guard (องครักษ์)',
};

const ROLE_LABELS = {
  dps:      'DPS Attacker',
  tank:     'Tank / Blocker',
  healer:   'Dedicated Healer',
  aoe:      'AOE Area Damage',
  debuffer: 'Debuffer & Crowd Control',
  melee:    'Melee Duelist',
};

export default function UnitGalleryModal({ onClose }) {
  const unitTypes = Object.keys(UNIT_DATA);
  const [selectedType, setSelectedType] = useState(unitTypes[0]);
  const [splashError, setSplashError] = useState({});

  const data = UNIT_DATA[selectedType];
  const t1Stats = getUnitStats(selectedType, 0);
  const t3Stats = getUnitStats(selectedType, 2);

  const getComboDescription = (type) => {
    // Return helper summary of combo adjacencies
    if (type === 'triangle') return 'Pentagon (ยิงเร็วขึ้น + เจาะเกราะคริติคอลบ่อยขึ้น)';
    if (type === 'square') return 'Circle (ได้รับฮีลแรงขึ้น + Square ฟื้นเลือดตัวเองตลอดเวลา)';
    if (type === 'circle') return 'Square (ได้รับฮีลแรงขึ้น + Square ฟื้นเลือดตัวเองตลอดเวลา)';
    if (type === 'pentagon') return 'Triangle / Hexagon (ยิงเร็วขึ้น + ทำดาเมจศัตรูติดสโลว์แรงขึ้น)';
    if (type === 'hexagon') return 'Pentagon / Diamond (ลดเกราะสโลว์เพิ่มขึ้น + บัฟเพื่อนด้านข้าง)';
    if (type === 'diamond') return 'Hexagon (ตีเร็วขึ้น + ฟื้นฟูเลือดตัวเอง)';
    return 'ไม่มีคอมโบเชื่อมต่อ';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '24px',
    }} onClick={onClose}>
      
      <div 
        className="glass animate-waveIn"
        style={{
          width: '100%',
          maxWidth: '1150px',
          height: '90vh',
          maxHeight: '620px',
          background: 'linear-gradient(135deg, rgba(13,19,33,0.98), rgba(7,11,20,0.98))',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          borderRadius: 20,
          display: 'flex',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Archive Selector */}
        <div style={{
          width: '220px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '16px',
              fontWeight: 800,
              color: '#FFF',
              letterSpacing: '1px',
              margin: 0,
            }}>🛡️ HERO ARCHIVE</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
              ฐานข้อมูลยูนิตและคอมโบซินเนอร์จี
            </p>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {unitTypes.map(type => {
              const uData = UNIT_DATA[type];
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isSelected 
                      ? `linear-gradient(135deg, ${uData.color}22, ${uData.color}11)`
                      : 'rgba(255,255,255,0.02)',
                    border: isSelected 
                      ? `1.5px solid ${uData.color}` 
                      : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 16px ${uData.color}22` : 'none',
                  }}
                >
                  {UNIT_SPRITES[type] ? (
                    <img 
                      src={UNIT_SPRITES[type].icon} 
                      alt={uData.name}
                      style={{
                        width: 32,
                        height: 32,
                        objectFit: 'contain',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${isSelected ? uData.color : 'rgba(255,255,255,0.1)'}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', color: uData.color,
                    }}>
                      {UNIT_ICONS[type]}
                    </div>
                  )}
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isSelected ? uData.color : '#FFF',
                    }}>{uData.name}</div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                    }}>{ROLE_LABELS[uData.role]}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ width: '100%', fontFamily: 'Orbitron, monospace', fontSize: '11px', letterSpacing: '0.5px' }}
            >
              BACK TO MENU
            </button>
          </div>
        </div>

        {/* Right Side: Splash Art & Detailed Stats */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.05)',
        }}>
          {/* Splash Portrait (Middle Column) */}
          <div style={{
            width: '480px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'rgba(0,0,0,0.25)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '20px',
            flexShrink: 0,
          }}>
            {UNIT_SPRITES[selectedType] && !splashError[selectedType] ? (
              <img 
                src={UNIT_SPRITES[selectedType].portrait} 
                alt={data.name}
                onError={() => setSplashError(prev => ({ ...prev, [selectedType]: true }))}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 0 24px ${data.color}33)`,
                  transition: 'all 0.3s ease',
                }}
              />
            ) : (
              <div style={{
                fontSize: '120px',
                color: data.color,
                textShadow: `0 0 40px ${data.color}66`,
              }}>
                {UNIT_ICONS[selectedType]}
              </div>
            )}
          </div>

          {/* Stats Details (Right Column) */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: data.color,
                  fontFamily: 'Orbitron, monospace',
                  margin: 0,
                  letterSpacing: '1px',
                }}>{data.name}</h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: data.placementType === 'ground' ? '#2ECC97' : '#4A90D9',
                  background: data.placementType === 'ground' ? 'rgba(46,204,151,0.1)' : 'rgba(74,144,217,0.1)',
                  border: `1.5px solid ${data.placementType === 'ground' ? '#2ECC9755' : '#4A90D955'}`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}>{data.placementType} block</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                {CLASS_LABELS[selectedType]}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {/* Core Stats Section */}
            <div>
              <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                STATISTICS (TIER I ➡️ TIER III)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <StatBar label="⚡ Cost" val={`${t1Stats.cost}`} color="#F0B429" pct={40} />
                <StatBar label="❤️ Max HP" val={`${t1Stats.hp} ➡️ ${t3Stats.hp}`} color="#E74C3C" pct={selectedType === 'square' ? 95 : 45} />
                {t1Stats.dmg > 0 && <StatBar label="⚔️ Attack Damage" val={`${t1Stats.dmg} ➡️ ${t3Stats.dmg}`} color="#E8643A" pct={selectedType === 'diamond' || selectedType === 'triangle' ? 90 : 30} />}
                {t1Stats.healAmount > 0 && <StatBar label="💚 Healing Amount" val={`${t1Stats.healAmount} ➡️ ${t3Stats.healAmount}`} color="#2ECC97" pct={85} />}
                <StatBar label="↗️ Attack Range" val={`${t1Stats.range} Cells`} color="#00D4FF" pct={t1Stats.range * 25} />
                <StatBar label="🛡️ Block Capacity" val={`${t1Stats.blockCount} ➡️ ${t3Stats.blockCount}`} color="#4A90D9" pct={t3Stats.blockCount * 25} />
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {/* Ultimate Skill (Tier III) */}
            {data.skills?.t3 && (
              <div style={{
                background: `${data.color}11`,
                border: `1.5px solid ${data.color}33`,
                borderRadius: '12px',
                padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>✦</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: data.color,
                    fontFamily: 'Orbitron, monospace',
                  }}>
                    TIER III SPECIAL ABILITY: {data.skills.t3.label}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>{data.skills.t3.description}</p>
              </div>
            )}

            {/* Synergies & Adjacency Combos */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px' }}>
                🔗 COMBO SYNERGIES (คอมโบที่เปิดใช้งานได้)
              </div>
              <div style={{ fontSize: '12px', color: '#FFF', lineHeight: 1.5, fontWeight: 600 }}>
                {getComboDescription(selectedType)}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                * วางยูนิตเหล่านี้ติดกันในสนามรบเพื่อเปิดใช้งานโบนัสความสามารถคอมโบซินเนอร์จี
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, val, color, pct }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ width: '130px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ width: '80px', fontSize: '12px', fontWeight: 700, color: '#FFF', textAlign: 'right' }}>
        {val}
      </span>
    </div>
  );
}
