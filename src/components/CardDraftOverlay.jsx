// src/components/CardDraftOverlay.jsx
// Premium glassmorphic interface to choose 1 of 3 tactical buff cards

import React from 'react';

export default function CardDraftOverlay({ draftCards, onSelect, onOpenBuffInfo, state }) {
  if (!draftCards || draftCards.length === 0) return null;

  const activeBuffsCount = Object.values(state?.activeBuffs || {}).filter(v => v > 0).length + 
                           Object.keys(state?.selectedContracts || {}).filter(k => state?.selectedContracts[k]).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5, 7, 12, 0.90)',
      backdropFilter: 'blur(20px)',
      padding: '24px 16px',
      color: '#fff',
      animation: 'fadeIn 0.4s ease-out forwards',
    }}>
      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(20px, 4vw, 32px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #F0B429 0%, #E8643A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '2px',
          margin: '0 0 8px 0',
        }}>
          SELECT A TACTICAL BUFF
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          margin: 0,
          letterSpacing: '1px',
        }}>
          เลือกการ์ดความสามารถพิเศษเพื่ออัปเกรดแผนการเล่นของคุณ (มีผลตลอดเกมนี้)
        </p>

        {onOpenBuffInfo && (
          <button
            className="btn btn-secondary"
            onClick={onOpenBuffInfo}
            style={{
              marginTop: '20px',
              padding: '8px 24px',
              fontSize: '12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: '#fff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(240, 180, 41, 0.15)';
              e.currentTarget.style.borderColor = '#F0B429';
              e.currentTarget.style.color = '#F0B429';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            ⚡ ดูบัฟ & ความเสี่ยงปัจจุบันที่ได้รับไปแล้ว ({activeBuffsCount})
          </button>
        )}
      </div>

      {/* Cards list */}
      <div style={{
        display: 'flex',
        gap: '24px',
        maxWidth: '920px',
        width: '100%',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {draftCards.map((card, i) => {
          // Curate borders & shadow based on card type for rich aesthetics
          const isDebuff = card.buffType.startsWith('enemy');
          const activeColor = isDebuff ? '#E67E22' : '#F0B429';
          const activeGlow = isDebuff ? 'rgba(230,126,34,0.15)' : 'rgba(240,180,41,0.15)';

          return (
            <div
              key={card.id}
              onClick={() => onSelect(card)}
              style={{
                background: 'rgba(10, 20, 35, 0.65)',
                border: `1.5px solid rgba(255,255,255,0.06)`,
                borderRadius: '16px',
                padding: '28px 24px',
                width: '260px',
                minHeight: '340px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '16px',
                transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                position: 'relative',
                animation: `fadeUp 0.5s ease-out forwards ${i * 0.1}s`,
                opacity: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
                e.currentTarget.style.borderColor = activeColor;
                e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,0.6), 0 0 20px ${activeGlow}`;
                e.currentTarget.querySelector('.card-icon-container').style.transform = 'scale(1.15) rotate(5deg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                e.currentTarget.querySelector('.card-icon-container').style.transform = 'none';
              }}
            >
              {/* Type indicator badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '9px',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 700,
                color: activeColor,
                background: isDebuff ? 'rgba(230,126,34,0.12)' : 'rgba(240,180,41,0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {isDebuff ? 'DEBUFF' : 'BUFF'}
              </div>

              {/* Icon */}
              <div
                className="card-icon-container"
                style={{
                  fontSize: '48px',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '16px',
                  boxShadow: 'inset 0 0 12px rgba(255,255,255,0.02)',
                  transition: 'transform 0.25s ease',
                }}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#fff',
                margin: '8px 0 0 0',
                letterSpacing: '0.5px',
              }}>
                {card.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                margin: 0,
                flexGrow: 1,
              }}>
                {card.desc}
              </p>

              {/* Select indicator */}
              <div style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#ccc',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = activeColor;
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#ccc';
              }}
              >
                DEPLOY CARD
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
