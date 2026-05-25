// src/constants/sprites.js
// Sprite asset path configuration for all units and enemies.
// When image files are placed in public/assets/, the game will automatically
// use them instead of drawing geometric shapes.

// ─── Unit Sprites ──────────────────────────────────────────────────────────────
// Each unit has: icon, portrait, chibi, facing sprites (right/left/front/back), skill_icon
// All paths are relative to the public/ folder.

export const UNIT_SPRITES = {
  triangle: {
    icon:        '/assets/units/triangle/icon.png',
    portrait:    '/assets/units/triangle/portrait.png',
    chibi:       '/assets/units/triangle/chibi.png',
    faceRight:   '/assets/units/triangle/face_right.png',
    faceLeft:    '/assets/units/triangle/face_left.png',
    faceFront:   '/assets/units/triangle/face_front.png',
    faceBack:    '/assets/units/triangle/face_back.png',
    skillIcon:   '/assets/units/triangle/skill_icon.png',
  },
  square: {
    icon:        '/assets/units/square/icon.png',
    portrait:    '/assets/units/square/portrait.png',
    chibi:       '/assets/units/square/chibi.png',
    faceRight:   '/assets/units/square/face_right.png',
    faceLeft:    '/assets/units/square/face_left.png',
    faceFront:   '/assets/units/square/face_front.png',
    faceBack:    '/assets/units/square/face_back.png',
    skillIcon:   '/assets/units/square/skill_icon.png',
  },
  pentagon: {
    icon:        '/assets/units/pentagon/icon.png',
    portrait:    '/assets/units/pentagon/portrait.png',
    chibi:       '/assets/units/pentagon/chibi.png',
    faceRight:   '/assets/units/pentagon/face_right.png',
    faceLeft:    '/assets/units/pentagon/face_left.png',
    faceFront:   '/assets/units/pentagon/face_front.png',
    faceBack:    '/assets/units/pentagon/face_back.png',
    skillIcon:   '/assets/units/pentagon/skill_icon.png',
  },
  hexagon: {
    icon:        '/assets/units/hexagon/icon.png',
    portrait:    '/assets/units/hexagon/portrait.png',
    chibi:       '/assets/units/hexagon/chibi.png',
    faceRight:   '/assets/units/hexagon/face_right.png',
    faceLeft:    '/assets/units/hexagon/face_left.png',
    faceFront:   '/assets/units/hexagon/face_front.png',
    faceBack:    '/assets/units/hexagon/face_back.png',
    skillIcon:   '/assets/units/hexagon/skill_icon.png',
  },
  circle: {
    icon:        '/assets/units/circle/icon.png',
    portrait:    '/assets/units/circle/portrait.png',
    chibi:       '/assets/units/circle/chibi.png',
    faceRight:   '/assets/units/circle/face_right.png',
    faceLeft:    '/assets/units/circle/face_left.png',
    faceFront:   '/assets/units/circle/face_front.png',
    faceBack:    '/assets/units/circle/face_back.png',
    skillIcon:   '/assets/units/circle/icon.png',
  },
  diamond: {
    icon:        '/assets/units/diamond/icon.png',
    portrait:    '/assets/units/diamond/portrait.png',
    chibi:       '/assets/units/diamond/chibi.png',
    faceRight:   '/assets/units/diamond/face_right.png',
    faceLeft:    '/assets/units/diamond/face_left.png',
    faceFront:   '/assets/units/diamond/face_front.png',
    faceBack:    '/assets/units/diamond/face_back.png',
    skillIcon:   '/assets/units/diamond/skill_icon.png',
  },
};

// Facing direction → sprite key mapping
export const FACING_SPRITE_KEY = {
  right: 'faceRight',
  left:  'faceLeft',
  up:    'faceBack',
  down:  'faceFront',
};

