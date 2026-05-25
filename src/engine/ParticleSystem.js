// src/engine/ParticleSystem.js
// Object-pooled particle system for attacks, deaths, healing, slow effects

const POOL_SIZE = 300;

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.active = false;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.life = 0; this.maxLife = 1;
    this.size = 4;
    this.color = '#fff';
    this.alpha = 1;
    this.type = 'default'; // 'spark', 'death', 'heal', 'slow', 'damage', 'crit', 'puddle'
    this.text = '';        // for floating damage numbers
    this.scale = 1;
    this.rotation = 0;
    this.rotSpeed = 0;
    this.gravity = 0;
  }
}

class ParticleSystem {
  constructor() {
    this.pool = Array.from({ length: POOL_SIZE }, () => new Particle());
    this.active = [];
  }

  _get() {
    for (const p of this.pool) {
      if (!p.active) return p;
    }
    // If pool exhausted, reuse oldest active
    return this.active[0] || this.pool[0];
  }

  _spawn(cfg) {
    const p = this._get();
    p.reset();
    Object.assign(p, cfg);
    p.active = true;
    p.maxLife = p.life;
    if (!this.active.includes(p)) this.active.push(p);
    return p;
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      if (!p.active) { this.active.splice(i, 1); continue; }
      p.life -= dt;
      if (p.life <= 0) { p.active = false; this.active.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += (p.vy + p.gravity) * dt;
      p.vy += p.gravity * dt;
      p.alpha = p.life / p.maxLife;
      p.rotation += p.rotSpeed * dt;
    }
  }

  render(ctx) {
    for (const p of this.active) {
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'damage' || p.type === 'crit' || p.type === 'heal_num') {
        // Floating text
        const prog = 1 - p.life / p.maxLife;
        const scale = p.type === 'crit' ? 1.4 : 1.0;
        ctx.font = `bold ${Math.round(p.size * scale)}px Inter, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, 0, -prog * 30);
      } else if (p.type === 'heal_ring') {
        // Expanding heal ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha *= p.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (1 + (1 - p.life / p.maxLife) * 2), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'slow') {
        // Blue-ish slow swirl dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'puddle') {
        // Puddle particle (stays at position)
        ctx.fillStyle = p.color;
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Default spark
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ─── Emitters ─────────────────────────────────────────────────────────────

  emitAttack(x, y, targetX, targetY, color, isCrit = false) {
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 340; // Slightly faster projectile motion
    // Projectile trail - expanded count from 3 to 8 for a thicker, richer line trail
    for (let i = 0; i < 8; i++) {
      this._spawn({
        x, y,
        vx: (dx / dist) * speed + (Math.random() - 0.5) * 60,
        vy: (dy / dist) * speed + (Math.random() - 0.5) * 60,
        life: 0.18 + Math.random() * 0.12,
        size: isCrit ? 8 : 5, // Expanded sizes
        color: isCrit ? '#FFD700' : color,
        type: 'spark',
        gravity: 0,
      });
    }
  }

  emitHit(x, y, damage, color, isCrit = false) {
    // Damage number
    this._spawn({
      x, y: y - 10,
      vx: (Math.random() - 0.5) * 20,
      vy: -25,
      life: isCrit ? 1.3 : 1.0,
      size: isCrit ? 20 : 15,
      color: isCrit ? '#FFD700' : color,
      type: isCrit ? 'crit' : 'damage',
      text: isCrit ? `💥${damage}` : `${damage}`,
      gravity: 0,
    });
    // Impact sparks - expanded counts from 8/4 to 16/8 for highly satisfying explosion weight
    const sparkCount = isCrit ? 16 : 8;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120; // Increased explosion speed
      this._spawn({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.25,
        size: 3 + Math.random() * 4, // Larger sparks
        color: isCrit ? '#FFD700' : color,
        type: 'spark',
        gravity: 250, // Higher gravity for quick dispersion
      });
    }
  }

  emitDeath(x, y, color, isBoss = false) {
    const count = isBoss ? 20 : 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = (isBoss ? 120 : 80) + Math.random() * 60;
      this._spawn({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        size: isBoss ? 7 : 4,
        color,
        type: 'spark',
        gravity: 150,
        rotSpeed: (Math.random() - 0.5) * 5,
      });
    }
    // Flash
    this._spawn({
      x, y,
      vx: 0, vy: 0,
      life: 0.3,
      size: isBoss ? 30 : 15,
      color: '#fff',
      type: 'heal_ring',
      gravity: 0,
    });
  }

  emitHeal(x, y, amount) {
    // Green ring
    this._spawn({
      x, y,
      vx: 0, vy: 0,
      life: 0.5,
      size: 20,
      color: '#2ECC97',
      type: 'heal_ring',
      gravity: 0,
    });
    // Heal number
    this._spawn({
      x, y: y - 5,
      vx: 0, vy: -15,
      life: 0.8,
      size: 13,
      color: '#2ECC97',
      type: 'heal_num',
      text: `+${amount}`,
      gravity: 0,
    });
  }

  emitSlow(x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      this._spawn({
        x: x + Math.cos(angle) * 10,
        y: y + Math.sin(angle) * 10,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        life: 0.4,
        size: 3,
        color: '#87CEEB',
        type: 'slow',
        gravity: 0,
      });
    }
  }

  emitPuddle(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      this._spawn({
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 10,
        vx: 0, vy: 0,
        life: 4.0,
        size: 14 + Math.random() * 10,
        color: '#D4901A',
        type: 'puddle',
        gravity: 0,
      });
    }
  }

  emitWaveStart(canvasW, canvasH) {
    for (let i = 0; i < 30; i++) {
      this._spawn({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 100,
        vy: -80 - Math.random() * 100,
        life: 0.8 + Math.random() * 0.4,
        size: 3 + Math.random() * 4,
        color: `hsl(${Math.random() * 360}, 80%, 65%)`,
        type: 'spark',
        gravity: 80,
      });
    }
  }

  clear() {
    this.active.forEach(p => { p.active = false; });
    this.active = [];
  }
}

export default new ParticleSystem();
