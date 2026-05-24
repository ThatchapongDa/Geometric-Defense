// src/constants/units.js
// All unit definitions with upgrade tiers, skills, placement types, and combo data

export const SAVE_VERSION = 2;

export const UPGRADE_MULTIPLIER = 1.4;   // +40% per tier
export const UPGRADE_RANGE_BONUS = 0;    // fixed ranges, do not expand range on tier upgrade
export const SLOW_FLOOR = 0.15;          // minimum speed ratio after all slows
export const GRID_COLS = 10;
export const GRID_ROWS = 8;
export const CELL_SIZE = 72;             // pixels per cell

// ─── Unit Data ─────────────────────────────────────────────────────────────────
// placementType: 'ground'   → วางได้เฉพาะบน Path Cells (เลนวิ่งศัตรูพื้นดิน)
// placementType: 'elevated' → วางได้เฉพาะบน Non-Path Cells (แท่นลอยสูง)
//
// range: Chebyshev distance in cells (1 = 3x3, 2 = 5x5, 3 = 7x7)

export const UNIT_DATA = {
  // ─── Triangle → Sniper (Elevated) ─────────────────────────────────────────
  triangle: {
    name: 'Triangle',
    arkClass: 'Sniper',
    role: 'dps',
    placementType: 'elevated',
    shape: 'triangle',
    color: '#E8643A',
    glowColor: 'rgba(232,100,58,0.4)',
    baseDmg: 55,
    baseHp: 150,
    baseRange: 3,              // Chebyshev cells
    baseCost: 50,
    attackInterval: 1.4,
    healInterval: null,
    healAmount: null,
    aoeRadius: 0,
    slowPercent: 0,
    slowByTier: [0, 0, 0],
    aoeByTier: [false, false, false],
    blockByTier: [0, 0, 0],   // elevated → never blocks
    antiAir: true,             // prioritises aerial enemies
    skills: {
      t3: {
        id: 'piercing_shot',
        label: 'Piercing Shot',
        description: 'ทุกนัดที่ 4 ยิงทะลวงเกราะ สร้าง Crit ×2 และสโลว์ 20% นาน 2 วินาที',
        triggerEvery: 4,
        slowPercent: 0.20,
        slowDuration: 2.0,
        critMultiplier: 2.0,
      },
    },
    combosWith: ['pentagon'],
  },

  // ─── Square → Defender (Ground) ───────────────────────────────────────────
  square: {
    name: 'Square',
    arkClass: 'Defender',
    role: 'tank',
    placementType: 'ground',
    shape: 'square',
    color: '#4A90D9',
    glowColor: 'rgba(74,144,217,0.4)',
    baseDmg: 15,
    baseHp: 500,
    baseRange: 1,
    baseCost: 75,
    attackInterval: 1.5,
    healInterval: null,
    healAmount: null,
    aoeRadius: 0,
    slowPercent: 0,
    slowByTier: [0, 0, 0],
    aoeByTier: [false, false, false],
    blockByTier: [2, 2, 3],
    antiAir: false,
    skills: {
      t3: {
        id: 'taunt',
        label: 'Taunt',
        description: 'บังคับศัตรูพื้นดินในระยะ 3 ช่องให้มาโจมตีตัวเองนาน 3 วินาที',
        aoeRange: 3,
        duration: 3.0,
        cooldown: 10.0,
      },
    },
    combosWith: ['circle'],
  },

  // ─── Circle → Medic (Elevated) ─────────────────────────────────────────────
  circle: {
    name: 'Circle',
    arkClass: 'Medic',
    role: 'healer',
    placementType: 'elevated',
    shape: 'circle',
    color: '#2ECC97',
    glowColor: 'rgba(46,204,151,0.4)',
    baseDmg: 0,
    baseHp: 200,
    baseRange: 3,
    baseCost: 60,
    attackInterval: null,
    healInterval: 1.6,
    healAmount: 15,
    aoeRadius: 0,
    slowPercent: 0,
    slowByTier: [0, 0, 0],
    aoeByTier: [true, true, true],
    blockByTier: [0, 0, 0],
    antiAir: false,
    skills: {
      t3: {
        id: 'frost_aura',
        label: 'Frost Aura',
        description: 'ออร่าน้ำแข็งสโลว์ศัตรูในระยะ 2 ช่องรอบตัว 15% ตลอดเวลา',
        slowPercent: 0.15,
        aoeRange: 2,
        passive: true,
      },
    },
    combosWith: ['square'],
  },

  // ─── Pentagon → Caster (Elevated) ──────────────────────────────────────────
  pentagon: {
    name: 'Pentagon',
    arkClass: 'Caster',
    role: 'aoe',
    placementType: 'elevated',
    shape: 'pentagon',
    color: '#9B7FDD',
    glowColor: 'rgba(155,127,221,0.4)',
    baseDmg: 25,
    baseHp: 250,
    baseRange: 2,
    baseCost: 100,
    attackInterval: 1.2,
    healInterval: null,
    healAmount: null,
    aoeRadius: 1,              // AOE splash 1 cell radius
    slowPercent: 0,
    slowByTier: [0, 0, 0],
    aoeByTier: [true, true, true],
    blockByTier: [0, 0, 0],
    antiAir: false,
    skills: {
      t3: {
        id: 'shockwave',
        label: 'Shockwave',
        description: 'ปล่อยคลื่นกระแทก AOE สตัน 1 วินาที + สโลว์ 50% นาน 1.5 วินาที (CD 8 วิ)',
        stunDuration: 1.0,
        slowPercent: 0.50,
        slowDuration: 1.5,
        cooldown: 8.0,
      },
    },
    combosWith: ['triangle', 'hexagon'],
  },

  // ─── Hexagon → Supporter (Ground) ──────────────────────────────────────────
  hexagon: {
    name: 'Hexagon',
    arkClass: 'Supporter',
    role: 'debuffer',
    placementType: 'ground',
    shape: 'hexagon',
    color: '#D4901A',
    glowColor: 'rgba(212,144,26,0.4)',
    baseDmg: 10,
    baseHp: 220,
    baseRange: 2,
    baseCost: 80,
    attackInterval: 1.0,
    healInterval: null,
    healAmount: null,
    aoeRadius: 0,
    slowPercent: 0.20,
    slowByTier: [0.20, 0.30, 0.30],
    aoeByTier: [false, true, true],
    blockByTier: [1, 1, 2],
    antiAir: false,
    skills: {
      t3: {
        id: 'viscous_trap',
        label: 'Viscous Trap',
        description: 'วางหนองน้ำบนพื้น — ศัตรูที่วิ่งผ่านสโลว์ + ลดเกราะ 25% นาน 4 วินาที (CD 12 วิ)',
        armorDebuff: 0.25,
        puddleDuration: 4.0,
        cooldown: 12.0,
      },
    },
    combosWith: ['pentagon', 'diamond'],
  },

  // ─── Diamond → Guard (Ground) ──────────────────────────────────────────────
  diamond: {
    name: 'Diamond',
    arkClass: 'Guard',
    role: 'melee',
    placementType: 'ground',
    shape: 'diamond',
    color: '#E74C3C',
    glowColor: 'rgba(231,76,60,0.4)',
    baseDmg: 60,
    baseHp: 300,
    baseRange: 1,
    baseCost: 90,
    attackInterval: 0.8,       // fast attacker
    healInterval: null,
    healAmount: null,
    aoeRadius: 0,
    slowPercent: 0,
    slowByTier: [0, 0, 0],
    aoeByTier: [false, false, false],
    blockByTier: [1, 2, 2],
    antiAir: false,
    skills: {
      t3: {
        id: 'bladestorm',
        label: 'Bladestorm',
        description: 'ทุกนัดที่ 4 หมุนตัวฟาดโจมตีศัตรูทุกตัวที่บล็อกอยู่พร้อมกัน สร้าง Crit ×2!',
        triggerEvery: 4,
        critMultiplier: 2.0,
        aoeBlocked: true,      // hits all currently-blocked enemies
      },
    },
    combosWith: ['hexagon'],
  },
};

