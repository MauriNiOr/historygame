// ============================================================
// NINJA ESCAPE ARENA - Escape Room + Combate (Top-down style)
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ----- DOM elements -----
const menuScreen = document.getElementById('menu-screen');
const levelSelect = document.getElementById('level-select');
const hud = document.getElementById('hud');
const endScreen = document.getElementById('end-screen');
const healthFill = document.getElementById('health-fill');
const currentLevelSpan = document.getElementById('current-level');
const keysCountSpan = document.getElementById('keys-count');
const enemiesCountSpan = document.getElementById('enemies-count');

// ----- Sprite sheet -----
const spriteSheet = new Image();
spriteSheet.src = 'player_sprites.jpg';

// Approximate frame data (based on 1024x559 sheet)
const SPRITE = {
  frameW: 110,
  frameH: 120,
  run: { y: 5, frames: 8, startX: 10 },
  jump: { y: 140, frames: 6, startX: 150 },
  swing: { y: 275, frames: 6, startX: 5 },
  thrust: { y: 415, frames: 4, startX: 5 }
};

// ----- Game state -----
let gameState = 'menu'; // menu | playing | paused | victory | defeat
let currentLevel = 1;
let keys = {};
let lastTime = 0;

// Player
const player = {
  x: 100,
  y: 300,
  w: 48,
  h: 56,
  speed: 2.8,
  hp: 100,
  maxHp: 100,
  facing: 1, // 1 right, -1 left
  anim: 'idle',
  frame: 0,
  frameTimer: 0,
  attacking: false,
  attackTimer: 0,
  invincible: 0,
  keysCollected: 0
};

// Level data
const levels = {
  1: {
    name: "Entrada del Templo",
    walls: [
      {x:0,y:0,w:800,h:40}, {x:0,y:560,w:800,h:40},
      {x:0,y:0,w:40,h:600}, {x:760,y:0,w:40,h:600},
      {x:200,y:150,w:120,h:30}, {x:450,y:350,w:150,h:30}
    ],
    enemies: [
      {x:500, y:200, type: 'slime'},
      {x:600, y:400, type: 'slime'}
    ],
    keys: [{x:300, y:100}],
    door: {x:700, y:280, w:40, h:80, locked: true},
    spawn: {x:80, y:300}
  },
  2: {
    name: "Pasillo de las Sombras",
    walls: [
      {x:0,y:0,w:800,h:40}, {x:0,y:560,w:800,h:40},
      {x:0,y:0,w:40,h:600}, {x:760,y:0,w:40,h:600},
      {x:150,y:100,w:30,h:200}, {x:150,y:350,w:30,h:180},
      {x:400,y:80,w:30,h:180}, {x:400,y:320,w:30,h:200},
      {x:600,y:150,w:30,h:300}
    ],
    enemies: [
      {x:250, y:200, type: 'slime'},
      {x:500, y:250, type: 'warrior'},
      {x:680, y:450, type: 'slime'}
    ],
    keys: [{x:100, y:450}, {x:550, y:100}],
    door: {x:700, y:250, w:40, h:100, locked: true},
    spawn: {x:70, y:280}
  },
  3: {
    name: "Sala de Entrenamiento",
    walls: [
      {x:0,y:0,w:800,h:40}, {x:0,y:560,w:800,h:40},
      {x:0,y:0,w:40,h:600}, {x:760,y:0,w:40,h:600},
      {x:300,y:200,w:200,h:30}, {x:300,y:370,w:200,h:30},
      {x:200,y:200,w:30,h:200}, {x:570,y:200,w:30,h:200}
    ],
    enemies: [
      {x:150, y:150, type: 'warrior'},
      {x:650, y:150, type: 'warrior'},
      {x:400, y:450, type: 'slime'},
      {x:400, y:100, type: 'slime'}
    ],
    keys: [{x:400, y:280}],
    door: {x:700, y:260, w:40, h:80, locked: true},
    spawn: {x:80, y:300}
  },
  4: {
    name: "Cripta del Guardián",
    walls: [
      {x:0,y:0,w:800,h:40}, {x:0,y:560,w:800,h:40},
      {x:0,y:0,w:40,h:600}, {x:760,y:0,w:40,h:600},
      {x:100,y:120,w:250,h:25}, {x:450,y:120,w:250,h:25},
      {x:100,y:450,w:250,h:25}, {x:450,y:450,w:250,h:25},
      {x:380,y:200,w:40,h:200}
    ],
    enemies: [
      {x:200, y:250, type: 'warrior'},
      {x:600, y:250, type: 'warrior'},
      {x:200, y:400, type: 'slime'},
      {x:600, y:400, type: 'slime'},
      {x:400, y:100, type: 'warrior'}
    ],
    keys: [{x:150, y:200}, {x:650, y:200}, {x:400, y:500}],
    door: {x:700, y:270, w:40, h:80, locked: true},
    spawn: {x:80, y:300}
  },
  5: {
    name: "Trono del Señor Oscuro",
    walls: [
      {x:0,y:0,w:800,h:40}, {x:0,y:560,w:800,h:40},
      {x:0,y:0,w:40,h:600}, {x:760,y:0,w:40,h:600},
      {x:150,y:100,w:500,h:25}, {x:150,y:470,w:500,h:25},
      {x:150,y:100,w:25,h:150}, {x:150,y:350,w:25,h:145},
      {x:625,y:100,w:25,h:150}, {x:625,y:350,w:25,h:145}
    ],
    enemies: [
      {x:400, y:280, type: 'boss'},
      {x:250, y:200, type: 'warrior'},
      {x:550, y:200, type: 'warrior'},
      {x:250, y:400, type: 'slime'},
      {x:550, y:400, type: 'slime'}
    ],
    keys: [{x:200, y:150}, {x:600, y:150}, {x:200, y:420}, {x:600, y:420}],
    door: {x:700, y:260, w:40, h:90, locked: true},
    spawn: {x:80, y:300}
  }
};

