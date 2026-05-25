import React from 'react';
import { ENEMY_DATA } from '../constants/enemies';
import { ENEMY_SPRITES } from '../constants/sprites';

export default function EnemyEncyclopediaModal({ onClose }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(7,11,20,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontFamily: 'Orbitron, monospace',
              color: '#fff',
              letterSpacing: '1px'
            }}>📖 Enemy Encyclopedia</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Database of geometric anomalies. Base stats shown at Threat Level 1.
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '8px 16px' }}
          >
            CLOSE
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {Object.entries(ENEMY_DATA).map(([type, data]) => (
            <EnemyCard key={type} type={type} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EnemyCard({ type, data }) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header: Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'rgba(0,0,0,0.4)',
          border: `1.5px solid ${data.color}`,
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: data.color,
          fontSize: '20px',
          boxShadow: `0 0 10px ${data.color}44`,
          overflow: 'hidden',
        }}>
          {ENEMY_SPRITES[type] && !imgError ? (
            <img 
              src={ENEMY_SPRITES[type].icon} 
              alt={type} 
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          ) : (
            data.shape
          )}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: data.color, textTransform: 'capitalize' }}>
            {data.name || type}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {data.isAir ? '✈️ Aerial' : '🚶 Ground'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
        background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>❤️ Base HP</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.baseHp}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>👟 Speed</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.baseSpeed}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>⚔️ Damage</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.damage || 1}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>💰 Reward</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.reward}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>🛡️ DEF</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.def || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>✨ RES</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.res || 0}</span>
        </div>
      </div>

      {/* Description */}
      {data.desc && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
          {data.desc}
        </div>
      )}
    </div>
  );
}
