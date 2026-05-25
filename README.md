# Geometric Defense (Shape Defense)

เกม Tower Defense เชิงกลยุทธ์ที่ใช้กราฟิกแบบเรขาคณิต (Geometric) สไตล์ไซไฟ-แก้วใส (Glassmorph)

---

## 🎮 ภาพรวม

เป็นการนำแนวเกมที่ชอบมาบวกกับเกมโปรดอย่าง Arknights มาลองสร้างเกมใหม่ โดยใช้เรขาคณิตอย่างสำคัญในเกม

---

## 📸 ภาพในเกม (Screenshots)

### 🎯 หน้าเลือกด่าน (Mission Select)
![Mission Select - Dark Theme](https://raw.githubusercontent.com/ThatchapongDa/Geometric-Defense/main/screenshots/01-mission-select-dark.png)
*เลือกด่านต่างๆ พร้อมข้อมูลศัตรูและรางวัล*

### 🎯 หน้าเลือกด่าน (Light Theme)
![Mission Select - Light Theme](https://raw.githubusercontent.com/ThatchapongDa/Geometric-Defense/main/screenshots/04-mission-select-light.png)
*ธีมสว่างพร้อมตัวเลือก Dark/Light/B&W*

### ⚔️ ระหว่างเล่นเกม - Wave 1
![Gameplay Wave 1](https://raw.githubusercontent.com/ThatchapongDa/Geometric-Defense/main/screenshots/02-gameplay-wave1.png)
*วาง Unit ต่างๆ ป้องกันศัตรู - 6 ประเภท Unit (Triangle, Square, Circle, Pentagon, Hexagon, Diamond)*

### ⚔️ ระหว่างเล่นเกม - Wave 2
![Gameplay Wave 2](https://raw.githubusercontent.com/ThatchapongDa/Geometric-Defense/main/screenshots/03-gameplay-wave2.png)
*ศัตรูหลากหลายชนิดพร้อมสถิติ HP และ Damage*

---

## 🤖 Prompts (คำสั่งที่ใช้สร้างเกมนี้)

You are an expert game developer using the Anthropic API to create an advanced Tower Defense game called "Geometric Defense". This is a React-based game where geometric shapes defend against enemy attacks.

### CORE GAME MECHANICS:

1. **Grid-based placement system** (10x8 grid)
2. **4 unit types with unique roles:**
   - 🔺 **Triangle**: High damage attacker (DPS)
   - ⬜ **Square**: Tank with high HP
   - 🔵 **Circle**: Area healer/support
   - 🔷 **Pentagon**: Special AOE damage dealer
3. **Wave-based progression** with increasing difficulty
4. **Energy economy system** (earn energy by defeating enemies)
5. **Upgrade system** for existing units

---

## 📋 REQUIRED FEATURES TO IMPLEMENT

### Phase 1: Core Gameplay Enhancement
- [ ] Implement unit upgrade system (click unit to upgrade: +damage, +range, +HP)
- [ ] Add enemy variety (fast, armored, boss types)
- [ ] Implement proper pathfinding for enemies (curves, multiple lanes)
- [ ] Add particle effects for attacks and deaths
- [ ] Sound effects integration (attack, hit, death, wave clear)

### Phase 2: AI-Powered Features (USE ANTHROPIC API)
- [ ] Strategy advisor: Analyze current board state and suggest optimal unit placements
- [ ] Dynamic difficulty balancing: AI adjusts enemy stats based on player performance
- [ ] Adaptive enemy AI: Enemies learn player patterns and adapt routes
- [ ] Auto-battle mode: AI plays the game to demonstrate strategies

### Phase 3: Advanced Systems
- [ ] Skill system: Each unit type gets 2-3 active/passive skills
- [ ] Combo system: Bonuses for strategic unit combinations
- [ ] Achievement system
- [ ] Daily challenges with procedurally generated maps
- [ ] Leaderboard with score submission

### Phase 4: Polish & UX
- [ ] Smooth animations using CSS transforms and Canvas API
- [ ] Tutorial system with interactive step-by-step guidance
- [ ] Visual feedback (damage numbers, critical hits, status effects)
- [ ] Game speed controls (1x, 1.5x, 2x)
- [ ] Save/load game state to localStorage

---

## 🛠️ TECHNICAL REQUIREMENTS

- **React** with hooks for state management
- **Canvas API** for game rendering (60 FPS target)
- **Anthropic API** integration for AI features:
  - Model: `claude-sonnet-4-20250514`
  - Use streaming for real-time strategy suggestions
  - Implement conversation history for context-aware AI advisor
- **Responsive design** (mobile-friendly touch controls)
- **Performance optimization** (object pooling, requestAnimationFrame)

---

## 💡 AI ADVISOR IMPLEMENTATION EXAMPLE

```javascript
async function getStrategyAdvice(gameState) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analyze this tower defense game state and suggest optimal unit placements:
        
Current state:
- Wave: ${gameState.wave}
- Energy: ${gameState.energy}
- HP: ${gameState.hp}
- Placed units: ${JSON.stringify(gameState.units)}
- Enemy types incoming: ${JSON.stringify(gameState.nextWaveEnemies)}

Suggest 2-3 strategic moves with reasoning.`
      }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

---

## 📝 YOUR TASK

Implement Phase 1 and Phase 2 features. Focus on:
1. Polishing core gameplay mechanics
2. Adding the AI Strategy Advisor using Anthropic API
3. Creating 3 additional enemy types with distinct behaviors
4. Implementing the unit upgrade system

Provide complete, production-ready code with comments explaining AI integration points.

---

## 📦 CURRENT CODE BASE

[Attach the HTML/JS code from the prototype above]

---

## 🎯 ไอเดีย

เริ่มพัฒนาจากการนำแนวเกมที่ชอบมาบวกกับเกมโปรดอย่าง Arknights มาลองสร้างเกมใหม่ โดยใช้เรขาคณิตอย่างสำคัญในเกม