let currentWalls = [];
let currentEnemies = [];
let currentKeys = [];
let currentDoor = null;
let particles = [];

// ----- Input -----
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// ----- Buttons -----
document.getElementById('btn-start').onclick = () => startLevel(1);
document.getElementById('btn-levels').onclick = () => {
  levelSelect.classList.remove('hidden');
};
document.getElementById('btn-back').onclick = () => {
  levelSelect.classList.add('hidden');
};
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.onclick = () => startLevel(parseInt(btn.dataset.level));
});
document.getElementById('btn-next').onclick = () => {
  if (currentLevel < 5) startLevel(currentLevel + 1);
  else showMenu();
};
document.getElementById('btn-menu').onclick = showMenu;

// ----- Functions -----
function showMenu() {
  gameState = 'menu';
  menuScreen.classList.remove('hidden');
  levelSelect.classList.add('hidden');
  hud.classList.add('hidden');
  endScreen.classList.add('hidden');
}

function startLevel(level) {
  currentLevel = level;
  const data = levels[level];
  
  // Reset player
  player.x = data.spawn.x;
  player.y = data.spawn.y;
  player.hp = player.maxHp;
  player.keysCollected = 0;
  player.attacking = false;
  player.invincible = 0;
  player.anim = 'idle';
  player.frame = 0;
  player.facing = 1;

  // Load level objects
  currentWalls = data.walls.map(w => ({...w}));
  currentEnemies = data.enemies.map(e => createEnemy(e.x, e.y, e.type));
  currentKeys = data.keys.map(k => ({x: k.x, y: k.y, collected: false, size: 16}));
  currentDoor = {...data.door, open: false};
  particles = [];

  // UI
  menuScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  currentLevelSpan.textContent = level;
  updateHUD();

  gameState = 'playing';
}

function createEnemy(x, y, type) {
  const base = {
    x, y, w: 40, h: 40,
    hp: 30, maxHp: 30,
    speed: 1.2,
    type,
    frame: 0,
    timer: 0,
    attackCooldown: 0,
    alive: true,
    color: '#44ff88'
  };
  if (type === 'warrior') {
    base.hp = base.maxHp = 60;
    base.speed = 1.6;
    base.w = 44; base.h = 48;
    base.color = '#ff6644';
  }
  if (type === 'boss') {
    base.hp = base.maxHp = 200;
    base.speed = 1.0;
    base.w = 70; base.h = 70;
    base.color = '#aa22ff';
  }
  return base;
}

