// src/hooks/useGameState.js
// Core game state management via useReducer — Phase 2 Upgraded

import { useReducer, useCallback, useRef } from 'react';
import { UNIT_DATA, getUnitStats, SLOW_FLOOR, CELL_SIZE, GRID_COLS, GRID_ROWS, SAVE_VERSION } from '../constants/units';
import { ENEMY_DATA, getEnemyStats } from '../constants/enemies';
import { MAPS, MAP_PATH_CELLS, getLaneForEnemy, generateWave, isBossWave, isCellOnPath } from '../constants/waves';
import soundManager from '../engine/SoundManager';
import particles from '../engine/ParticleSystem';

// ─── ID Counters ─────────────────────────────────────────────────────────────
let _unitId = 0;
let _enemyId = 0;
let _puddleId = 0;
const nextUnitId  = () => ++_unitId;
const nextEnemyId = () => ++_enemyId;
const nextPuddleId = () => ++_puddleId;

// ─── Achievement Definitions ─────────────────────────────────────────────────
export const ACHIEVEMENT_DEFS = {
  perfect_tactician: { label: 'Perfect Tactician', desc: 'ผ่าน Wave 5 โดยไม่เสียเลือดฐานเลย', icon: '🛡️' },
  energy_baron:      { label: 'Energy Baron',       desc: 'มีพลังงานสะสมเกิน 500 ในครั้งเดียว', icon: '⚡' },
  elite_squad:       { label: 'Elite Squad',        desc: 'อัปเกรดยูนิตถึง Tier III สำเร็จ', icon: '⭐' },
  combo_master:      { label: 'Combo Master',       desc: 'เปิดใช้งาน Adjacency Combo สำเร็จ', icon: '🔗' },
  immovable_object:  { label: 'Immovable Object',   desc: 'Square/Hexagon บล็อกศัตรูพร้อมกัน 3 ตัว', icon: '🪨' },
  drone_hunter:      { label: 'Drone Hunter',       desc: 'กำจัด Drone อากาศ 10 ตัว', icon: '🎯' },
  guard_unleashed:   { label: 'Guard Unleashed',    desc: 'Diamond ฟาด Bladestorm สำเร็จ 5 ครั้ง', icon: '💎' },
};

// ─── Buff Cards Definitions (Phase 2 Double-Edged) ──────────────────────────
export const BUFF_CARDS = [
  { id: 'sniper_speed', title: '🏹 Hyper Focus', desc: 'ยูนิต Sniper โจมตีเร็วขึ้น 25% (แต่ศัตรูเดินเร็วขึ้น +10%)', icon: '⚡', buffType: 'sniperSpeed', value: 0.25 },
  { id: 'defender_hp', title: '🧱 Aegis Shell', desc: 'ยูนิต Defender พลังชีวิตสูงสุด +150 (แต่ศัตรูป้องกัน DEF +15)', icon: '🛡️', buffType: 'defenderHp', value: 150 },
  { id: 'defender_block', title: '🛡️ Iron Wall', desc: 'ยูนิต Defender บล็อกเพิ่มได้ +1 ตัว (แต่ศัตรูโจมตีแรงขึ้น +20%)', icon: '🧱', buffType: 'defenderBlock', value: 1 },
  { id: 'healer_amount', title: '🩹 Rejuvenate', desc: 'ยูนิต Medic ฟื้นฟู HP เพิ่มขึ้น +15 (แต่ศัตรูต้านเวท RES +10%)', icon: '💚', buffType: 'healerAmount', value: 15 },
  { id: 'supporter_slow', title: '🌀 Polar Freeze', desc: 'ยูนิต Supporter สโลว์เพิ่มขึ้น +8% (แต่ศัตรูป้องกัน DEF +10)', icon: '❄️', buffType: 'supporterSlow', value: 0.08 },
  { id: 'caster_cd', title: '☄️ Time Warp', desc: 'ยูนิต Caster ลด Cooldown สกิลลง 20% (แต่ศัตรูต้านเวท RES +15%)', icon: '🔮', buffType: 'casterCd', value: 0.20 },
  { id: 'guard_dmg', title: '🩸 Berserk Drive', desc: 'ยูนิต Guard พลังโจมตีเพิ่มขึ้น +20 (แต่ศัตรูพลังชีวิตเพิ่มขึ้น +80 HP)', icon: '⚔️', buffType: 'guardDmg', value: 20 },
  { id: 'energy_reward', title: '🔋 Energy Dynamo', desc: 'ได้รับพลังงานเพิ่มขึ้น +3 ต่อตัว (แต่ศัตรูป้องกัน DEF +10)', icon: '⚡', buffType: 'energyReward', value: 3 },
  { id: 'enemy_speed', title: '⏳ Chrono Slow', desc: 'ลดความเร็วศัตรูพื้นฐานลง 15% (แต่ยูนิต Sniper/Guard ตีเบาลง -10%)', icon: '🐌', buffType: 'enemySpeed', value: 0.15 },
  { id: 'enemy_armor', title: '🧪 Corrosive Acid', desc: 'ลดพลังป้องกัน DEF ศัตรูลง 20% (แต่ยูนิตเราเลือดสูงสุดลดลง -10%)', icon: '📉', buffType: 'enemyArmor', value: 0.20 },
  { id: 'deployment_limit', title: '👥 Extra Tactical', desc: 'ขยายจำนวนโควต้ายูนิตสูงสุดในสนามได้ +1 ตัว (แต่บวก HP ศัตรู +100 HP)', icon: '👥', buffType: 'deploymentLimit', value: 1 },
];

