<template>
  <div id="game-container" ref="container">
    <canvas ref="gameCanvas" id="gameCanvas"></canvas>

    <div id="ui-layer" ref="uiLayer">
      <div style="flex: 1;"></div>
      <div id="score-board">
        SCORE <span id="score-val">{{ Math.floor(score) }}</span>
        <div style="font-size: 14px; color: #f0f; margin-top: 5px;">
          NEXT WAVE: {{ waveTimer.toFixed(1) }}s
        </div>
      </div>
    </div>

    <div id="start-screen" :class="{ hidden: gameState !== 'MENU' && gameState !== 'GAMEOVER' }">
      <h1>Flux Evasion</h1>
      <p>
        拖动鼠标/手指 或 使用方向键控制<br />
        躲避流光粒子 | 每10秒触发全屏清屏<br />
        坚持越久，分数越高
      </p>
      <button id="start-btn" @click="startGame">开始潜入</button>
      <p
          id="final-score"
          :class="{ hidden: gameState !== 'GAMEOVER' }"
          style="margin-top: 20px; font-size: 20px; color: #fff;"
      >
        最终得分: {{ Math.floor(score) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "FluxEvasionGame",
  data() {
    return {
      gameState: "MENU", // MENU, PLAYING, GAMEOVER
      score: 0,
      waveTimer: 10,
      animationId: null,
      lastTime: 0,
      gameTime: 0,

      // Game entities
      enemies: [],
      particles: [],
      shockwaves: [],
      flashIntensity: 0,
      bgHue: 0,

      // Input state
      mouse: { x: 0, y: 0 },
      keys: {
        w: false, a: false, s: false, d: false,
        ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
      },

      // Player
      player: {
        x: 0,
        y: 0,
        radius: 12,
        hp: 100,
        maxHp: 100,
        speed: 5,
        trail: [],
        color: "#fff",
        hitTimer: 0
      },

      // Audio system
      audioCtx: null,
      bgmOsc: null
    };
  },
  mounted() {
    this.initCanvas();
    this.bindEvents();
    window.addEventListener("resize", this.resize);
    this.resize();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
    this.cleanupAudio();
    if (this.animationId) cancelAnimationFrame(this.animationId);
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.gameCanvas;
      this.ctx = canvas.getContext("2d");
    },
    resize() {
      const canvas = this.$refs.gameCanvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.width = canvas.width;
      this.height = canvas.height;

      if (this.gameState === "MENU") {
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
      }
    },
    bindEvents() {
      const container = this.$refs.container;

      // Mouse & Touch
      container.addEventListener("mousemove", this.handleMouseMove);
      container.addEventListener("touchmove", this.handleTouchMove, { passive: false });
      container.addEventListener("touchstart", this.handleTouchStart, { passive: false });

      // Keyboard
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
    },
    handleMouseMove(e) {
      if (this.gameState !== "PLAYING") return;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    },
    handleTouchMove(e) {
      e.preventDefault();
      if (this.gameState !== "PLAYING") return;
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    },
    handleTouchStart(e) {
      if (this.gameState !== "PLAYING") return;
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    },
    handleKeyDown(e) {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
    },
    handleKeyUp(e) {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
    },

    // ======================
    // AUDIO SYSTEM
    // ======================
    initAudio() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    },
    playTone(freq, type, duration, vol = 0.1) {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    },
    playHit() {
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(t + 0.3);
    },
    playClear() {
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(800, t + 1.5);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(t + 1.5);
    },
    playBGM() {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 55;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      this.bgmOsc = osc;
    },
    cleanupAudio() {
      if (this.bgmOsc) {
        this.bgmOsc.stop();
        this.bgmOsc = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    },

    // ======================
    // CLASSES (as plain JS objects)
    // ======================
    createParticle(x, y, color, speed, size, life, isDust = false) {
      const angle = Math.random() * Math.PI * 2;
      return {
        x, y, color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        maxLife: life,
        isDust,
        decay: Math.random() * 0.06 + 0.92
      };
    },
    createEnemy() {
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      if (edge === 0) { x = Math.random() * this.width; y = -20; }
      else if (edge === 1) { x = this.width + 20; y = Math.random() * this.height; }
      else if (edge === 2) { x = Math.random() * this.width; y = this.height + 20; }
      else { x = -20; y = Math.random() * this.height; }

      const radius = Math.random() > 0.7 ? Math.random() * 4 + 4 : Math.random() * 10 + 5;
      const speed = Math.random() > 0.7 ? Math.random() * 100 + 150 : Math.random() * 70 + 50;
      const hue = Math.random() > 0.7 ? Math.random() * 30 + 30 : Math.random() * 100 + 180;
      const color = `hsl(${hue}, 100%, 60%)`;

      return { x, y, radius, speed, color, dead: false };
    },
    createShockwave(x, y) {
      return {
        x, y,
        radius: 1,
        maxRadius: Math.max(this.width, this.height) * 1.2,
        speed: 800,
        active: true
      };
    },

    // ======================
    // GAME LOGIC
    // ======================
    spawnExplosion(x, y, color, count = 15) {
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(
            x, y, color,
            Math.random() * 6 + 2,
            Math.random() * 3 + 1,
            Math.random() * 1 + 0.5
        ));
      }
    },
    spawnDust(x, y, color) {
      for (let i = 0; i < 8; i++) {
        this.particles.push(this.createParticle(
            x, y, color,
            Math.random() * 1.5 + 0.5,
            Math.random() * 1 + 0.5,
            Math.random() * 1 + 1,
            true
        ));
      }
    },
    updatePlayer(dt) {
      let dx = 0, dy = 0;
      if (this.keys.w || this.keys.ArrowUp) dy = -1;
      if (this.keys.s || this.keys.ArrowDown) dy = 1;
      if (this.keys.a || this.keys.ArrowLeft) dx = -1;
      if (this.keys.d || this.keys.ArrowRight) dx = 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len; dy /= len;
        this.player.x += dx * this.player.speed * 60 * dt;
        this.player.y += dy * this.player.speed * 60 * dt;
      } else {
        const dist = Math.hypot(this.player.x - this.mouse.x, this.player.y - this.mouse.y);
        if (dist > 5) {
          this.player.x += (this.mouse.x - this.player.x) * 0.1;
          this.player.y += (this.mouse.y - this.player.y) * 0.1;
        }
      }

      this.player.x = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.y));

      const hue = (this.gameTime * 200) % 360;
      this.player.trail.push({
        x: this.player.x,
        y: this.player.y,
        life: 3.0,
        maxLife: 3.0,
        color: `hsl(${hue}, 100%, 70%)`,
        size: this.player.radius * 0.8
      });

      if (this.player.hitTimer > 0) this.player.hitTimer -= dt;
    },
    updateGame(dt) {
      this.gameTime += dt;
      this.bgHue = 270 + Math.sin(this.gameTime * 0.5) * 90;

      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveTimer = 10;
        this.shockwaves.push(this.createShockwave(this.width / 2, this.height / 2));
        this.playClear();
        this.flashIntensity = 0.5;
      }

      this.score += dt * 10;

      this.updatePlayer(dt);

      // Spawn enemies
      if (Math.random() < 0.05 + this.score / 5000) {
        this.enemies.push(this.createEnemy());
      }

      // Update shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed * dt;
        if (sw.radius > sw.maxRadius) {
          this.shockwaves.splice(i, 1);
          continue;
        }

        // Kill enemies in ring
        this.enemies.forEach(e => {
          const dist = Math.hypot(sw.x - e.x, sw.y - e.y);
          if (Math.abs(dist - sw.radius) < 20) e.dead = true;
        });
      }

      // Update enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const angle = Math.atan2(dy, dx);
        e.x += Math.cos(angle) * e.speed * dt;
        e.y += Math.sin(angle) * e.speed * dt;

        const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
        if (dist < this.player.radius + e.radius) {
          e.dead = true;
          this.player.hp -= 20;
          this.player.hitTimer = 0.2;
          this.flashIntensity = 1.0;
          this.playHit();
          this.spawnExplosion(e.x, e.y, e.color, 30);

          if (this.player.hp <= 0) {
            this.gameOver();
            return;
          }
        }
      }
      this.enemies = this.enemies.filter(e => !e.dead);

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.decay;
        p.vy *= p.decay;
        p.life -= dt;
        if (p.isDust) {
          p.x += Math.sin(this.gameTime * 2 + p.y * 0.1) * 0.5;
        }
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Flash fade
      if (this.flashIntensity > 0) this.flashIntensity -= dt * 3;
    },
    drawGame() {
      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;

      // Background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const c1 = `hsl(${this.bgHue}, 60%, 10%)`;
      const c2 = `hsl(${(this.bgHue + 60) % 360}, 60%, 5%)`;
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Trail
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = this.player.trail.length - 1; i >= 0; i--) {
        const p = this.player.trail[i];
        p.life -= 0.016;
        if (p.life <= 0) {
          this.player.trail.splice(i, 1);
          continue;
        }
        const alpha = p.life / p.maxLife;
        const size = p.size * alpha;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Shockwaves
      this.shockwaves.forEach(sw => {
        if (!sw.active) return;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 20;
        ctx.strokeStyle = `rgba(255,255,255,${1 - sw.radius / sw.maxRadius})`;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Particles
      this.particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Enemies
      this.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Player
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#fff";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
      ctx.fill();

      const hpPct = this.player.hp / this.player.maxHp;
      ctx.rotate(-Math.PI / 2);
      ctx.lineWidth = 4;
      let hpColor = "#0f0";
      if (this.player.hitTimer > 0) hpColor = "#f00";
      else if (hpPct < 0.3) hpColor = `hsl(${this.gameTime * 500 % 360}, 100%, 50%)`;
      else hpColor = "#0ff";

      ctx.strokeStyle = hpColor;
      ctx.shadowColor = hpColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius + 10, 0, Math.PI * 2 * hpPct);
      ctx.stroke();
      ctx.restore();

      // Flash
      if (this.flashIntensity > 0.01) {
        ctx.fillStyle = `rgba(255,255,255,${this.flashIntensity})`;
        ctx.fillRect(0, 0, width, height);
      }
    },
    gameLoop(timestamp) {
      if (this.gameState !== "PLAYING") return;

      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.updateGame(dt);
      this.drawGame();

      this.animationId = requestAnimationFrame(this.gameLoop);
    },
    startGame() {
      this.initAudio();
      this.gameState = "PLAYING";
      this.score = 0;
      this.waveTimer = 10;
      this.player.hp = 100;
      this.player.trail = [];
      this.player.x = this.width / 2;
      this.player.y = this.height / 2;
      this.mouse.x = this.width / 2;
      this.mouse.y = this.height / 2;
      this.enemies = [];
      this.particles = [];
      this.shockwaves = [];
      this.flashIntensity = 0;

      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
      this.playBGM();
    },
    gameOver() {
      this.gameState = "GAMEOVER";
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.cleanupAudio();
    }
  }
};
</script>

<style scoped>
#game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#gameCanvas {
  display: block;
  background-color: #050010;
}
body {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  touch-action: none;
}
#ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
}
#score-board {
  text-align: right;
  color: #0ff;
  text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
  font-size: 24px;
  font-weight: bold;
}
#score-val {
  font-size: 40px;
  display: block;
}
#start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
  pointer-events: auto;
  backdrop-filter: blur(5px);
}
h1 {
  font-size: 40px;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(90deg, #f0f, #0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
}
p {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.5;
}
button {
  background: transparent;
  border: 2px solid #0ff;
  color: #0ff;
  padding: 15px 40px;
  font-size: 18px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 3px;
  box-shadow: 0 0 15px #0ff inset, 0 0 20px #0ff;
  transition: all 0.3s;
  font-family: inherit;
}
button:hover {
  background: #0ff;
  color: #000;
  box-shadow: 0 0 30px #0ff inset, 0 0 50px #0ff;
}
.hidden {
  display: none !important;
}
</style>