// ─── Compute stats for a unit at a given tier (0=T1, 1=T2, 2=T3) ─────────────
export function getUnitStats(type, tier) {
  const base = UNIT_DATA[type];
  const mult = Math.pow(UPGRADE_MULTIPLIER, tier);
  const range = base.baseRange + UPGRADE_RANGE_BONUS * tier;
  const isElevated = base.placementType === 'elevated';
  return {
    dmg:          Math.round(base.baseDmg * mult),
    hp:           Math.round(base.baseHp * mult),
    maxHp:        Math.round(base.baseHp * mult),
    range,                                        // Chebyshev cells
    cost:         base.baseCost,
    upgradeCost:  tier < 2 ? base.baseCost * (tier === 0 ? 2 : 4) : null,
    blockCount:   isElevated ? 0 : base.blockByTier[tier],
    slowPercent:  base.slowByTier[tier],
    isAoe:        base.aoeByTier[tier],
    healAmount:   base.healAmount ? Math.round(base.healAmount * mult) : null,
    hasSkill:     tier === 2,
    skill:        tier === 2 ? base.skills?.t3 : null,
    placementType: base.placementType,
    antiAir:      base.antiAir,
  };
}

// ─── Chebyshev distance (grid-box range) ──────────────────────────────────────
// Returns max(|Δcol|, |Δrow|) — "Manhattan-box" / L-infinity norm
export function chebyshevDist(colA, rowA, colB, rowB) {
  return Math.max(Math.abs(colA - colB), Math.abs(rowA - rowB));
}

