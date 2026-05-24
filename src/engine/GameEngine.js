// src/engine/GameEngine.js
// Main game loop — 60fps via requestAnimationFrame
// Handles: Chebyshev grid range, ground vs aerial targeting, block/slow mechanics,
//          adjacency combo scanning, Diamond Bladestorm, Drone air lane, Canvas renderer

import { MAPS, MAP_PATH_CELLS, generateWave, getLaneForEnemy } from '../constants/waves';
import { UNIT_DATA, SLOW_FLOOR, getUnitStats, chebyshevDist, enemyInRange, getAdjacencyBonus, CELL_SIZE, GRID_COLS, GRID_ROWS } from '../constants/units';
import { ENEMY_DATA } from '../constants/enemies';
import soundManager from './SoundManager';
import particles from './ParticleSystem';

// Convert unit grid col/row to pixel center
const cellPx = (col, row) => ({
  x: (col + 0.5) * CELL_SIZE,
  y: (row + 0.5) * CELL_SIZE,
});

// Pixel distance
const dist2d = (ax, ay, bx, by) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

// Convert enemy pixel position to grid col/row
const pxToCell = (px, py) => ({
  col: Math.max(0, Math.min(GRID_COLS - 1, Math.floor(px / CELL_SIZE))),
  row: Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(py / CELL_SIZE))),
});

export class GameEngine {
  constructor(stateRef, dispatchRef, canvasRef) {
    this.stateRef   = stateRef;
    this.dispatch   = dispatchRef;
    this.canvas     = canvasRef;
    this.rafId      = null;
    this.lastTime   = null;
    this.waveSpawnQueue = [];
    this.spawnTimer = 0;
    this.laneOccupancy = [];
    this.waveStarted = false;
  }