function updateHUD() {
  healthFill.style.width = (player.hp / player.maxHp * 100) + '%';
  keysCountSpan.textContent = player.keysCollected;
  enemiesCountSpan.textContent = currentEnemies.filter(e => e.alive).length;
}

function rectCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function moveWithCollision(obj, dx, dy) {
  // X
  obj.x += dx;
  for (const wall of currentWalls) {
    if (rectCollide(obj, wall)) {
      if (dx > 0) obj.x = wall.x - obj.w;
      else if (dx < 0) obj.x = wall.x + wall.w;
    }
  }
  // Y
  obj.y += dy;
  for (const wall of currentWalls) {
    if (rectCollide(obj, wall)) {
      if (dy > 0) obj.y = wall.y - obj.h;
      else if (dy < 0) obj.y = wall.y + wall.h;
    }
  }
  // Bounds
  obj.x = Math.max(40, Math.min(canvas.width - 40 - obj.w, obj.x));
  obj.y = Math.max(40, Math.min(canvas.height - 40 - obj.h, obj.y));
}

function updatePlayer(dt) {
  if (player.invincible > 0) player.invincible -= dt;

  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy = -player.speed;
  if (keys['s'] || keys['arrowdown']) dy = player.speed;
  if (keys['a'] || keys['arrowleft']) { dx = -player.speed; player.facing = -1; }
  if (keys['d'] || keys['arrowright']) { dx = player.speed; player.facing = 1; }

  // Normalize diagonal
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  if (!player.attacking) {
    moveWithCollision(player, dx, dy);
    if (dx !== 0 || dy !== 0) {
      player.anim = 'run';
    } else {
      player.anim = 'idle';
    }
  }

  // Attack
  if ((keys[' '] || keys['space']) && !player.attacking) {
    player.attacking = true;
    player.attackTimer = 0.35;
    player.anim = Math.random() > 0.5 ? 'swing' : 'thrust';
    player.frame = 0;
  }

  if (player.attacking) {
    player.attackTimer -= dt;
    if (player.attackTimer <= 0) {
      player.attacking = false;
      player.anim = 'idle';
    } else {
      // Hit detection
      const atkBox = {
        x: player.facing === 1 ? player.x + player.w - 10 : player.x - 40,
        y: player.y + 10,
        w: 50,
        h: 40
      };
      currentEnemies.forEach(e => {
        if (e.alive && rectCollide(atkBox, e)) {
          e.hp -= 18;
          spawnParticles(e.x + e.w/2, e.y + e.h/2, e.color);
          if (e.hp <= 0) {
            e.alive = false;
            spawnParticles(e.x + e.w/2, e.y + e.h/2, '#fff', 12);
          }
        }
      });
    }
  }

  // Collect keys
  currentKeys.forEach(k => {
    if (!k.collected && rectCollide(player, {x:k.x, y:k.y, w:k.size, h:k.size})) {
      k.collected = true;
      player.keysCollected++;
      spawnParticles(k.x, k.y, '#ffdd00', 8);
    }
  });

  // Door interaction
  if (keys['e'] && currentDoor && !currentDoor.open) {
    const doorDist = Math.hypot(
      player.x + player.w/2 - (currentDoor.x + currentDoor.w/2),
      player.y + player.h/2 - (currentDoor.y + currentDoor.h/2)
    );
    if (doorDist < 80) {
      const needed = levels[currentLevel].keys.length;
      if (player.keysCollected >= needed) {
        currentDoor.open = true;
        currentDoor.locked = false;
        spawnParticles(currentDoor.x + 20, currentDoor.y + 40, '#00ffaa', 15);
      }
    }
  }

  // Win condition
  if (currentDoor && currentDoor.open && rectCollide(player, currentDoor)) {
    winLevel();
  }

  // Animation
  player.frameTimer += dt;
  if (player.frameTimer > 0.1) {
    player.frameTimer = 0;
    player.frame++;
  }
}

