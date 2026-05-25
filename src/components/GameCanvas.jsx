// src/components/GameCanvas.jsx
// The main game canvas — handles click events and renders via the engine

import React, { useRef, useEffect, useCallback } from 'react';
import { CELL_SIZE, GRID_COLS, GRID_ROWS } from '../constants/units';
import { UNIT_DATA } from '../constants/units';
import DirectionSelector from './DirectionSelector';

export default function GameCanvas({ state, actions, engineRef }) {
  const canvasRef = useRef(null);

  // Pass canvas ref to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.canvas = canvasRef;
    }
  }, [engineRef]);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      // Fixed logical size: 10×8 cells
      canvas.width  = GRID_COLS * CELL_SIZE;
      canvas.height = GRID_ROWS * CELL_SIZE;
    };
    resize();
  }, []);

  // Handle clicks on canvas
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top)  * scaleY;
    const col = Math.floor(px / CELL_SIZE);
    const row = Math.floor(py / CELL_SIZE);

    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

    // Check if a unit occupies this cell
    const clickedUnit = Object.values(state.units).find(u => u.col === col && u.row === row);

    if (clickedUnit) {
      // Select this placed unit for upgrade/sell
      if (state.selectedUnitId === clickedUnit.id) {
        actions.deselect();
      } else {
        actions.selectPlacedUnit(clickedUnit.id);
      }
      return;
    }

    // Place a new unit
    if (state.selectedUnitType) {
      actions.setPendingPlacement({ col, row, type: state.selectedUnitType });
    } else {
      actions.deselect();
    }
  }, [state, actions]);

  // Draw hover grid highlight
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !state.selectedUnitType) return;
    // The engine renders hover state via stateRef — handled in GameEngine
  }, [state.selectedUnitType]);

  const canvasWidth  = GRID_COLS * CELL_SIZE;
  const canvasHeight = GRID_ROWS * CELL_SIZE;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: canvasWidth,
        maxHeight: canvasHeight,
        aspectRatio: `${canvasWidth} / ${canvasHeight}`
      }}>
        <canvas
          ref={canvasRef}
          id="game-canvas"
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          style={{
            display: 'block',
            cursor: state.selectedUnitType
              ? `crosshair`
              : state.selectedUnitId
              ? 'pointer'
              : 'default',
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            boxShadow: '0 0 60px rgba(0,0,0,0.8)',
          }}
        />
      {state.pendingPlacement && (
        <DirectionSelector
          col={state.pendingPlacement.col}
          row={state.pendingPlacement.row}
          onSelect={(direction) => {
            actions.placeUnit(
              state.pendingPlacement.col, 
              state.pendingPlacement.row, 
              state.pendingPlacement.type, 
              direction
            );
            actions.cancelPendingPlacement();
            actions.deselect();
          }}
          onCancel={() => actions.cancelPendingPlacement()}
        />
      )}
      </div>
    </div>
  );
}