// ─── Enemy Sprites ─────────────────────────────────────────────────────────────
export const ENEMY_SPRITES = {
  basic:   { icon: '/assets/enemies/basic/icon.png',   sprite: '/assets/enemies/basic/sprite.png' },
  fast:    { icon: '/assets/enemies/fast/icon.png',     sprite: '/assets/enemies/fast/sprite.png' },
  armored: { icon: '/assets/enemies/armored/icon.png',  sprite: '/assets/enemies/armored/sprite.png' },
  boss:    { icon: '/assets/enemies/boss/icon.png',     sprite: '/assets/enemies/boss/sprite.png' },
  swarm:   { icon: '/assets/enemies/swarm/icon.png',    sprite: '/assets/enemies/swarm/sprite.png' },
  drone:   { icon: '/assets/enemies/drone/icon.png',    sprite: '/assets/enemies/drone/sprite.png' },
  ranged:  { icon: '/assets/enemies/ranged/icon.png',   sprite: '/assets/enemies/ranged/sprite.png' },
};

// ─── Sprite Loader (preloads images and caches them) ───────────────────────────
const imageCache = {};
const failedPaths = new Set();
const loadingPaths = new Set();

/**
 * Load an image and cache it. Returns the cached Image object or null if loading fails.
 * @param {string} path - Path to the image (relative to public/)
 * @returns {HTMLImageElement|null}
 */
export function getSpriteImage(path) {
  if (!path) return null;
  if (failedPaths.has(path)) return null;

  // Already loaded and ready
  if (imageCache[path]) return imageCache[path];

  // Already loading — don't create a new Image
  if (loadingPaths.has(path)) return null;

  // Start loading for the first time
  loadingPaths.add(path);
  const img = new Image();
  img.src = path;
  img.onload = () => {
    imageCache[path] = img;
    loadingPaths.delete(path);
  };
  img.onerror = () => {
    failedPaths.add(path);
    loadingPaths.delete(path);
  };

  // Not ready yet — return null so the fallback (geometric shape) is drawn
  return null;
}

/**
 * Get the sprite for a unit based on its type and facing direction.
 * Returns the loaded Image or null (fallback to shape drawing).
 * @param {string} unitType - 'triangle', 'square', etc.
 * @param {string} facing - 'right', 'left', 'up', 'down'
 * @returns {HTMLImageElement|null}
 */
export function getUnitSprite(unitType, facing = 'right') {
  const sprites = UNIT_SPRITES[unitType];
  if (!sprites) return null;

  const key = FACING_SPRITE_KEY[facing] || 'faceRight';
  return getSpriteImage(sprites[key]);
}

/**
 * Get the icon image for a unit type.
 * @param {string} unitType
 * @returns {HTMLImageElement|null}
 */
export function getUnitIcon(unitType) {
  const sprites = UNIT_SPRITES[unitType];
  if (!sprites) return null;
  return getSpriteImage(sprites.icon);
}

/**
 * Get the portrait image for a unit type.
 * @param {string} unitType
 * @returns {HTMLImageElement|null}
 */
export function getUnitPortrait(unitType) {
  const sprites = UNIT_SPRITES[unitType];
  if (!sprites) return null;
  return getSpriteImage(sprites.portrait);
}

/**
 * Get the enemy sprite.
 * @param {string} enemyType
 * @returns {HTMLImageElement|null}
 */
export function getEnemySprite(enemyType) {
  const sprites = ENEMY_SPRITES[enemyType];
  if (!sprites) return null;
  return getSpriteImage(sprites.sprite);
}

/**
 * Preload all sprites so they're ready when needed.
 * Call this once at game start.
 */
export function preloadAllSprites() {
  // Preload unit sprites
  Object.values(UNIT_SPRITES).forEach(sprites => {
    Object.values(sprites).forEach(path => getSpriteImage(path));
  });
  // Preload enemy sprites
  Object.values(ENEMY_SPRITES).forEach(sprites => {
    Object.values(sprites).forEach(path => getSpriteImage(path));
  });
}
