import React from 'react';
import { CONTRACTS } from './MenuScreen'; // Need to export CONTRACTS from MenuScreen or define them here. Wait, let's redefine or import.

export default function BuffListModal({ state, onClose }) {
  const { activeBuffs, selectedContracts, difficultyMod } = state;

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
        maxWidth: '700px',
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
              color: '#F0B429',
              letterSpacing: '1px'
            }}>⚡ Active Buffs & Difficulty</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Current modifiers affecting the game. Global Difficulty: {(difficultyMod * 100).toFixed(0)}%
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

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contracts Section */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#E8643A', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🚨 Contingency Contracts (Pre-Game)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {Object.keys(selectedContracts).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No contracts selected.</div>
              ) : (
                Object.keys(selectedContracts).map(key => (
                  <div key={key} style={{ 
                    background: 'rgba(232,100,58,0.1)', 
                    borderLeft: '3px solid #E8643A',
                    padding: '10px 14px',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Player Buffs Section */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#4A90D9', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🟢 Player Buffs (Cards)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(activeBuffs).filter(([k,v]) => v > 0 && !k.toLowerCase().includes('enemy') && !k.toLowerCase().includes('penalty')).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No player buffs active.</div>
              ) : (
                Object.entries(activeBuffs).map(([key, value]) => {
                  if (value > 0 && !key.toLowerCase().includes('enemy') && !key.toLowerCase().includes('penalty')) {
                    return (
                      <div key={key} style={{
                        background: 'rgba(74,144,217,0.1)',
                        borderLeft: '3px solid #4A90D9',
                        padding: '10px 14px',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{key}</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>+{value}</div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>
          </div>

          {/* Double-Edged Penalties Section */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#E74C3C', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🔴 Enemy Mutations / Penalties (Double-Edged)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(activeBuffs).filter(([k,v]) => v > 0 && (k.toLowerCase().includes('enemy') || k.toLowerCase().includes('penalty'))).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No mutations active.</div>
              ) : (
                Object.entries(activeBuffs).map(([key, value]) => {
                  if (value > 0 && (key.toLowerCase().includes('enemy') || key.toLowerCase().includes('penalty'))) {
                    return (
                      <div key={key} style={{
                        background: 'rgba(231,76,60,0.1)',
                        borderLeft: '3px solid #E74C3C',
                        padding: '10px 14px',
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{key}</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>+{value}</div>
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