function getRandomDraftCards() {
  const shuffled = [...BUFF_CARDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// ─── Initial State ────────────────────────────────────────────────────────────
export const INITIAL_STATE = {
  phase: 'menu',
  mapId: 'tri-path',
  wave: 0,
  waveActive: false,
  betweenWaves: true,
  hp: 20,
  maxHp: 20,
  energy: 180,
  score: 0,
  speed: 1,
  units: {},
  enemies: {},
  puddles: [],
  selectedUnitId: null,
  pendingPlacement: null, // { col, row, type } waiting for direction
  difficultyMod: 1.0,
  performanceScore: 0,
  waveEnemiesRemaining: 0,
  tutorialStep: 0,
  tutorialDone: false,
  soundEnabled: true,
  volume: 0.6,
  achievements: {},
  activeAchievement: null,
  dronesKilled: 0,
  bladestormCount: 0,
  hpAtWave5Start: null,
  paused: false,
  showCardDraft: false,
  draftCards: [],
  // Difficulty contracts & Score multiplier
  selectedContracts: {},
  scoreMultiplier: 1.0,
  activeBuffs: {
    sniperSpeed: 0,
    defenderHp: 0,
    defenderBlock: 0,
    healerAmount: 0,
    supporterSlow: 0,
    casterCd: 0,
    guardDmg: 0,
    energyReward: 0,
    enemySpeed: 0,
    enemyArmor: 0,
    deploymentLimit: 0,
    
    // Double-Edged drawbacks/mutations
    enemySpeedIncrease: 0,
    enemyDefIncrease: 0,
    enemyAtkIncrease: 0,
    enemyResIncrease: 0,
    enemyHpIncrease: 0,
    sniperGuardDmgPenalty: 0,
    playerHpPenalty: 0,
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function unlockAchievement(state, id) {
  if (state.achievements[id]) return state;
  const def = ACHIEVEMENT_DEFS[id];
  if (!def) return state;
  return {
    ...state,
    achievements: { ...state.achievements, [id]: true },
    activeAchievement: { id, ...def },
  };
}

function checkAchievements(state) {
  let s = state;
  if (s.energy >= 500) s = unlockAchievement(s, 'energy_baron');
  if (s.dronesKilled >= 10) s = unlockAchievement(s, 'drone_hunter');
  if (s.bladestormCount >= 5) s = unlockAchievement(s, 'guard_unleashed');
  return s;
}

function reducer(state, action) {
  switch (action.type) {

    case 'START_GAME': {
      soundManager.init();
      soundManager.setEnabled(state.soundEnabled);
      soundManager.setVolume(state.volume);
      soundManager.startBGM();

      // Read contracts selected at startup
      const contracts = action.payload?.contracts || {};
      let scoreMult = 1.0;
      if (contracts.hp_restrict) scoreMult += 0.30;
      if (contracts.unit_hp_debuff) scoreMult += 0.40;
      if (contracts.enemy_speed_buff) scoreMult += 0.50;
      if (contracts.enemy_def_buff) scoreMult += 0.60;

      const baseHp = contracts.hp_restrict ? 5 : 20;

      return {
        ...INITIAL_STATE,
        phase: 'playing',
        mapId: action.payload?.mapId || state.mapId || 'tri-path',
        betweenWaves: true,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        tutorialDone: state.tutorialDone,
        achievements: state.achievements,
        activeBuffs: { ...INITIAL_STATE.activeBuffs },
        selectedContracts: contracts,
        scoreMultiplier: scoreMult,
        hp: baseHp,
        maxHp: baseHp,
      };
    }

    case 'SET_MAP':
      return { ...state, mapId: action.payload };

    case 'SET_PHASE':
      if (action.payload === 'menu' || action.payload === 'gameover') {
        soundManager.stopBGM();
      } else if (action.payload === 'playing') {
        soundManager.startBGM();
      }
      return { ...state, phase: action.payload };

    case 'QUIT_TO_MENU':
      soundManager.stopBGM();
      return { ...INITIAL_STATE, phase: 'menu' };

    case 'SET_SPEED':
      return { ...state, speed: action.payload };

    case 'SET_PAUSED':
      return { ...state, paused: action.payload };

    case 'SELECT_UNIT_TYPE':
      return { ...state, selectedUnitType: action.payload, selectedUnitId: null, pendingPlacement: null };

    case 'SELECT_PLACED_UNIT':
      return { ...state, selectedUnitId: action.payload, selectedUnitType: null, pendingPlacement: null };

    case 'DESELECT':
      return { ...state, selectedUnitType: null, selectedUnitId: null, pendingPlacement: null };

    case 'SET_PENDING_PLACEMENT': {
      const { col, row, type } = action.payload;
      const unitData = UNIT_DATA[type];
      const onPath = isCellOnPath(col, row, state.mapId);
      
      if (unitData.placementType === 'ground' && !onPath) return state;
      if (unitData.placementType === 'elevated' && onPath) return state;
      if (state.energy < unitData.cost) return state;
      
      const isOccupied = Object.values(state.units).some(u => u.col === col && u.row === row);
      if (isOccupied) return state;

      return { ...state, pendingPlacement: action.payload };
    }

    case 'CANCEL_PENDING_PLACEMENT':
      return { ...state, pendingPlacement: null };

    case 'CLEAR_ACHIEVEMENT':
      return { ...state, activeAchievement: null };

    case 'PLACE_UNIT': {
      const { col, row, type, facing } = action.payload;
      const unitData = UNIT_DATA[type];
      const onPath = isCellOnPath(col, row, state.mapId);

      if (unitData.placementType === 'ground' && !onPath) return state;
      if (unitData.placementType === 'elevated' && onPath) return state;

      const occupied = Object.values(state.units).some(u => u.col === col && u.row === row);
      if (occupied) return state;

      // Check deployment limit (Deployment Limit card buff increases limit)
      const activeUnitCount = Object.keys(state.units).length;
      const maxUnits = (MAPS[state.mapId]?.maxUnits || 8) + (state.activeBuffs?.deploymentLimit || 0);
      if (activeUnitCount >= maxUnits) {
        soundManager.playLowEnergy();
        return state;
      }

      const cost = unitData.baseCost;
      if (state.energy < cost) return state;

      const id = nextUnitId();
      const stats = getUnitStats(type, 0);
      
      let maxHpVal = stats.hp;
      if (type === 'square' && state.activeBuffs?.defenderHp) {
        maxHpVal += state.activeBuffs.defenderHp;
      }
      
      // Card penalty: enemy_armor reduces player units max HP by 10%
      if (state.activeBuffs?.playerHpPenalty) {
        maxHpVal = Math.round(maxHpVal * (1 - state.activeBuffs.playerHpPenalty));
      }

      // Pre-game contract: unit_hp_debuff reduces player units max HP by 25%
      if (state.selectedContracts?.unit_hp_debuff) {
        maxHpVal = Math.round(maxHpVal * 0.75);
      }

      const unit = {
        id,
        type,
        col,
        row,
        tier: 0,
        facing: facing || 'right', //facing direction selected at placement!
        ...stats,
        maxHp: maxHpVal,
        currentHp: maxHpVal,
        currentBlocked: 0,
        shotCount: 0,
        skillCooldown: 0,
        skillActive: false,
        attackTimer: 0,
        healTimer: 0,
        regenAccum: 0,
        comboBonus: null,
        bladestormCount: 0,
      };
      soundManager.playUnitPlaced();
      let s = {
        ...state,
        energy: state.energy - cost,
        units: { ...state.units, [id]: unit },
        selectedUnitType: null,
      };
      s = checkAchievements(s);
      return s;
    }

    case 'UPGRADE_UNIT': {
      const { id } = action.payload;
      const unit = state.units[id];
      if (!unit || unit.tier >= 2) return state;
      const upgradeCost = getUnitStats(unit.type, unit.tier).upgradeCost;
      if (state.energy < upgradeCost) return state;
      const newTier = unit.tier + 1;
      const newStats = getUnitStats(unit.type, newTier);
      
      let maxHpVal = newStats.hp;
      if (unit.type === 'square' && state.activeBuffs?.defenderHp) {
        maxHpVal += state.activeBuffs.defenderHp;
      }

      // Card penalty
      if (state.activeBuffs?.playerHpPenalty) {
        maxHpVal = Math.round(maxHpVal * (1 - state.activeBuffs.playerHpPenalty));
      }

      // Pre-game contract
      if (state.selectedContracts?.unit_hp_debuff) {
        maxHpVal = Math.round(maxHpVal * 0.75);
      }

      soundManager.playUnitUpgraded();
      let s = {
        ...state,
        energy: state.energy - upgradeCost,
        units: {
          ...state.units,
          [id]: {
            ...unit,
            tier: newTier,
            ...newStats,
            maxHp: maxHpVal,
            currentHp: Math.round((unit.currentHp / unit.maxHp) * maxHpVal),
          },
        },
        selectedUnitId: null,
      };
      if (newTier === 2) s = unlockAchievement(s, 'elite_squad');
      s = checkAchievements(s);
      return s;
    }

    case 'SELL_UNIT': {
      const { id } = action.payload;
      const unit = state.units[id];
      if (!unit) return state;
      const refund = Math.round(unit.cost * (0.5 + unit.tier * 0.1));
      const newEnemies = { ...state.enemies };
      Object.values(newEnemies).forEach(e => {
        if (e.blockedBy === id) {
          newEnemies[e.id] = { ...e, isBlocked: false, blockedBy: null };
        }
      });
      soundManager.playUnitSold();
      const newUnits = { ...state.units };
      delete newUnits[id];
      return {
        ...state,
        energy: state.energy + refund,
        units: newUnits,
        enemies: newEnemies,
        selectedUnitId: null,
      };
    }

    case 'UNIT_DEFEATED': {
      const { id } = action.payload;
      const unit = state.units[id];
      if (!unit) return state;
      
      soundManager.playGameOver();
      particles.emitDeath((unit.col + 0.5) * CELL_SIZE, (unit.row + 0.5) * CELL_SIZE, '#E74C3C', false);
      
      const newEnemies = { ...state.enemies };
      Object.values(newEnemies).forEach(e => {
        if (e.blockedBy === id) {
          newEnemies[e.id] = { ...e, isBlocked: false, blockedBy: null };
        }
      });

      const newUnits = { ...state.units };
      delete newUnits[id];
      return {
        ...state,
        units: newUnits,
        enemies: newEnemies,
        selectedUnitId: state.selectedUnitId === id ? null : state.selectedUnitId,
      };
    }

    case 'START_WAVE': {
      const waveIndex = state.wave;
      soundManager.playWaveStart(isBossWave(waveIndex, state.mapId));
      const hpAtWave5Start = waveIndex === 4 ? state.hp : state.hpAtWave5Start;
      return {
        ...state,
        waveActive: true,
        betweenWaves: false,
        hpAtWave5Start,
        paused: false,
        waveEnemiesKilled: 0,
      };
    }

    case 'SPAWN_ENEMY': {
      const { enemyType, laneIndex, isAirLane } = action.payload;
      const id = nextEnemyId();
      const stats = getEnemyStats(enemyType, state.wave + 1, state.difficultyMod);
      const map = MAPS[state.mapId] || MAPS['tri-path'];

      let lane, pxX, pxY;
      if (isAirLane) {
        lane = map.airLane;
      } else {
        lane = map.groundLanes[laneIndex ?? 0] || map.groundLanes[0];
      }
      const startWp = lane[0];
      pxX = (startWp.col + 0.5) * 72;
      pxY = (startWp.row + 0.5) * 72;

      // Card buffs: apply boss extra HP reduction, and double-edged enemy extra HP increases!
      let finalHp = stats.hp;
      if (enemyType === 'boss' && state.activeBuffs?.bossHp) {
        finalHp = Math.round(finalHp * (1 - state.activeBuffs.bossHp));
      }
      if (state.activeBuffs?.enemyHpIncrease) {
        finalHp += state.activeBuffs.enemyHpIncrease;
      }

      const enemy = {
        ...stats,
        id,
        hp: finalHp,
        maxHp: finalHp,
        currentHp: finalHp,
        type: enemyType,
        laneIndex: isAirLane ? -1 : (laneIndex ?? 0),
        isAirLane: !!isAirLane,
        waypointIndex: 0,
        x: pxX,
        y: pxY,
        speed: stats.speed * 72,
        baseSpeed: stats.speed * 72,
        isBlocked: false,
        blockedBy: null,
        slowEffects: [],
        stunRemaining: 0,
        armorDebuffRemaining: 0,
        armorDebuffAmount: 0,
        taunted: false,
        tauntTarget: null,
        attackTimer: 0.5,
      };
      return {
        ...state,
        enemies: { ...state.enemies, [id]: enemy },
        waveEnemiesRemaining: state.waveEnemiesRemaining + 1,
      };
    }

    case 'WAVE_COMPLETE': {
      const wavesCleared = state.wave + 1;
      const hpLost = state.maxHp - state.hp;
      const perfScore = state.performanceScore + wavesCleared * 10 - hpLost * 2;
      const newDiffMod = state.wave % 3 === 2
        ? Math.max(0.8, Math.min(2.5, 1 + perfScore * 0.002))
        : state.difficultyMod;
      
      if (state.mapId === 'stage4' && state.wave === 3) {
        soundManager.stopBGM();
        soundManager.playWaveCleared();
        return {
          ...state,
          phase: 'stage4_cleared',
          waveActive: false,
          betweenWaves: false,
          enemies: {},
          puddles: [],
        };
      }

      // Draw Buff Cards
      const cards = getRandomDraftCards();
      soundManager.playWaveCleared();
      let s = {
        ...state,
        wave: state.wave + 1,
        waveActive: false,
        betweenWaves: true,
        waveEnemiesRemaining: 0,
        performanceScore: perfScore,
        difficultyMod: newDiffMod,
        energy: state.energy + 50,
        // Score Multiplier applied here!
        score: state.score + Math.round(wavesCleared * 100 * state.scoreMultiplier),
        showCardDraft: true,
        draftCards: cards,
        paused: false,
      };
      if (state.wave === 4 && state.hpAtWave5Start === state.maxHp && state.hp === state.maxHp) {
        s = unlockAchievement(s, 'perfect_tactician');
      }
      return s;
    }

    case 'CHOOSE_DRAFT_CARD': {
      const card = action.payload;
      soundManager.playUnitUpgraded();
      
      const newUnits = { ...state.units };
      
      // 1. Dynamic player buff mapping
      const nextBuffs = {
        ...state.activeBuffs,
        [card.buffType]: (state.activeBuffs[card.buffType] || 0) + card.value,
      };

      // 2. Double-Edged active drawbacks applied to state.activeBuffs
      if (card.id === 'sniper_speed') {
        nextBuffs.enemySpeedIncrease = (nextBuffs.enemySpeedIncrease || 0) + 0.10;
      } else if (card.id === 'defender_hp') {
        nextBuffs.enemyDefIncrease = (nextBuffs.enemyDefIncrease || 0) + 15;
        // Apply defender extra max HP immediately to placed defenders
        Object.values(newUnits).forEach(u => {
          if (u.type === 'square') {
            u.maxHp += card.value;
            u.currentHp += card.value;
          }
        });
      } else if (card.id === 'defender_block') {
        nextBuffs.enemyAtkIncrease = (nextBuffs.enemyAtkIncrease || 0) + 0.20;
      } else if (card.id === 'healer_amount') {
        nextBuffs.enemyResIncrease = (nextBuffs.enemyResIncrease || 0) + 0.10;
      } else if (card.id === 'supporter_slow') {
        nextBuffs.enemyDefIncrease = (nextBuffs.enemyDefIncrease || 0) + 10;
      } else if (card.id === 'caster_cd') {
        nextBuffs.enemyResIncrease = (nextBuffs.enemyResIncrease || 0) + 0.15;
      } else if (card.id === 'guard_dmg') {
        nextBuffs.enemyHpIncrease = (nextBuffs.enemyHpIncrease || 0) + 80;
      } else if (card.id === 'energy_reward') {
        nextBuffs.enemyDefIncrease = (nextBuffs.enemyDefIncrease || 0) + 10;
      } else if (card.id === 'enemy_speed') {
        nextBuffs.sniperGuardDmgPenalty = (nextBuffs.sniperGuardDmgPenalty || 0) + 0.10;
      } else if (card.id === 'enemy_armor') {
        nextBuffs.playerHpPenalty = (nextBuffs.playerHpPenalty || 0) + 0.10;
        // Reduce HP of all existing placed units immediately
        Object.values(newUnits).forEach(u => {
          const dmg = Math.round(u.maxHp * 0.10);
          u.maxHp = Math.max(10, u.maxHp - dmg);
          u.currentHp = Math.max(1, u.currentHp - dmg);
        });
      } else if (card.id === 'deployment_limit') {
        nextBuffs.enemyHpIncrease = (nextBuffs.enemyHpIncrease || 0) + 100;
      }

      return {
        ...state,
        showCardDraft: false,
        draftCards: [],
        units: newUnits,
        activeBuffs: nextBuffs,
        difficultyMod: Math.min(5.0, state.difficultyMod + 0.15), // Scaling difficulty with buffs
      };
    }

    case 'ENEMY_REACHED_BASE': {
      const { id, damage } = action.payload;
      const newHp = state.hp - damage;
      soundManager.playBaseDamaged();
      const newEnemies = { ...state.enemies };
      delete newEnemies[id];
      if (newHp <= 0) {
        soundManager.playGameOver();
        soundManager.stopBGM();
        return { ...state, hp: 0, enemies: newEnemies, phase: 'gameover' };
      }
      return {
        ...state,
        hp: newHp,
        enemies: newEnemies,
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        waveEnemiesKilled: (state.waveEnemiesKilled || 0) + 1,
      };
    }

    case 'ENEMY_KILLED': {
      const { id, reward, isDrone, isBladestorm } = action.payload;
      const newEnemies = { ...state.enemies };
      delete newEnemies[id];
      let s = {
        ...state,
        enemies: newEnemies,
        energy: state.energy + reward,
        // Score Multiplier applied here!
        score: state.score + Math.round(reward * state.scoreMultiplier),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - 1),
        waveEnemiesKilled: (state.waveEnemiesKilled || 0) + 1,
        dronesKilled: state.dronesKilled + (isDrone ? 1 : 0),
        bladestormCount: state.bladestormCount + (isBladestorm ? 1 : 0),
      };
      s = checkAchievements(s);
      return s;
    }

    case 'ENEMY_KILLED_BATCH': {
      const { ids, reward, isBladestorm } = action.payload;
      const newEnemies = { ...state.enemies };
      ids.forEach(id => delete newEnemies[id]);
      let s = {
        ...state,
        enemies: newEnemies,
        energy: state.energy + reward,
        // Score Multiplier applied here!
        score: state.score + Math.round(reward * state.scoreMultiplier),
        waveEnemiesRemaining: Math.max(0, state.waveEnemiesRemaining - ids.length),
        waveEnemiesKilled: (state.waveEnemiesKilled || 0) + ids.length,
        bladestormCount: state.bladestormCount + (isBladestorm ? 1 : 0),
      };
      s = checkAchievements(s);
      return s;
    }

    case 'UPDATE_ENEMY': {
      const { id, updates } = action.payload;
      if (!state.enemies[id]) return state;
      let s = {
        ...state,
        enemies: { ...state.enemies, [id]: { ...state.enemies[id], ...updates } },
      };
      const blocker3 = Object.values(s.units).find(u => (u.currentBlocked || 0) >= 3);
      if (blocker3) s = unlockAchievement(s, 'immovable_object');
      return s;
    }

    case 'UPDATE_UNIT': {
      const { id, updates } = action.payload;
      if (!state.units[id]) return state;
      let s = {
        ...state,
        units: { ...state.units, [id]: { ...state.units[id], ...updates } },
      };
      s = checkAchievements(s);
      return s;
    }

    case 'SET_UNIT_COMBO': {
      const { id, comboBonus } = action.payload;
      if (!state.units[id]) return state;
      return {
        ...state,
        units: { ...state.units, [id]: { ...state.units[id], comboBonus } },
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      return unlockAchievement(state, action.payload);
    }

    case 'ADD_PUDDLE': {
      const puddle = { ...action.payload, id: nextPuddleId() };
      return { ...state, puddles: [...state.puddles, puddle] };
    }

    case 'UPDATE_PUDDLES': {
      const newPuddles = state.puddles
        .map(p => ({ ...p, remaining: p.remaining - action.dt }))
        .filter(p => p.remaining > 0);
      return { ...state, puddles: newPuddles };
    }

    case 'SET_SOUND':
      soundManager.setEnabled(action.payload);
      return { ...state, soundEnabled: action.payload };

    case 'SET_VOLUME':
      soundManager.setVolume(action.payload);
      return { ...state, volume: action.payload };

    case 'SET_TUTORIAL_STEP':
      return { ...state, tutorialStep: action.payload };

    case 'TUTORIAL_DONE':
      return { ...state, tutorialDone: true };

    case 'SAVE_GAME': {
      const save = {
        version: SAVE_VERSION,
        wave: state.wave,
        hp: state.hp,
        energy: state.energy,
        score: state.score,
        mapId: state.mapId,
        units: state.units,
        difficultyMod: state.difficultyMod,
        tutorialDone: state.tutorialDone,
        achievements: state.achievements,
        activeBuffs: state.activeBuffs,
        selectedContracts: state.selectedContracts,
        scoreMultiplier: state.scoreMultiplier,
      };
      localStorage.setItem('gd_save', JSON.stringify(save));
      return state;
    }

    case 'LOAD_GAME': {
      try {
        const raw = localStorage.getItem('gd_save');
        if (!raw) return state;
        const save = JSON.parse(raw);
        if (save.version !== SAVE_VERSION) return state;
        
        soundManager.init();
        soundManager.setEnabled(state.soundEnabled);
        soundManager.setVolume(state.volume);
        soundManager.startBGM();

        return {
          ...INITIAL_STATE,
          ...save,
          phase: 'playing',
          betweenWaves: true,
          waveActive: false,
          enemies: {},
          puddles: [],
          soundEnabled: state.soundEnabled,
          volume: state.volume,
          paused: false,
        };
      } catch { return state; }
    }

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const actions = {
    startGame:       (mapId, contracts = {}) => dispatch({ type: 'START_GAME', payload: { mapId, contracts } }),
    setMap:          (id)    => dispatch({ type: 'SET_MAP', payload: id }),
    setPhase:        (phase) => dispatch({ type: 'SET_PHASE', payload: phase }),
    setSpeed:        (speed) => dispatch({ type: 'SET_SPEED', payload: speed }),
    setPaused:       (paused)=> dispatch({ type: 'SET_PAUSED', payload: paused }),
    quitToMenu:      ()      => dispatch({ type: 'QUIT_TO_MENU' }),
    chooseDraftCard: (card)  => dispatch({ type: 'CHOOSE_DRAFT_CARD', payload: card }),
    selectUnitType:  (type)  => dispatch({ type: 'SELECT_UNIT_TYPE', payload: type }),
    selectPlacedUnit:(id)    => dispatch({ type: 'SELECT_PLACED_UNIT', payload: id }),
    deselect:        ()      => dispatch({ type: 'DESELECT' }),
    setPendingPlacement: (placement) => dispatch({ type: 'SET_PENDING_PLACEMENT', payload: placement }),
    cancelPendingPlacement: () => dispatch({ type: 'CANCEL_PENDING_PLACEMENT' }),
    placeUnit:       (col, row, type, facing = 'right') => dispatch({ type: 'PLACE_UNIT', payload: { col, row, type, facing } }),
    upgradeUnit:     (id)    => dispatch({ type: 'UPGRADE_UNIT', payload: { id } }),
    sellUnit:        (id)    => dispatch({ type: 'SELL_UNIT', payload: { id } }),
    startWave:       ()      => dispatch({ type: 'START_WAVE' }),
    spawnEnemy:      (enemyType, laneIndex, isAirLane) =>
                               dispatch({ type: 'SPAWN_ENEMY', payload: { enemyType, laneIndex, isAirLane } }),
    waveComplete:    ()      => dispatch({ type: 'WAVE_COMPLETE' }),
    enemyReachedBase:(id, damage) => dispatch({ type: 'ENEMY_REACHED_BASE', payload: { id, damage } }),
    enemyKilled:     (id, reward, opts = {}) =>
                               dispatch({ type: 'ENEMY_KILLED', payload: { id, reward, ...opts } }),
    enemyKilledBatch:(ids, reward, opts = {}) =>
                               dispatch({ type: 'ENEMY_KILLED_BATCH', payload: { ids, reward, ...opts } }),
    updateEnemy:     (id, updates) => dispatch({ type: 'UPDATE_ENEMY', payload: { id, updates } }),
    updateUnit:      (id, updates) => dispatch({ type: 'UPDATE_UNIT', payload: { id, updates } }),
    setUnitCombo:    (id, comboBonus) => dispatch({ type: 'SET_UNIT_COMBO', payload: { id, comboBonus } }),
    unlockAchievement:(id)   => dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id }),
    clearAchievement:()      => dispatch({ type: 'CLEAR_ACHIEVEMENT' }),
    addPuddle:       (puddle)=> dispatch({ type: 'ADD_PUDDLE', payload: puddle }),
    updatePuddles:   (dt)    => dispatch({ type: 'UPDATE_PUDDLES', dt }),
    setSound:        (val)   => dispatch({ type: 'SET_SOUND', payload: val }),
    setVolume:       (val)   => dispatch({ type: 'SET_VOLUME', payload: val }),
    setTutorialStep: (step)  => dispatch({ type: 'SET_TUTORIAL_STEP', payload: step }),
    tutorialDone:    ()      => dispatch({ type: 'TUTORIAL_DONE' }),
    saveGame:        ()      => dispatch({ type: 'SAVE_GAME' }),
    loadGame:        ()      => {
      soundManager.init();
      dispatch({ type: 'LOAD_GAME' });
    },
  };

  return { state, dispatch, actions };
}