function updateEnemies(dt) {
  currentEnemies.forEach(e => {
    if (!e.alive) return;

    e.timer += dt;
    e.attackCooldown = Math.max(0, e.attackCooldown - dt);

    // Simple AI: chase player
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 20 && dist < 350) {
      const spd = e.speed;
      const mx = (dx / dist) * spd;
      const my = (dy / dist) * spd;
      moveWithCollision(e, mx, my);
    }

    // Attack player
    if (dist < 55 && e.attackCooldown <= 0 && player.invincible <= 0) {
      player.hp -= (e.type === 'boss' ? 15 : e.type === 'warrior' ? 10 : 6);
      player.invincible = 0.8;
      e.attackCooldown = 1.2;
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff2244', 6);
      if (player.hp <= 0) {
        player.hp = 0;
        loseLevel();
      }
    }
  });
  updateHUD();
}

function spawnParticles(x, y, color, count = 6) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 0.4 + Math.random() * 0.3,
      color,
      size: 3 + Math.random() * 4
    });
  }
}

function updateParticles(dt) {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    return p.life > 0;
  });
}

function winLevel() {
  gameState = 'victory';
  endScreen.classList.remove('hidden');
  endScreen.classList.add('victory');
  endScreen.classList.remove('defeat');
  document.getElementById('end-title').textContent = '¡Nivel Completado!';
  document.getElementById('end-message').textContent = 
    currentLevel < 5 
      ? `Has escapado del nivel ${currentLevel}. ¡Sigue adelante!` 
      : '¡Has derrotado al Señor Oscuro y escapado del templo! ¡Victoria final!';
  document.getElementById('btn-next').style.display = currentLevel < 5 ? 'inline-block' : 'none';
}

function loseLevel() {
  gameState = 'defeat';
  endScreen.classList.remove('hidden');
  endScreen.classList.add('defeat');
  endScreen.classList.remove('victory');
  document.getElementById('end-title').textContent = 'Derrota...';
  document.getElementById('end-message').textContent = 'Has caído en combate. ¡Inténtalo de nuevo!';
  document.getElementById('btn-next').style.display = 'none';
}

