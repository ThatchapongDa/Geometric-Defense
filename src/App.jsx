// src/App.jsx
// Root component — orchestrates game state, engine lifecycle, and UI

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { GameEngine } from './engine/GameEngine';
import particles from './engine/ParticleSystem';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import UnitPanel from './components/UnitPanel';
import UpgradeModal from './components/UpgradeModal';
import AchievementsModal from './components/AchievementsModal';
import AchievementNotification from './components/AchievementNotification';
import SettingsPanel from './components/SettingsPanel';
import WaveAlert from './components/WaveAlert';
import Tutorial from './components/Tutorial';
import MenuScreen, { GameOverScreen } from './components/MenuScreen';
import CardDraftOverlay from './components/CardDraftOverlay';
import Stage4ClearedScreen from './components/Stage4ClearedScreen';
import BuffStatusBar from './components/BuffStatusBar';
import EnemyEncyclopediaModal from './components/EnemyEncyclopediaModal';
import BuffListModal from './components/BuffListModal';
import './styles/index.css';

export default function App() {
  const { state, dispatch, actions } = useGameState();
  const stateRef = useRef(state);
  const engineRef = useRef(null);
  const canvasRef = useRef(null);

  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEnemyInfo, setShowEnemyInfo] = useState(false);
  const [showBuffInfo, setShowBuffInfo] = useState(false);
  const [waveAlertVisible, setWaveAlertVisible] = useState(false);

  // Keep stateRef in sync
  useEffect(() => { stateRef.current = state; }, [state]);

  // Init engine once
  useEffect(() => {
    const engine = new GameEngine(stateRef, dispatch, { current: null });
    engineRef.current = engine;
    return () => engine.stop();
  }, [dispatch]);

  // Start/stop engine based on phase
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (state.phase === 'playing') {
      engine.start();
    } else {
      engine.stop();
    }
  }, [state.phase]);

  // Wave start: trigger spawner + alert
  useEffect(() => {
    if (state.waveActive && engineRef.current) {
      engineRef.current.startWave(state.wave);
      setWaveAlertVisible(true);
      setTimeout(() => setWaveAlertVisible(false), 2500);
    }
  }, [state.waveActive, state.wave]);

  // Selected placed unit
  const selectedUnit = state.selectedUnitId ? state.units[state.selectedUnitId] : null;

  // Has saved game?
  const hasSave = !!localStorage.getItem('gd_save');

  // Actions wrapped with engine awareness
  const handleStartWave = useCallback(() => {
    actions.startWave();
  }, [actions]);

  const handleUpgrade = useCallback(() => {
    if (state.selectedUnitId) actions.upgradeUnit(state.selectedUnitId);
  }, [actions, state.selectedUnitId]);

  const handleSell = useCallback(() => {
    if (state.selectedUnitId) actions.sellUnit(state.selectedUnitId);
  }, [actions, state.selectedUnitId]);

  const handleStartGame = useCallback((mapId, contracts) => {
    particles.clear();
    actions.startGame(mapId, contracts);
  }, [actions]);

  const handleLoadGame = useCallback(() => {
    actions.loadGame();
  }, [actions]);

  // Tutorial next/skip
  const handleTutorialNext = useCallback(() => {
    if (state.tutorialStep >= 5) actions.tutorialDone();
    else actions.setTutorialStep(state.tutorialStep + 1);
  }, [state.tutorialStep, actions]);

  const handleTutorialSkip = useCallback(() => {
    actions.tutorialDone();
  }, [actions]);

  // Show menu / game over / stage 4 cleared overlays
  if (state.phase === 'menu') {
    return (
      <MenuScreen
        onStart={handleStartGame}
        onLoad={handleLoadGame}
        hasSave={hasSave}
        achievements={state.achievements}
      />
    );
  }

  if (state.phase === 'gameover') {
    return (
      <GameOverScreen
        wave={state.wave}
        score={state.score}
        hp={state.hp}
        onRestart={() => { actions.startGame(state.mapId); }}
      />
    );
  }

  if (state.phase === 'stage4_cleared') {
    return (
      <Stage4ClearedScreen
        score={state.score}
        hp={state.hp}
        maxHp={state.maxHp}
        onRestart={() => handleStartGame('stage4')}
        onMainMenu={() => actions.setPhase('menu')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Top HUD */}
      <HUD
        state={state}
        actions={{ ...actions, startWave: handleStartWave }}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAchievements={() => setShowAchievements(v => !v)}
        onSave={actions.saveGame}
        onOpenEnemyInfo={() => { actions.setPaused(true); setShowEnemyInfo(true); }}
        onOpenBuffInfo={() => { actions.setPaused(true); setShowBuffInfo(true); }}
        onQuitToMenu={() => { if (window.confirm('ต้องการออกจากเกมกลับไปหน้าเมนูหลัก?')) actions.quitToMenu(); }}
      />

      {/* Game area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Unit selection sidebar */}
        <UnitPanel state={state} actions={actions} />

        {/* Main canvas area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GameCanvas state={state} actions={actions} engineRef={engineRef} />

          {/* Wave alert */}
          <WaveAlert wave={state.wave} visible={waveAlertVisible} />

          {/* Upgrade modal */}
          {selectedUnit && (
            <UpgradeModal
              unit={selectedUnit}
              energy={state.energy}
              onUpgrade={handleUpgrade}
              onSell={handleSell}
              onClose={() => actions.deselect()}
            />
          )}

          {/* Tutorial */}
          {!state.tutorialDone && state.phase === 'playing' && (
            <Tutorial
              step={state.tutorialStep}
              onNext={handleTutorialNext}
              onSkip={handleTutorialSkip}
            />
          )}

          {/* Card draft overlay */}
          {state.showCardDraft && (
            <CardDraftOverlay
              draftCards={state.draftCards}
              onSelect={actions.chooseDraftCard}
            />
          )}

          {/* Buff Status Bar */}
          <BuffStatusBar activeBuffs={state.activeBuffs} />
          {showSettings && <SettingsPanel state={state} actions={actions} onClose={() => setShowSettings(false)} />}
          {showAchievements && <AchievementsModal state={state} onClose={() => setShowAchievements(false)} />}
          {showEnemyInfo && <EnemyEncyclopediaModal onClose={() => { setShowEnemyInfo(false); actions.setPaused(false); }} />}
          {showBuffInfo && <BuffListModal state={state} onClose={() => { setShowBuffInfo(false); actions.setPaused(false); }} />}

          {/* Notifications */}
          <AchievementNotification
            activeAchievement={state.activeAchievement}
            onClose={actions.clearAchievement}
          />
        </div>
      </div>
    </div>
  );
}