  start() {
    if (this.rafId) return;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  // ─── Wave Spawner ──────────────────────────────────────────────────────────
  startWave(waveIndex) {
    const state = this.stateRef.current;
    const mapId = state?.mapId || 'tri-path';
    console.log("ENGINE: startWave called. waveIndex =", waveIndex, "mapId =", mapId);
    const groups = generateWave(waveIndex, mapId);
    console.log("ENGINE: generated wave groups =", groups);
    const map = MAPS[mapId] || MAPS['tri-path'];

    this.waveSpawnQueue = [];
    this.laneOccupancy = new Array(map.groundLanes.length).fill(0);
    this.waveStarted = true;

    let t = 0;
    groups.forEach(group => {
      const startTime = t + (group.delay || 0);
      const isAir = group.lane === -1;
      for (let i = 0; i < group.count; i++) {
        let laneIdx;
        if (isAir) {
          laneIdx = -1;
        } else if (group.lane !== null && group.lane !== undefined && group.lane !== -1) {
          laneIdx = Math.min(group.lane, map.groundLanes.length - 1);
        } else {
          laneIdx = this._getLane(group.type, mapId);
        }
        this.waveSpawnQueue.push({
          time: startTime + i * group.interval,
          type: group.type,
          laneIdx,
          isAir,
        });
      }
      t = startTime + group.count * group.interval;
    });
    this.waveSpawnQueue.sort((a, b) => a.time - b.time);
    console.log("ENGINE: waveSpawnQueue populated. Queue size =", this.waveSpawnQueue.length, "Queue =", this.waveSpawnQueue);
    this.spawnTimer = 0;
  }

  _getLane(type, mapId) {
    return getLaneForEnemy(type, this.laneOccupancy, mapId);
  }

  _tickSpawner(dt, state) {
    if (!this.waveSpawnQueue || this.waveSpawnQueue.length === 0) {
      if (this.waveStarted && Object.keys(state.enemies).length === 0) {
        this.waveStarted = false;
        this.dispatch({ type: 'WAVE_COMPLETE' });
      }
      return;
    }
    this.spawnTimer += dt;
    while (this.waveSpawnQueue.length > 0 && this.spawnTimer >= this.waveSpawnQueue[0].time) {
      const spawn = this.waveSpawnQueue.shift();
      if (!spawn.isAir && spawn.laneIdx >= 0) {
        this.laneOccupancy[spawn.laneIdx] = (this.laneOccupancy[spawn.laneIdx] || 0) + 1;
      }
      this.dispatch({
        type: 'SPAWN_ENEMY',
        payload: { enemyType: spawn.type, laneIndex: spawn.isAir ? 0 : spawn.laneIdx, isAirLane: spawn.isAir },
      });
    }
  }

  // ─── Main Loop ─────────────────────────────────────────────────────────────
  _loop(now) {
    const state = this.stateRef.current;
    if (!state || state.phase === 'gameover' || state.phase === 'menu') {
      this.rafId = null;
      return;
    }
    const rawDt = Math.min((now - this.lastTime) / 1000, 0.05);
    const dt = rawDt * state.speed;
    this.lastTime = now;

    if (state.phase === 'playing') {
      if (!state.paused) {
        if (state.waveActive) this._tickSpawner(dt, state);
        this._scanCombos(state);
        this._tickEnemies(dt, state);
        this._tickUnits(dt, state);
        this._tickPuddles(dt, state);
      }
    }

    particles.update(dt);
    this._render(state);
    this.rafId = requestAnimationFrame(this._loop.bind(this));
  }

  // ─── Adjacency Combo Scanner ────────────────────────────────────────────────
  _scanCombos(state) {
    const units = Object.values(state.units);
    // Clear old combos first
    units.forEach(unit => {
      if (unit.comboBonus !== null) {
        this.dispatch({ type: 'SET_UNIT_COMBO', payload: { id: unit.id, comboBonus: null } });
      }
    });

    // For each pair of adjacent units (Chebyshev distance = 1)
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i];
        const b = units[j];
        if (chebyshevDist(a.col, a.row, b.col, b.row) !== 1) continue;
        const bonus = getAdjacencyBonus(a.type, b.type);
        if (!bonus) continue;
        // Apply combo to both units
        const bA = bonus.forUnit[a.type] || null;
        const bB = bonus.forUnit[b.type] || null;
        if (bA && a.comboBonus === null) {
          this.dispatch({ type: 'SET_UNIT_COMBO', payload: { id: a.id, comboBonus: bA } });
        }
        if (bB && b.comboBonus === null) {
          this.dispatch({ type: 'SET_UNIT_COMBO', payload: { id: b.id, comboBonus: bB } });
        }
        // Unlock combo_master achievement on first detection
        this.dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'combo_master' });
      }
    }
  }

  // ─── Enemy Movement ─────────────────────────────────────────────────────────
  _tickEnemies(dt, state) {
    const { enemies, units, puddles, mapId } = state;
    const map = MAPS[mapId] || MAPS['tri-path'];

    Object.values(enemies).forEach(enemy => {
      const isAerial = enemy.isAerial || false;

      // Speed with slows
      let speedMult = 1.0;
      const activeSlow = enemy.slowEffects?.filter(s => s.remaining > 0) || [];
      activeSlow.forEach(s => { speedMult *= (1 - s.amount); });

      // Frost Aura from Circle T3 (ground enemies only)
      if (!isAerial) {
        Object.values(units).forEach(unit => {
          if (unit.type === 'circle' && unit.tier === 2 && unit.hasSkill) {
            const skill = UNIT_DATA.circle.skills.t3;
            if (chebyshevDist(unit.col, unit.row, ...Object.values(pxToCell(enemy.x, enemy.y))) <= skill.aoeRange) {
              speedMult *= (1 - skill.slowPercent);
            }
          }
        });
      }

      // Puddle slow (ground only)
      if (!isAerial) {
        puddles.forEach(puddle => {
          if (dist2d(enemy.x, enemy.y, puddle.x, puddle.y) < CELL_SIZE * 0.7) {
            speedMult *= 0.60;
          }
        });
      }

      speedMult = Math.max(SLOW_FLOOR, speedMult);

      const newSlowEffects = activeSlow
        .map(s => ({ ...s, remaining: s.remaining - dt }))
        .filter(s => s.remaining > 0);
      const stunRem = Math.max(0, (enemy.stunRemaining || 0) - dt);
      const armorDebuffRem = Math.max(0, (enemy.armorDebuffRemaining || 0) - dt);

      if (stunRem > 0 && enemy.stunRemaining > 0) {
        this.dispatch({ type: 'UPDATE_ENEMY', payload: {
          id: enemy.id,
          updates: { slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
        }});
        return;
      }

      // Block mechanic — aerial enemies SKIP blocking entirely
      if (!isAerial && enemy.isBlocked) {
        const blocker = units[enemy.blockedBy];
        if (!blocker || blocker.currentHp <= 0 ||
            chebyshevDist(blocker.col, blocker.row, ...Object.values(pxToCell(enemy.x, enemy.y))) > 1) {
          this.dispatch({ type: 'UPDATE_ENEMY', payload: {
            id: enemy.id,
            updates: { isBlocked: false, blockedBy: null, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
          }});
        } else {
          // Blocked enemy deals melee damage to blocker
          const currentAtkTimer = (enemy.attackTimer || 0) - dt;
          if (currentAtkTimer <= 0) {
            const atkMult = 1 + (state.activeBuffs?.enemyAtkIncrease || 0);
            const enemyDmg = (enemy.damage || 1) * 20 * atkMult; // 20 flat damage per block
            const newUnitHp = Math.max(0, blocker.currentHp - enemyDmg);
            this.dispatch({ type: 'UPDATE_UNIT', payload: { id: blocker.id, updates: { currentHp: newUnitHp } } });
            particles.emitHit((blocker.col + 0.5) * CELL_SIZE, (blocker.row + 0.5) * CELL_SIZE, enemyDmg, '#E74C3C', false);
            
            // If blocker dies
            if (newUnitHp <= 0) {
              this.dispatch({ type: 'UNIT_DEFEATED', payload: { id: blocker.id } });
            }
            
            this.dispatch({ type: 'UPDATE_ENEMY', payload: {
              id: enemy.id,
              updates: { attackTimer: enemy.attackInterval || 1.2, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
            }});
          } else {
            this.dispatch({ type: 'UPDATE_ENEMY', payload: {
              id: enemy.id,
              updates: { attackTimer: currentAtkTimer, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
            }});
          }
        }
        return;
      }

      // Ranged enemy logic — shoots at units in range even if not blocked!
      if (enemy.type === 'ranged') {
        const currentAtkTimer = (enemy.attackTimer || 0) - dt;
        if (currentAtkTimer <= 0) {
          let targetUnit = null;
          let minUnitDist = Infinity;
          Object.values(units).forEach(u => {
            const { col: ec, row: er } = pxToCell(enemy.x, enemy.y);
            const d = chebyshevDist(u.col, u.row, ec, er);
            if (d <= (enemy.range || 2) && u.currentHp > 0) {
              if (d < minUnitDist) {
                minUnitDist = d;
                targetUnit = u;
              }
            }
          });

          if (targetUnit) {
            const atkMult = 1 + (state.activeBuffs?.enemyAtkIncrease || 0);
            const enemyDmg = (enemy.damage || 1) * 20 * atkMult;
            const newUnitHp = Math.max(0, targetUnit.currentHp - enemyDmg);
            this.dispatch({ type: 'UPDATE_UNIT', payload: { id: targetUnit.id, updates: { currentHp: newUnitHp } } });
            
            const ux = (targetUnit.col + 0.5) * CELL_SIZE;
            const uy = (targetUnit.row + 0.5) * CELL_SIZE;
            particles.emitAttack(enemy.x, enemy.y, ux, uy, '#E67E22', false);
            soundManager.playUnitAttack('square'); // Thud sound
            particles.emitHit(ux, uy, enemyDmg, '#E67E22', false);
            
            if (newUnitHp <= 0) {
              this.dispatch({ type: 'UNIT_DEFEATED', payload: { id: targetUnit.id } });
            }

            this.dispatch({ type: 'UPDATE_ENEMY', payload: {
              id: enemy.id,
              updates: { attackTimer: enemy.attackInterval || 1.5, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
            }});
          } else {
            this.dispatch({ type: 'UPDATE_ENEMY', payload: {
              id: enemy.id,
              updates: { attackTimer: currentAtkTimer, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
            }});
          }
        } else {
          this.dispatch({ type: 'UPDATE_ENEMY', payload: {
            id: enemy.id,
            updates: { attackTimer: currentAtkTimer, slowEffects: newSlowEffects, stunRemaining: stunRem, armorDebuffRemaining: armorDebuffRem },
          }});
        }
      }

      // Move along waypoints
      const lane = isAerial ? map.airLane : (map.groundLanes[enemy.laneIndex] || map.groundLanes[0]);
      let wpIdx = enemy.waypointIndex;

      if (wpIdx >= lane.length - 1) {
        const atkMult = 1 + (state.activeBuffs?.enemyAtkIncrease || 0);
        this.dispatch({ type: 'ENEMY_REACHED_BASE', payload: { id: enemy.id, damage: Math.round(enemy.damage * atkMult) } });
        particles.emitDeath(enemy.x, enemy.y, ENEMY_DATA[enemy.type]?.color || '#E74C3C', false);
        return;
      }

      const effectiveSpeed = enemy.baseSpeed * speedMult * (1 - (state.activeBuffs?.enemySpeed || 0) + (state.activeBuffs?.enemySpeedIncrease || 0));
      const target = lane[wpIdx + 1];
      const tx = (target.col + 0.5) * CELL_SIZE;
      const ty = (target.row + 0.5) * CELL_SIZE;
      const dx = tx - enemy.x;
      const dy = ty - enemy.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const step = effectiveSpeed * dt;

      let newX = enemy.x, newY = enemy.y, newWpIdx = wpIdx;
      if (d <= step) { newX = tx; newY = ty; newWpIdx = wpIdx + 1; }
      else { newX = enemy.x + (dx / d) * step; newY = enemy.y + (dy / d) * step; }

      // Check block (ground enemies only)
      let newIsBlocked = false, newBlockedBy = null;
      if (!isAerial) {
        Object.values(units).forEach(unit => {
          if (newIsBlocked) return;
          const data = UNIT_DATA[unit.type];
          if (data.placementType !== 'ground') return;  // elevated units never block
          const blockCap = (unit.blockCount ?? 0) + (unit.type === 'square' ? (state.activeBuffs?.defenderBlock || 0) : 0);
          if (blockCap === 0) return;
          const { col: ec, row: er } = pxToCell(newX, newY);
          if (chebyshevDist(unit.col, unit.row, ec, er) <= 0.5 &&
              (unit.currentBlocked || 0) < blockCap) {
            newIsBlocked = true;
            newBlockedBy = unit.id;
            this.dispatch({ type: 'UPDATE_UNIT', payload: {
              id: unit.id,
              updates: { currentBlocked: (unit.currentBlocked || 0) + 1 },
            }});
          }
        });
      }

      this.dispatch({ type: 'UPDATE_ENEMY', payload: {
        id: enemy.id,
        updates: {
          x: newX, y: newY,
          waypointIndex: newWpIdx,
          slowEffects: newSlowEffects,
          stunRemaining: stunRem,
          armorDebuffRemaining: armorDebuffRem,
          isBlocked: newIsBlocked,
          blockedBy: newBlockedBy || enemy.blockedBy,
        },
      }});
    });
  }

  // ─── Unit Attacks ───────────────────────────────────────────────────────────
  _tickUnits(dt, state) {
    const { units, enemies, puddles } = state;
    const enemyList = Object.values(enemies);

    Object.values(units).forEach(unit => {
      const data = UNIT_DATA[unit.type];
      const combo = unit.comboBonus || {};

      // ── HP regen from combo ──
      if (combo.regenPerSec) {
        const regenAccum = (unit.regenAccum || 0) + combo.regenPerSec * dt;
        if (regenAccum >= 1) {
          const heal = Math.floor(regenAccum);
          const newHp = Math.min(unit.maxHp, unit.currentHp + heal);
          this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { currentHp: newHp, regenAccum: regenAccum - heal } } });
        } else {
          this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { regenAccum } } });
        }
      }

      // ── Circle Medic: heal pulse ──
      if (unit.type === 'circle') {
        const healTimer = (unit.healTimer || 0) - dt;
        if (healTimer <= 0) {
          const interval = data.healInterval || 1.0;
          let healAmt = unit.healAmount || 15;
          if (combo.healBonus) healAmt = Math.round(healAmt * (1 + combo.healBonus));
          if (state.activeBuffs?.healerAmount) healAmt += state.activeBuffs.healerAmount;

          Object.values(units).forEach(ally => {
            if (ally.id === unit.id) return;
            const d = chebyshevDist(unit.col, unit.row, ally.col, ally.row);
            if (d <= unit.range && ally.currentHp < ally.maxHp) {
              const newHp = Math.min(ally.maxHp, ally.currentHp + healAmt);
              this.dispatch({ type: 'UPDATE_UNIT', payload: { id: ally.id, updates: { currentHp: newHp } } });
              particles.emitHeal((ally.col + 0.5) * CELL_SIZE, (ally.row + 0.5) * CELL_SIZE, healAmt);
            }
          });
          soundManager.playHealPulse();
          this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { healTimer: interval } } });
        } else {
          this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { healTimer } } });
        }
        return;
      }

      // ── Attacking units ──
      let attackInterval = data.attackInterval || 1.0;
      if (combo.attackSpeedBonus) attackInterval *= (1 - combo.attackSpeedBonus);
      if (unit.type === 'triangle' && state.activeBuffs?.sniperSpeed) attackInterval *= (1 - state.activeBuffs.sniperSpeed);
      const attackTimer = (unit.attackTimer || 0) - dt;
      const skillCd = Math.max(0, (unit.skillCooldown || 0) - dt);

      if (attackTimer > 0) {
        this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { attackTimer, skillCooldown: skillCd } } });
        return;
      }

      // ── Target selection (Chebyshev range) ──
      // Ground units: cannot target aerial enemies
      // Elevated units: target aerial first if antiAir, else nearest
      const isElevated = data.placementType === 'elevated';
      const antiAir = data.antiAir;

      let target = null;
      let minDist = Infinity;

      enemyList.forEach(enemy => {
        if (!isElevated && enemy.isAerial) return; // ground units skip aerial
        const { col: ec, row: er } = pxToCell(enemy.x, enemy.y);
        const d = chebyshevDist(unit.col, unit.row, ec, er);
        if (d > unit.range) return;

        if (enemy.taunted && enemy.tauntTarget === unit.id) { target = enemy; minDist = -1; return; }
        // Anti-air units prioritise aerial
        if (antiAir && enemy.isAerial) { target = enemy; minDist = -2; return; }
        if (d < minDist && minDist > -1) { minDist = d; target = enemy; }
      });

      if (!target) {
        this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { attackTimer: attackInterval, skillCooldown: skillCd } } });
        return;
      }

      let damage = unit.dmg;
      if (unit.type === 'diamond' && state.activeBuffs?.guardDmg) damage += state.activeBuffs.guardDmg;
      let isCrit = false;
      let shotCount = (unit.shotCount || 0) + 1;

      // ── T3 Piercing Shot (Triangle / Sniper) ──
      if (unit.type === 'triangle' && unit.tier === 2 && unit.hasSkill) {
        const skill = data.skills.t3;
        const threshold = combo.critEvery || skill.triggerEvery; // combo reduces threshold
        if (shotCount >= threshold) {
          damage = Math.round(damage * skill.critMultiplier);
          isCrit = true;
          shotCount = 0;
          this._applySlowToEnemy(target, skill.slowPercent, skill.slowDuration);
          soundManager.playCritHit();
        }
      }

      // ── T3 Bladestorm (Diamond / Guard) ──
      if (unit.type === 'diamond' && unit.tier === 2 && unit.hasSkill) {
        const skill = data.skills.t3;
        if (shotCount >= skill.triggerEvery) {
          shotCount = 0;
          // Hit ALL currently-blocked enemies
          const blocked = enemyList.filter(e => e.blockedBy === unit.id);
          const extraTargets = blocked.filter(e => e.id !== target.id);
          isCrit = true;
          damage = Math.round(damage * skill.critMultiplier);
          // Deal to primary target
          this._dealDamage(target, damage, unit.type, true, unit, { isBladestorm: true });
          // Deal to all blocked enemies
          extraTargets.forEach(e => {
            this._dealDamage(e, damage, unit.type, true, unit, { isBladestorm: true });
          });
          soundManager.playUnitAttack('diamond');
          particles.emitAttack((unit.col+0.5)*CELL_SIZE, (unit.row+0.5)*CELL_SIZE, target.x, target.y, data.color, true);
          this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { attackTimer: attackInterval, shotCount, skillCooldown: skillCd } } });
          return;
        }
      }

      // ── T3 Shockwave (Pentagon / Caster) ──
      if (unit.type === 'pentagon' && unit.tier === 2 && unit.hasSkill && skillCd <= 0) {
        const skill = data.skills.t3;
        enemyList.forEach(e => {
          const { col: ec, row: er } = pxToCell(e.x, e.y);
          if (chebyshevDist(unit.col, unit.row, ec, er) <= unit.range) {
            this.dispatch({ type: 'UPDATE_ENEMY', payload: { id: e.id, updates: { stunRemaining: skill.stunDuration } } });
            this._applySlowToEnemy(e, skill.slowPercent, skill.slowDuration);
          }
        });
        this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { skillCooldown: skill.cooldown * (1 - (state.activeBuffs?.casterCd || 0)) } } });
      }

      // ── T3 Taunt (Square / Defender) ──
      if (unit.type === 'square' && unit.tier === 2 && unit.hasSkill && skillCd <= 0) {
        const skill = data.skills.t3;
        enemyList.filter(e => !e.isAerial).forEach(e => {
          const { col: ec, row: er } = pxToCell(e.x, e.y);
          if (chebyshevDist(unit.col, unit.row, ec, er) <= skill.aoeRange) {
            this.dispatch({ type: 'UPDATE_ENEMY', payload: { id: e.id, updates: { taunted: true, tauntTarget: unit.id } } });
            setTimeout(() => {
              this.dispatch({ type: 'UPDATE_ENEMY', payload: { id: e.id, updates: { taunted: false, tauntTarget: null } } });
            }, skill.duration * 1000);
          }
        });
        soundManager.playTauntActivated();
        this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { skillCooldown: skill.cooldown } } });
      }

      // ── T3 Viscous Trap (Hexagon / Supporter) ──
      if (unit.type === 'hexagon' && unit.tier === 2 && unit.hasSkill && skillCd <= 0) {
        const skill = data.skills.t3;
        const { x: px, y: py } = cellPx(unit.col, unit.row);
        particles.emitPuddle(px, py);
        soundManager.playViscousTrapPlaced();
        this.dispatch({ type: 'ADD_PUDDLE', payload: { x: px, y: py, armorDebuff: skill.armorDebuff, remaining: skill.puddleDuration, unitId: unit.id } });
        this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { skillCooldown: skill.cooldown } } });
      }

      // ── Hexagon slow application ──
      if (unit.type === 'hexagon') {
        let slowAmt = unit.slowPercent || 0.30;
        if (combo.slowBonus) slowAmt = Math.min(0.80, slowAmt + combo.slowBonus);
        if (state.activeBuffs?.supporterSlow) slowAmt += state.activeBuffs.supporterSlow;
        if (unit.isAoe) {
          enemyList.forEach(e => {
            const { col: ec, row: er } = pxToCell(e.x, e.y);
            if (chebyshevDist(unit.col, unit.row, ec, er) <= unit.range)
              this._applySlowToEnemy(e, slowAmt, 2.0);
          });
        } else {
          this._applySlowToEnemy(target, slowAmt, 2.0);
        }
        soundManager.playUnitAttack('hexagon');
      }

      // ── Pentagon AOE damage ──
      if (unit.type === 'pentagon') {
        const { col: tc, row: tr } = pxToCell(target.x, target.y);
        enemyList.forEach(e => {
          const { col: ec, row: er } = pxToCell(e.x, e.y);
          if (chebyshevDist(tc, tr, ec, er) <= (data.aoeRadius || 1) || e.id === target.id) {
            let dmg = damage;
            // Viscous Explosion combo: +30% damage to debuffed enemies
            if (combo.debuffDmgBonus && (e.slowEffects?.length > 0 || e.stunRemaining > 0 || e.armorDebuffRemaining > 0)) {
              dmg = Math.round(dmg * (1 + combo.debuffDmgBonus));
            }
            this._dealDamage(e, dmg, unit.type, isCrit, unit);
          }
        });
      } else if (unit.type !== 'hexagon') {
        this._dealDamage(target, damage, unit.type, isCrit, unit);
      }

      soundManager.playUnitAttack(unit.type);
      const { x: ux, y: uy } = cellPx(unit.col, unit.row);
      particles.emitAttack(ux, uy, target.x, target.y, data.color, isCrit);

      this.dispatch({ type: 'UPDATE_UNIT', payload: { id: unit.id, updates: { attackTimer: attackInterval, shotCount, skillCooldown: skillCd } } });
    });
  }

  _applySlowToEnemy(enemy, amount, duration) {
    const existing = [...(enemy.slowEffects || [])];
    existing.push({ amount, duration, remaining: duration });
    this.dispatch({ type: 'UPDATE_ENEMY', payload: { id: enemy.id, updates: { slowEffects: existing } } });
    soundManager.playEnemySlowed();
    particles.emitSlow(enemy.x, enemy.y);
  }

  _dealDamage(enemy, rawDmg, attackerType, isCrit, unit, opts = {}) {
    const state = this.stateRef.current;
    
    // Read base Defense and Magic Resistance
    let activeDef = (enemy.def || 0) + (state?.activeBuffs?.enemyDefIncrease || 0);
    let activeRes = (enemy.res || 0) + (state?.activeBuffs?.enemyResIncrease || 0);

    // Apply armor flat debuffs (e.g. card buff reduces armor, puddle reduces armor, skills reduce armor)
    let armorDebuffMult = 1.0;
    if (enemy.armorDebuffRemaining > 0 && enemy.armorDebuffAmount > 0) {
      armorDebuffMult *= (1 - enemy.armorDebuffAmount);
    }
    if (state) {
      state.puddles.forEach(puddle => {
        if (dist2d(enemy.x, enemy.y, puddle.x, puddle.y) < CELL_SIZE * 0.7) {
          armorDebuffMult *= (1 - puddle.armorDebuff);
        }
      });
      // Card Buff: reduces enemy armor
      if (state.activeBuffs?.enemyArmor) {
        armorDebuffMult *= (1 - state.activeBuffs.enemyArmor);
      }
    }
    activeDef = Math.max(0, Math.round(activeDef * armorDebuffMult));

    let finalDmg = 0;
    if (attackerType === 'pentagon') {
      // Magic/Arts damage ignores DEF, reduced by RES percentage
      finalDmg = Math.max(1, Math.round(rawDmg * (1 - activeRes)));
    } else {
      // Physical damage: ATK - DEF, min 5% scratch damage
      const minScratch = Math.max(1, Math.round(rawDmg * 0.05));
      finalDmg = Math.max(minScratch, rawDmg - activeDef);
    }

    const newHp = enemy.currentHp - finalDmg;

    particles.emitHit(enemy.x, enemy.y, finalDmg, UNIT_DATA[attackerType]?.color || '#fff', isCrit);
    soundManager.playEnemyHit();

    if (newHp <= 0) {
      particles.emitDeath(enemy.x, enemy.y, ENEMY_DATA[enemy.type]?.color || '#E74C3C', enemy.isBoss);
      soundManager.playEnemyDeath(enemy.isBoss);
      if (enemy.blockedBy && state?.units[enemy.blockedBy]) {
        const blocker = state.units[enemy.blockedBy];
        this.dispatch({ type: 'UPDATE_UNIT', payload: {
          id: blocker.id,
          updates: { currentBlocked: Math.max(0, (blocker.currentBlocked || 1) - 1) },
        }});
      }
      
      // Calculate energy reward including activeBuffs.energyReward
      const finalReward = enemy.reward + (state?.activeBuffs?.energyReward || 0);
      this.dispatch({ type: 'ENEMY_KILLED', payload: {
        id: enemy.id,
        reward: finalReward,
        isDrone: enemy.isAerial,
        isBladestorm: opts.isBladestorm || false,
      }});
    } else {
      this.dispatch({ type: 'UPDATE_ENEMY', payload: { id: enemy.id, updates: { currentHp: newHp } } });
    }
  }

  _tickPuddles(dt, state) {
    this.dispatch({ type: 'UPDATE_PUDDLES', dt });
  }

  // ─── Renderer ───────────────────────────────────────────────────────────────
  _render(state) {
    const canvas = this.canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._renderGrid(ctx, state);
    this._renderRangeHighlight(ctx, state);
    this._renderPuddles(ctx, state);
    this._renderPaths(ctx, state);
    this._renderSpawnPortals(ctx, state);
    this._renderObjectives(ctx, state);
    this._renderComboLinks(ctx, state);
    this._renderUnits(ctx, state);
    this._renderEnemies(ctx, state);
    particles.render(ctx);
  }

  _renderGrid(ctx, state) {
    const { units, mapId } = state;
    const pathSet = MAP_PATH_CELLS[mapId] || MAP_PATH_CELLS['tri-path'];

    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const x = col * CELL_SIZE, y = row * CELL_SIZE;
        const onPath = pathSet.has(`${col},${row}`);

        if (mapId === 'stage4') {
          if (onPath) {
            // Metallic/concrete grey pathway
            ctx.fillStyle = (col + row) % 2 === 0 ? '#3A3A3C' : '#2C2C2E';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            // Draw subtle crack lines
            ctx.strokeStyle = 'rgba(230,126,34,0.18)'; // faint glowing orange crack lines
            ctx.lineWidth = 1;
            ctx.beginPath();
            if ((col + row) % 3 === 0) {
              ctx.moveTo(x + 10, y + 10);
              ctx.lineTo(x + 30, y + 25);
              ctx.lineTo(x + 45, y + 60);
            } else if ((col + row) % 3 === 1) {
              ctx.moveTo(x + 60, y + 20);
              ctx.lineTo(x + 40, y + 50);
              ctx.lineTo(x + 10, y + 62);
            }
            ctx.stroke();

            // Safety grid line
            ctx.strokeStyle = 'rgba(255,255,255,0.02)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
          } else {
            // High-ground blocks: dark slate/steel blocks
            ctx.fillStyle = (col + row) % 2 === 0 ? '#202022' : '#1C1C1E';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            
            // Draw industrial borders
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1.5, y + 1.5, CELL_SIZE - 3, CELL_SIZE - 3);
            
            // Draw a subtle hazard accent (yellow/black stripe indicator) on some high ground tiles
            if ((col * row) % 7 === 1) {
              ctx.save();
              ctx.fillStyle = 'rgba(212,144,26,0.2)'; // semi-transparent yellow
              ctx.beginPath();
              ctx.moveTo(x + 4, y + 4);
              ctx.lineTo(x + 16, y + 4);
              ctx.lineTo(x + 4, y + 16);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
        } else {
          // Standard map styling
          if (onPath) {
            // Ground lane — darker stone texture
            ctx.fillStyle = (col + row) % 2 === 0 ? 'rgba(22,16,10,0.97)' : 'rgba(18,13,8,0.97)';
          } else {
            // Elevated platform — glassy teal-tinged surface
            ctx.fillStyle = (col + row) % 2 === 0 ? 'rgba(10,20,35,0.92)' : 'rgba(8,16,28,0.92)';
          }
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

          // Elevated platform subtle glow border
          if (!onPath) {
            ctx.strokeStyle = 'rgba(80,160,255,0.07)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }
    }
  }

  // Chebyshev grid range highlight — coloured squares instead of circle
  _renderRangeHighlight(ctx, state) {
    const { selectedUnitId, selectedUnitType, units } = state;
    let col, row, range, color, facing;

    if (selectedUnitId && units[selectedUnitId]) {
      const u = units[selectedUnitId];
      col = u.col; row = u.row; range = u.range;
      color = UNIT_DATA[u.type]?.color || '#fff';
      facing = u.facing;
    } else if (selectedUnitType && UNIT_DATA[selectedUnitType]) {
      return; // don't draw while placing (mouse hover is handled separately)
    } else return;

    ctx.save();
    for (let dc = -range; dc <= range; dc++) {
      for (let dr = -range; dr <= range; dr++) {
        if (dc === 0 && dr === 0) continue;
        const c = col + dc, r = row + dr;
        if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) continue;

        if (facing === 'up' && r > row) continue;
        if (facing === 'down' && r < row) continue;
        if (facing === 'left' && c > col) continue;
        if (facing === 'right' && c < col) continue;

        ctx.fillStyle = color + '22';
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = color + '55';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * CELL_SIZE + 0.5, r * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
    ctx.restore();
  }

  _renderPaths(ctx, state) {
    const { mapId, speed, betweenWaves } = state;
    const map = MAPS[mapId] || MAPS['tri-path'];

    // Ground lanes
    const gColors = ['rgba(255,140,60,0.10)', 'rgba(60,180,255,0.10)', 'rgba(60,255,160,0.10)'];
    map.groundLanes.forEach((lane, li) => {
      ctx.strokeStyle = gColors[li % gColors.length];
      ctx.lineWidth = CELL_SIZE * 0.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      lane.forEach((wp, i) => {
        const px = (wp.col + 0.5) * CELL_SIZE, py = (wp.row + 0.5) * CELL_SIZE;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    // Air lane — dashed cyan line
    ctx.strokeStyle = 'rgba(0,212,255,0.18)';
    ctx.lineWidth = CELL_SIZE * 0.25;
    ctx.setLineDash([CELL_SIZE * 0.3, CELL_SIZE * 0.2]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    map.airLane.forEach((wp, i) => {
      const px = (wp.col + 0.5) * CELL_SIZE, py = (wp.row + 0.5) * CELL_SIZE;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated path flow chevrons
    const renderFlowChevrons = (lane, baseColor, isAir = false) => {
      const t = performance.now() / 1000;
      const gameSpeed = speed || 1;
      const spacing = 48; // distance between chevrons
      const flowOffset = (t * 48 * gameSpeed) % spacing;

      ctx.save();
      
      // Make them much brighter and glowing when between waves to guide the user's eye!
      if (betweenWaves) {
        ctx.strokeStyle = baseColor;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 6;
      } else {
        // Softer color and no glow during active wave to reduce visual noise
        ctx.strokeStyle = baseColor.replace(/[\d\.]+\)$/, '0.35)');
        ctx.shadowBlur = 0;
      }
      
      ctx.lineWidth = isAir ? 1.5 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let s = 0; s < lane.length - 1; s++) {
        const wp1 = lane[s];
        const wp2 = lane[s + 1];

        const x1 = (wp1.col + 0.5) * CELL_SIZE;
        const y1 = (wp1.row + 0.5) * CELL_SIZE;
        const x2 = (wp2.col + 0.5) * CELL_SIZE;
        const y2 = (wp2.row + 0.5) * CELL_SIZE;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const L = Math.sqrt(dx * dx + dy * dy);

        const ux = dx / L;
        const uy = dy / L;
        const angle = Math.atan2(dy, dx);

        for (let d = flowOffset; d < L; d += spacing) {
          const cx = x1 + d * ux;
          const cy = y1 + d * uy;

          // Clip checking to only draw on-screen
          if (cx < 0 || cx > GRID_COLS * CELL_SIZE || cy < 0 || cy > GRID_ROWS * CELL_SIZE) continue;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          
          ctx.beginPath();
          ctx.moveTo(-5, -4);
          ctx.lineTo(0, 0);
          ctx.lineTo(-5, 4);
          ctx.stroke();
          
          ctx.restore();
        }
      }
      ctx.restore();
    };

    // Draw flow chevrons
    map.groundLanes.forEach((lane, li) => {
      // Ground paths flow orange/yellow
      renderFlowChevrons(lane, 'rgba(255, 140, 60, 0.85)');
    });
    if (map.airLane) {
      // Air paths flow bright cyan
      renderFlowChevrons(map.airLane, 'rgba(0, 212, 255, 0.9)', true);
    }
  }

  _renderSpawnPortals(ctx, state) {
    const { mapId } = state;
    const map = MAPS[mapId] || MAPS['tri-path'];
    const spawns = new Set();
    
    const collectSpawn = (lane) => {
      let sc;
      if (lane[0].col === -1) sc = { col: 0, row: lane[0].row };
      else sc = { col: Math.max(0, Math.min(GRID_COLS - 1, lane[0].col)), row: Math.max(0, Math.min(GRID_ROWS - 1, lane[0].row)) };
      spawns.add(`${sc.col},${sc.row}`);
    };
    
    map.groundLanes.forEach(collectSpawn);
    if (map.airLane) collectSpawn(map.airLane);

    ctx.save();
    spawns.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      const cx = (col + 0.5) * CELL_SIZE;
      const cy = (row + 0.5) * CELL_SIZE;
      
      const t = performance.now() / 1000;
      
      // Outer glow
      ctx.shadowColor = 'rgba(231,76,60,0.8)';
      ctx.shadowBlur = 12;
      
      // Concentric portals expanding outward
      for (let i = 0; i < 3; i++) {
        const radius = CELL_SIZE * 0.22 + ((t * 12 + i * 8) % 16);
        ctx.strokeStyle = `rgba(231,76,60,${Math.max(0, 1 - (radius - CELL_SIZE * 0.2) / 18)})`;
        ctx.lineWidth = 2 - i * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Red vortex center core
      const pulseSize = CELL_SIZE * 0.18 + Math.sin(t * 8) * 2.5;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pulseSize);
      grad.addColorStop(0, '#FFF');
      grad.addColorStop(0.35, '#E74C3C');
      grad.addColorStop(1, 'rgba(231,76,60,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Rotating geometric portal frame
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL_SIZE * 0.26, t, t + Math.PI * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, CELL_SIZE * 0.26, t + Math.PI, t + Math.PI * 1.4);
      ctx.stroke();
    });
    ctx.restore();
  }

  _renderObjectives(ctx, state) {
    const { mapId } = state;
    const map = MAPS[mapId] || MAPS['tri-path'];
    const objectives = new Set();

    const collectObjective = (lane) => {
      let oc;
      const last = lane[lane.length - 1];
      if (last.col === 10) oc = { col: 9, row: last.row };
      else oc = { col: Math.max(0, Math.min(GRID_COLS - 1, last.col)), row: Math.max(0, Math.min(GRID_ROWS - 1, last.row)) };
      objectives.add(`${oc.col},${oc.row}`);
    };

    map.groundLanes.forEach(collectObjective);
    if (map.airLane) collectObjective(map.airLane);

    ctx.save();
    objectives.forEach(key => {
      const [col, row] = key.split(',').map(Number);
      const cx = (col + 0.5) * CELL_SIZE;
      const cy = (row + 0.5) * CELL_SIZE;
      
      const t = performance.now() / 1000;
      
      // Shimmering cyan dome shield
      ctx.shadowColor = 'rgba(0,212,255,0.7)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(0,212,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL_SIZE * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      
      // Orbiting defense shield nodes
      const numNodes = 3;
      for (let i = 0; i < numNodes; i++) {
        const angle = t * 1.2 + (i * Math.PI * 2) / numNodes;
        const nx = cx + Math.cos(angle) * CELL_SIZE * 0.35;
        const ny = cy + Math.sin(angle) * CELL_SIZE * 0.35;
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulse crystalline energy octahedron core
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#4A90D9';
      const size = CELL_SIZE * 0.18 + Math.sin(t * 5) * 2;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size * 0.65, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size * 0.65, cy);
      ctx.closePath();
      ctx.fill();
      
      // Inner glowing core accents
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.65, cy);
      ctx.lineTo(cx + size * 0.65, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();
    });
    ctx.restore();
  }

  _renderComboLinks(ctx, state) {
    const units = Object.values(state.units);
    // Find active combo pairs
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i], b = units[j];
        if (chebyshevDist(a.col, a.row, b.col, b.row) !== 1) continue;
        const bonus = getAdjacencyBonus(a.type, b.type);
        if (!bonus) continue;
        // Draw glowing laser link
        const ax = (a.col + 0.5) * CELL_SIZE, ay = (a.row + 0.5) * CELL_SIZE;
        const bx = (b.col + 0.5) * CELL_SIZE, by = (b.row + 0.5) * CELL_SIZE;
        const t = (performance.now() / 600) % 1;
        const alpha = 0.4 + 0.3 * Math.sin(t * Math.PI * 2);
        ctx.save();
        ctx.strokeStyle = bonus.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        ctx.shadowColor = bonus.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _renderPuddles(ctx, state) {
    state.puddles?.forEach(puddle => {
      const alpha = Math.min(1, puddle.remaining / 4.0) * 0.6;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#D4901A';
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, CELL_SIZE * 0.55, CELL_SIZE * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = '#FFB347';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });
  }

  _renderUnits(ctx, state) {
    const { units, selectedUnitId } = state;
    Object.values(units).forEach(unit => {
      const data = UNIT_DATA[unit.type];
      const { x: px, y: py } = cellPx(unit.col, unit.row);
      const size = CELL_SIZE * 0.38;
      const isSelected = unit.id === selectedUnitId;
      const hasCombo = !!unit.comboBonus;

      ctx.save();
      ctx.shadowColor = isSelected ? data.color : data.glowColor;
      ctx.shadowBlur = isSelected ? 24 : (hasCombo ? 16 : 8);

      ctx.fillStyle = data.color;
      this._drawShape(ctx, data.shape, px, py, size, unit.tier);
      ctx.fill();

      // Facing Chevron
      if (unit.facing) {
        ctx.save();
        ctx.translate(px, py);
        if (unit.facing === 'up') ctx.rotate(-Math.PI/2);
        else if (unit.facing === 'down') ctx.rotate(Math.PI/2);
        else if (unit.facing === 'left') ctx.rotate(Math.PI);
        
        ctx.beginPath();
        const chSize = size * 0.4;
        ctx.moveTo(chSize * 0.5, 0);
        ctx.lineTo(-chSize * 0.5, -chSize * 0.5);
        ctx.lineTo(-chSize * 0.2, 0);
        ctx.lineTo(-chSize * 0.5, chSize * 0.5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        ctx.restore();
      }

      // Combo pulse ring
      if (hasCombo) {
        const t = (performance.now() / 800) % 1;
        const ringAlpha = 0.3 + 0.3 * Math.sin(t * Math.PI * 2);
        ctx.strokeStyle = data.color + Math.round(ringAlpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, size + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tier badge
      if (unit.tier > 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = unit.tier === 2 ? '#FFD700' : '#fff';
        ctx.font = `bold ${Math.round(CELL_SIZE * 0.18)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(['', 'II', 'III'][unit.tier], px, py + size + 10);
      }

      // HP bar
      const barW = CELL_SIZE * 0.75, barH = 4;
      const barX = px - barW / 2, barY = py + size + 14;
      const hpRatio = unit.currentHp / unit.maxHp;
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpRatio > 0.5 ? '#2ECC97' : hpRatio > 0.25 ? '#F39C12' : '#E74C3C';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      ctx.restore();
    });
  }

  _drawShape(ctx, shape, cx, cy, size, tier) {
    ctx.beginPath();
    switch (shape) {
      case 'triangle': {
        const h = size * 1.2;
        ctx.moveTo(cx, cy - h);
        ctx.lineTo(cx + h * 0.85, cy + h * 0.5);
        ctx.lineTo(cx - h * 0.85, cy + h * 0.5);
        ctx.closePath();
        break;
      }
      case 'square':
        ctx.rect(cx - size, cy - size, size * 2, size * 2);
        break;
      case 'circle':
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        break;
      case 'pentagon': {
        const s = size * 1.1;
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2 / 5) - Math.PI / 2;
          const x = cx + s * Math.cos(a), y = cy + s * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }
      case 'hexagon': {
        const s = size * 1.0;
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI / 3) - Math.PI / 6;
          const x = cx + s * Math.cos(a), y = cy + s * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }
      case 'diamond': {
        const s = size * 1.15;
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s * 0.7, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - s * 0.7, cy);
        ctx.closePath();
        break;
      }
      default:
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
    }
  }

  _renderEnemies(ctx, state) {
    Object.values(state.enemies).forEach(enemy => {
      const data = ENEMY_DATA[enemy.type];
      if (!data) return;
      const { x, y } = enemy;
      const size = data.size;
      const isSlowed = enemy.slowEffects?.some(s => s.remaining > 0);
      const isBoss = data.isBoss;
      const isAerial = data.isAerial;

      ctx.save();

      // Aerial enemies float higher with drop shadow
      let drawY = y;
      if (isAerial) {
        drawY = y - 10; // render 10px above the lane line
        // Drop shadow to show height
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 10;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(x, y + 4, size * 0.8, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowOffsetY = 0;
        // Cyan glow for drone
        ctx.shadowColor = data.glowColor;
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowColor = data.glowColor;
        ctx.shadowBlur = isBoss ? 20 : 10;
      }

      // Stun flash
      if (enemy.stunRemaining > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, drawY, size + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Enemy body
      ctx.fillStyle = isSlowed ? this._mixColor(data.color, '#87CEEB', 0.4) : data.color;
      ctx.beginPath();
      if (isAerial) {
        this._drawDroneShape(ctx, x, drawY, size);
      } else {
        this._drawShape(ctx, data.shape, x, drawY, size, 0);
      }
      ctx.fill();

      if (isBoss) {
        ctx.fillStyle = '#FFD700';
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👑', x, drawY - size - 2);
      }

      // HP bar
      const hpRatio = enemy.currentHp / enemy.maxHp;
      const barW = size * 2.5, barH = 3;
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x - barW / 2, drawY - size - 10, barW, barH);
      ctx.fillStyle = hpRatio > 0.5 ? '#2ECC97' : hpRatio > 0.25 ? '#F39C12' : '#E74C3C';
      ctx.fillRect(x - barW / 2, drawY - size - 10, barW * hpRatio, barH);

      ctx.restore();
    });
  }

  // Diamond / Rhombus shape for Drone enemy
  _drawDroneShape(ctx, cx, cy, size) {
    ctx.beginPath();
    // Body
    ctx.rect(cx - size * 0.4, cy - size * 0.3, size * 0.8, size * 0.6);
    ctx.fill();
    // Wings
    ctx.beginPath();
    ctx.rect(cx - size * 0.9, cy - size * 0.15, size * 0.5, size * 0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.rect(cx + size * 0.4, cy - size * 0.15, size * 0.5, size * 0.3);
    ctx.fill();
  }

  _mixColor(hex1, hex2, t) {
    const parse = h => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
    const a = parse(hex1 || '#ffffff');
    const b = parse(hex2 || '#87CEEB');
    return `rgb(${Math.round(a.r+(b.r-a.r)*t)},${Math.round(a.g+(b.g-a.g)*t)},${Math.round(a.b+(b.b-a.b)*t)})`;
  }
}

// ─── Inline generateWave import (avoids circular require) ──────────────────────
import { generateWave as _generateWave } from '../constants/waves';