// ----- Drawing -----
function draw() {
  // Background
  ctx.fillStyle = '#12122a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Floor pattern
  ctx.strokeStyle = 'rgba(40,40,80,0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
  }
  for (let y = 0; y < 600; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
  }

  if (gameState !== 'playing' && gameState !== 'victory' && gameState !== 'defeat') return;

  // Walls
  ctx.fillStyle = '#2a2a4a';
  currentWalls.forEach(w => {
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#4a4a7a';
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  });

  // Door
  if (currentDoor) {
    if (currentDoor.open) {
      ctx.fillStyle = 'rgba(0,255,150,0.25)';
      ctx.fillRect(currentDoor.x, currentDoor.y, currentDoor.w, currentDoor.h);
      ctx.strokeStyle = '#00ff99';
      ctx.lineWidth = 3;
      ctx.strokeRect(currentDoor.x, currentDoor.y, currentDoor.w, currentDoor.h);
      ctx.fillStyle = '#00ff99';
      ctx.font = '12px sans-serif';
      ctx.fillText('SALIDA', currentDoor.x - 5, currentDoor.y - 8);
    } else {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(currentDoor.x, currentDoor.y, currentDoor.w, currentDoor.h);
      ctx.strokeStyle = '#aa7744';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentDoor.x, currentDoor.y, currentDoor.w, currentDoor.h);
      // Lock icon
      ctx.fillStyle = '#ffcc00';
      ctx.font = '20px sans-serif';
      ctx.fillText('🔒', currentDoor.x + 8, currentDoor.y + 50);
    }
  }

  // Keys
  currentKeys.forEach(k => {
    if (!k.collected) {
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(k.x + 8, k.y + 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aa8800';
      ctx.fillRect(k.x + 6, k.y + 14, 4, 10);
      // Glow
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });

  // Enemies
  currentEnemies.forEach(e => {
    if (!e.alive) return;
    ctx.fillStyle = e.color;
    if (e.type === 'boss') {
      // Boss shape
      ctx.beginPath();
      ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#220044';
      ctx.beginPath();
      ctx.arc(e.x + e.w/2 - 12, e.y + e.h/2 - 8, 8, 0, Math.PI*2);
      ctx.arc(e.x + e.w/2 + 12, e.y + e.h/2 - 8, 8, 0, Math.PI*2);
      ctx.fill();
    } else if (e.type === 'warrior') {
      ctx.fillRect(e.x, e.y, e.w, e.h);
      // Sword
      ctx.fillStyle = '#ccc';
      ctx.fillRect(e.x + e.w - 5, e.y + 10, 8, 30);
    } else {
      // Slima
      ctx.beginPath();
      ctx.ellipse(e.x + e.w/2, e.y + e.h/2 + 5, e.w/2, e.h/2 - 5, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#003322';
      ctx.beginPath();
      ctx.arc(e.x + 12, e.y + 15, 5, 0, Math.PI*2);
      ctx.arc(e.x + 28, e.y + 15, 5, 0, Math.PI*2);
      ctx.fill();
    }
    // HP bar
    const hpPct = e.hp / e.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(e.x, e.y - 10, e.w, 5);
    ctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff2244';
    ctx.fillRect(e.x, e.y - 10, e.w * hpPct, 5);
  });

  // Player (sprite or fallback)
  drawPlayer();

  // Attack effect
  if (player.attacking) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#00e5ff';
    const ax = player.facing === 1 ? player.x + player.w - 5 : player.x - 45;
    ctx.beginPath();
    ctx.ellipse(ax + 25, player.y + 30, 30, 20, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // Particles
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Level name
  ctx.fillStyle = 'rgba(200,200,255,0.5)';
  ctx.font = '14px sans-serif';
  ctx.fillText(levels[currentLevel].name, 20, 580);
}

function drawPlayer() {
  const px = player.x;
  const py = player.y;

  if (spriteSheet.complete && spriteSheet.naturalWidth > 0) {
    // Try to draw from sprite sheet
    let row = SPRITE.run;
    let frame = player.frame % row.frames;

    if (player.anim === 'swing') {
      row = SPRITE.swing;
      frame = Math.min(player.frame, row.frames - 1);
    } else if (player.anim === 'thrust') {
      row = SPRITE.thrust;
      frame = Math.min(player.frame, row.frames - 1);
    } else if (player.anim === 'idle') {
      frame = 0;
    }

    const sx = row.startX + frame * SPRITE.frameW;
    const sy = row.y;

    ctx.save();
    if (player.facing === -1) {
      ctx.translate(px + player.w, py);
      ctx.scale(-1, 1);
      ctx.drawImage(spriteSheet, sx, sy, SPRITE.frameW, SPRITE.frameH, 0, 0, player.w, player.h);
    } else {
      ctx.drawImage(spriteSheet, sx, sy, SPRITE.frameW, SPRITE.frameH, px, py, player.w, player.h);
    }
    ctx.restore();

    // Invincible flash
    if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#fff';
      ctx.fillRect(px, py, player.w, player.h);
      ctx.globalAlpha = 1;
    }
  } else {
    // Fallback rectangle
    ctx.fillStyle = player.invincible > 0 ? '#88aaff' : '#3366ff';
    ctx.fillRect(px, py, player.w, player.h);
    // Head
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(px + player.w/2, py + 12, 10, 0, Math.PI*2);
    ctx.fill();
    // Sword
    ctx.fillStyle = '#00e5ff';
    const sx = player.facing === 1 ? px + player.w : px - 20;
    ctx.fillRect(sx, py + 20, 22, 6);
  }
}

// ----- Main loop -----
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (gameState === 'playing') {
    updatePlayer(dt);
    updateEnemies(dt);
    updateParticles(dt);
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Start
spriteSheet.onload = () => console.log('Sprites cargados');
showMenu();
requestAnimationFrame(gameLoop);
