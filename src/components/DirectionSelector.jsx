import React, { useEffect } from 'react';
import { CELL_SIZE, GRID_COLS, GRID_ROWS } from '../constants/units';

export default function DirectionSelector({ col, row, onSelect, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Center of the cell in percentages
  const leftPct = ((col + 0.5) / GRID_COLS) * 100;
  const topPct = ((row + 0.5) / GRID_ROWS) * 100;
  
  // Cell width/height in percentages
  const cellWidthPct = 100 / GRID_COLS;
  const cellHeightPct = 100 / GRID_ROWS;

  const btnStyle = {
    position: 'absolute',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #FFF',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    zIndex: 100,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allow clicks to pass through unless on buttons
  };

  const backdropStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    background: 'rgba(0,0,0,0.2)', // Slight dim
  };

  return (
    <div style={overlayStyle}>
      <div style={backdropStyle} onClick={onCancel} />
      
      {/* Up */}
      <div 
        style={{ ...btnStyle, left: `${leftPct}%`, top: `${topPct - cellHeightPct * 0.8}%` }}
        onClick={(e) => { e.stopPropagation(); onSelect('up'); }}
      >
        ⬆️
      </div>

      {/* Down */}
      <div 
        style={{ ...btnStyle, left: `${leftPct}%`, top: `${topPct + cellHeightPct * 0.8}%` }}
        onClick={(e) => { e.stopPropagation(); onSelect('down'); }}
      >
        ⬇️
      </div>

      {/* Left */}
      <div 
        style={{ ...btnStyle, left: `${leftPct - cellWidthPct * 0.8}%`, top: `${topPct}%` }}
        onClick={(e) => { e.stopPropagation(); onSelect('left'); }}
      >
        ⬅️
      </div>

      {/* Right */}
      <div 
        style={{ ...btnStyle, left: `${leftPct + cellWidthPct * 0.8}%`, top: `${topPct}%` }}
        onClick={(e) => { e.stopPropagation(); onSelect('right'); }}
      >
        ➡️
      </div>
    </div>
  );
}