// ─── Check if an enemy pixel position is within a unit's Chebyshev range ──────
export function enemyInRange(enemyPxX, enemyPxY, unitCol, unitRow, rangeCells, facing) {
  const enemyCol = Math.floor(enemyPxX / CELL_SIZE);
  const enemyRow = Math.floor(enemyPxY / CELL_SIZE);
  
  if (chebyshevDist(unitCol, unitRow, enemyCol, enemyRow) > rangeCells) return false;
  
  if (!facing) return true;
  
  // Half-box restriction based on facing direction
  if (facing === 'up' && enemyRow > unitRow) return false;
  if (facing === 'down' && enemyRow < unitRow) return false;
  if (facing === 'left' && enemyCol > unitCol) return false;
  if (facing === 'right' && enemyCol < unitCol) return false;
  
  return true;
}

// ─── Adjacency Combo Bonuses ───────────────────────────────────────────────────
// Returns a bonus descriptor or null if no combo between typeA and typeB
export function getAdjacencyBonus(typeA, typeB) {
  const key = [typeA, typeB].sort().join('+');
  const COMBOS = {
    // Triangle (Sniper) + Pentagon (Caster) → Geometric Annihilation
    'pentagon+triangle': {
      id: 'geometric_annihilation',
      label: 'Geometric Annihilation',
      color: '#FF8C42',
      forUnit: {
        triangle: { critEvery: 3 },           // crit every 3rd shot instead of 4th
        pentagon: { attackSpeedBonus: 0.25 }, // 25% faster attack
      },
    },
    // Square (Defender) + Circle (Medic) → Bulwark Resonance
    'circle+square': {
      id: 'bulwark_resonance',
      label: 'Bulwark Resonance',
      color: '#3DFFE0',
      forUnit: {
        square: { regenPerSec: 8 },           // Square regens 8 HP/s
        circle: { healBonus: 0.40 },          // Circle heals 40% more
      },
    },
    // Hexagon (Supporter) + Pentagon (Caster) → Viscous Explosion
    'hexagon+pentagon': {
      id: 'viscous_explosion',
      label: 'Viscous Explosion',
      color: '#C77DFF',
      forUnit: {
        hexagon: { slowBonus: 0.15 },         // +15% slow
        pentagon: { debuffDmgBonus: 0.30 },   // +30% dmg vs debuffed enemies
      },
    },
    // Diamond (Guard) + Hexagon (Supporter) → Slowing Shredder
    'diamond+hexagon': {
      id: 'slowing_shredder',
      label: 'Slowing Shredder',
      color: '#FF4560',
      forUnit: {
        diamond: { attackSpeedBonus: 0.20, regenPerSec: 5 }, // faster + regen
        hexagon: { slowBonus: 0.10 },                         // extra slow
      },
    },
  };
  return COMBOS[key] || null;
}
