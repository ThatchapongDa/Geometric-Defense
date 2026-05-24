// src/constants/waves.js
// Map definitions, lanes, path cell builders, wave tables, and Stage 4 spec

import { GRID_COLS, GRID_ROWS } from './units';

// ─── Map Registry ──────────────────────────────────────────────────────────────
// Each map has:
//   groundLanes    : waypoints for ground enemies (can be blocked)
//   airLane        : waypoints for aerial Drones (bypasses ground units)
//   maxUnits       : maximum number of active deployed units (Deployment Unit Limit)
//   name / desc    : UI labels
//
// Coordinate system: col 0..9, row 0..7
// col -1 = spawn off-screen left (or right for stage 4); col 10 = exit off-screen

export const MAPS = {
  // ── 1. Tri-Path (Balanced) ──────────────────────────────────────────────────
  'tri-path': {
    name: 'Tri-Path',
    icon: '⚖️',
    desc: 'สมดุล — 2 เลนพื้นดิน + 1 เลนอากาศ วางยูนิตได้สูงสุด 8 ตัว',
    maxUnits: 8,
    groundLanes: [
      // Ground Lane 1 (Top)
      [
        { col: -1, row: 2 },
        { col: 3,  row: 2 },
        { col: 3,  row: 5 },
        { col: 7,  row: 5 },
        { col: 7,  row: 2 },
        { col: 10, row: 2 },
      ],
      // Ground Lane 2 (Bottom)
      [
        { col: -1, row: 6 },
        { col: 4,  row: 6 },
        { col: 4,  row: 4 },
        { col: 6,  row: 4 },
        { col: 6,  row: 6 },
        { col: 10, row: 6 },
      ],
    ],
    airLane: [
      { col: -1, row: 0 },
      { col: 10, row: 0 },
    ],
  },

  // ── 2. Chokepoint (Convergence) ─────────────────────────────────────────────
  'chokepoint': {
    name: 'Chokepoint',
    icon: '🌀',
    desc: 'คอคอด — 2 เลนบรรจบตรงกลาง บีบศัตรูเข้าหากัน วางยูนิตได้สูงสุด 8 ตัว',
    maxUnits: 8,
    groundLanes: [
      // Ground Lane 1
      [
        { col: -1, row: 1 },
        { col: 2,  row: 1 },
        { col: 2,  row: 4 },
        { col: 5,  row: 4 },
        { col: 8,  row: 4 },
        { col: 10, row: 4 },
      ],
      // Ground Lane 2
      [
        { col: -1, row: 6 },
        { col: 2,  row: 6 },
        { col: 2,  row: 4 },
        { col: 5,  row: 4 },
        { col: 8,  row: 4 },
        { col: 10, row: 4 },
      ],
    ],
    airLane: [
      { col: -1, row: 0 },
      { col: 5,  row: 0 },
      { col: 5,  row: 7 },
      { col: 10, row: 7 },
    ],
  },

  // ── 3. Snake Run (Tactical) ──────────────────────────────────────────────────
  'snake': {
    name: 'Snake Run',
    icon: '🐍',
    desc: 'งูเลื้อย — เส้นทางเดียวยาวคดเคี้ยวสไตล์งูเลื้อย วางยูนิตได้สูงสุด 8 ตัว',
    maxUnits: 8,
    groundLanes: [
      [
        { col: -1, row: 1 },
        { col: 2,  row: 1 },
        { col: 2,  row: 3 },
        { col: 5,  row: 3 },
        { col: 5,  row: 1 },
        { col: 7,  row: 1 },
        { col: 7,  row: 5 },
        { col: 4,  row: 5 },
        { col: 4,  row: 7 },
        { col: 10, row: 7 },
      ],
    ],
    airLane: [
      { col: -1, row: 0 },
      { col: 10, row: 0 },
    ],
  },

  // ── 4. Stage 4: Deserted Sector (Arknights Inspired Right-to-Left) ─────────
  'stage4': {
    name: 'Stage 4: Deserted Sector',
    icon: '🚨',
    desc: 'เขตพิเศษเสื่อมโทรม — ศัตรูบุกจากขวาไปซ้าย มี 4 คลื่นบุก เคลียร์เพื่อ Hello World! วางได้สูงสุด 8 ตัว',
    maxUnits: 8,
    groundLanes: [
      // Top Right Lane
      [
        { col: 10, row: 1 },
        { col: 7,  row: 1 },
        { col: 7,  row: 3 },
        { col: -1, row: 3 },
      ],
      // Middle Right Lane
      [
        { col: 10, row: 4 },
        { col: -1, row: 4 },
      ],
      // Bottom Right Lane
      [
        { col: 10, row: 6 },
        { col: 6,  row: 6 },
        { col: 6,  row: 4 },
        { col: -1, row: 4 },
      ],
    ],
    airLane: [
      { col: 10, row: 2 },
      { col: -1, row: 2 },
    ],
  },
};

// ─── PATH_CELLS per map ──────────────────────────────────────────────────────
function buildPathSet(lanes) {
  const set = new Set();
  lanes.forEach(lane => {
    for (let i = 0; i < lane.length - 1; i++) {
      const a = lane[i];
      const b = lane[i + 1];
      const cA = Math.max(0, Math.min(GRID_COLS - 1, a.col));
      const cB = Math.max(0, Math.min(GRID_COLS - 1, b.col));
      const rA = Math.max(0, Math.min(GRID_ROWS - 1, a.row));
      const rB = Math.max(0, Math.min(GRID_ROWS - 1, b.row));
      if (a.col === b.col) {
        const mn = Math.min(rA, rB), mx = Math.max(rA, rB);
        for (let r = mn; r <= mx; r++) set.add(`${cA},${r}`);
      } else {
        const mn = Math.min(cA, cB), mx = Math.max(cA, cB);
        for (let c = mn; c <= mx; c++) set.add(`${c},${rA}`);
      }
    }
  });
  return set;
}

export const MAP_PATH_CELLS = {};
for (const [id, map] of Object.entries(MAPS)) {
  MAP_PATH_CELLS[id] = buildPathSet(map.groundLanes);
}

// Backward-compat defaults
export const PATH_CELLS = MAP_PATH_CELLS['tri-path'];
export const LANES = MAPS['tri-path'].groundLanes;

export function isCellOnPath(col, row, mapId = 'tri-path') {
  const set = MAP_PATH_CELLS[mapId] || PATH_CELLS;
  return set.has(`${col},${row}`);
}

// ─── Lane assignment helpers ──────────────────────────────────────────────────
export function getLaneForEnemy(type, occupancyMap, mapId = 'tri-path') {
  const map = MAPS[mapId];
  if (type === 'drone') return -1; // air lane
  const gLanes = map.groundLanes;
  if (type === 'armored') return Math.floor(gLanes.length / 2); // prefer middle
  if (type === 'fast') {
    let minOcc = Infinity, best = 0;
    for (let i = 0; i < gLanes.length; i++) {
      const occ = occupancyMap?.[i] ?? 0;
      if (occ < minOcc) { minOcc = occ; best = i; }
    }
    return best;
  }
  return Math.floor(Math.random() * gLanes.length);
}

// ─── Main Wave table (Infinite Maps) ──────────────────────────────────────────
export const WAVE_TABLE = [
  // Wave 1
  [{ type: 'basic', count: 5, interval: 1.5, lane: null }],
  // Wave 2
  [{ type: 'basic', count: 6, interval: 1.2, lane: null },
   { type: 'fast',  count: 2, interval: 2.0, lane: null, delay: 4 }],
  // Wave 3 — first drone
  [{ type: 'basic', count: 4, interval: 1.0, lane: null },
   { type: 'drone', count: 2, interval: 2.0, lane: -1, delay: 3 }],
  // Wave 4
  [{ type: 'fast',    count: 5, interval: 0.8, lane: null },
   { type: 'armored', count: 2, interval: 3.0, lane: null }],
  // Wave 5 — swarm + drones
  [{ type: 'swarm', count: 12, interval: 0.5, lane: null },
   { type: 'drone', count: 3,  interval: 1.5, lane: -1, delay: 5 }],
  // Wave 6
  [{ type: 'basic',   count: 8, interval: 0.8, lane: null },
   { type: 'fast',    count: 4, interval: 1.0, lane: null },
   { type: 'drone',   count: 2, interval: 2.0, lane: -1, delay: 6 }],
  // Wave 7
  [{ type: 'armored', count: 5, interval: 2.5, lane: null },
   { type: 'swarm',   count: 12, interval: 0.4, lane: null, delay: 8 },
   { type: 'drone',   count: 3,  interval: 1.5, lane: -1, delay: 4 }],
  // Wave 8
  [{ type: 'fast',    count: 8, interval: 0.6, lane: null },
   { type: 'armored', count: 3, interval: 2.0, lane: null },
   { type: 'drone',   count: 4, interval: 1.2, lane: -1 }],
  // Wave 9
  [{ type: 'basic',   count: 10, interval: 0.7, lane: null },
   { type: 'armored', count: 4,  interval: 2.0, lane: null },
   { type: 'drone',   count: 4,  interval: 1.0, lane: -1, delay: 5 }],
  // Wave 10 — BOSS
  [{ type: 'basic', count: 8, interval: 0.8, lane: null },
   { type: 'drone', count: 4, interval: 1.0, lane: -1, delay: 3 },
   { type: 'boss',  count: 1, interval: 0,   lane: null, delay: 12 }],
  // Wave 11
  [{ type: 'fast',    count: 10, interval: 0.5, lane: null },
   { type: 'armored', count: 5,  interval: 2.0, lane: null },
   { type: 'drone',   count: 5,  interval: 1.0, lane: -1 }],
  // Wave 12
  [{ type: 'swarm',   count: 24, interval: 0.3, lane: null },
   { type: 'armored', count: 4,  interval: 1.5, lane: null, delay: 8 },
   { type: 'drone',   count: 6,  interval: 0.8, lane: -1, delay: 5 }],
  // Wave 13
  [{ type: 'basic',   count: 12, interval: 0.6, lane: null },
   { type: 'fast',    count: 8,  interval: 0.5, lane: null },
   { type: 'drone',   count: 6,  interval: 0.8, lane: -1 },
   { type: 'armored', count: 4,  interval: 2.0, lane: null, delay: 6 }],
  // Wave 14
  [{ type: 'swarm',   count: 18, interval: 0.3, lane: null },
   { type: 'drone',   count: 6,  interval: 0.8, lane: -1 },
   { type: 'boss',    count: 1,  interval: 0,   lane: null, delay: 15 },
   { type: 'fast',    count: 6,  interval: 0.7, lane: null, delay: 8 }],
  // Wave 15 — mega boss
  [{ type: 'boss',    count: 2,  interval: 15,  lane: null },
   { type: 'drone',   count: 8,  interval: 0.6, lane: -1, delay: 3 },
   { type: 'armored', count: 6,  interval: 2.0, lane: null, delay: 5 },
   { type: 'swarm',   count: 18, interval: 0.3, lane: null, delay: 10 }],
];

// Generate wave based on index and mapId
export function generateWave(waveIndex, mapId = 'tri-path') {
  if (mapId === 'stage4') {
    const STAGE4_WAVE_TABLE = [
      // Wave 1
      [{ type: 'basic', count: 6, interval: 1.5, lane: null },
       { type: 'ranged', count: 2, interval: 2.5, lane: null, delay: 5 }],
      // Wave 2
      [{ type: 'basic', count: 8, interval: 1.2, lane: null },
       { type: 'fast',  count: 4, interval: 1.0, lane: null, delay: 3 },
       { type: 'ranged', count: 3, interval: 2.0, lane: null, delay: 6 }],
      // Wave 3
      [{ type: 'basic',   count: 10, interval: 1.0, lane: null },
       { type: 'drone',   count: 4,  interval: 1.5, lane: -1, delay: 4 },
       { type: 'armored', count: 3,  interval: 2.5, lane: null, delay: 6 },
       { type: 'ranged',  count: 4,  interval: 2.0, lane: null, delay: 8 }],
      // Wave 4 — Handcrafted Intense Boss Wave!
      [{ type: 'basic',   count: 8,  interval: 0.8, lane: null },
       { type: 'fast',    count: 6,  interval: 0.6, lane: null },
       { type: 'armored', count: 4,  interval: 2.0, lane: null },
       { type: 'drone',   count: 6,  interval: 1.0, lane: -1, delay: 3 },
       { type: 'ranged',  count: 5,  interval: 1.5, lane: null, delay: 5 },
       { type: 'boss',    count: 1,  interval: 0,   lane: null, delay: 15 }]
    ];
    if (waveIndex < STAGE4_WAVE_TABLE.length) return STAGE4_WAVE_TABLE[waveIndex];
    return STAGE4_WAVE_TABLE[3]; // fallback/infinite loop Stage 4 Wave 4
  }

  if (waveIndex < WAVE_TABLE.length) return WAVE_TABLE[waveIndex];
  
  // Infinite scaling waves for regular maps
  const w = waveIndex + 1;
  const groups = [];
  groups.push({ type: 'basic', count: 6 + w, interval: Math.max(0.3, 1.0 - w * 0.03), lane: null });
  if (w % 3 === 0) groups.push({ type: 'armored', count: Math.floor(w / 2), interval: 2.0, lane: null, delay: 6 });
  if (w % 5 === 0) groups.push({ type: 'boss', count: 1, interval: 0, lane: null, delay: 18 });
  if (w % 4 === 0) groups.push({ type: 'swarm', count: 12 + w, interval: 0.3, lane: null, delay: 4 });
  if (w % 2 === 0) groups.push({ type: 'fast', count: 4 + Math.floor(w / 2), interval: 0.5, lane: null, delay: 3 });
  if (w >= 3) groups.push({ type: 'drone', count: 2 + Math.floor(w / 3), interval: 1.0, lane: -1, delay: 2 });
  if (w >= 4) groups.push({ type: 'ranged', count: 1 + Math.floor(w / 4), interval: 1.5, lane: null, delay: 5 });
  
  return groups;
}

export function isBossWave(waveIndex, mapId = 'tri-path') {
  return generateWave(waveIndex, mapId).some(g => g.type === 'boss');
}
