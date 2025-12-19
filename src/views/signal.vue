<template>
  <div class="fullscreen-container">
    <div style="position: relative; width: 100vw; height: 100vh; overflow: hidden; background: black;">
      <div id="loading" v-show="loading">正在启动摄像头和模型...</div>
      <div ref="canvasContainer" style="width: 100%; height: 100%;"></div>
      <video ref="inputVideo" class="input_video"></video>
    </div>
  </div>

</template>

<script>
import * as THREE from 'three'

export default {
  name: 'HandGestureParticles',
  data() {
    return {
      loading: true,
      scene: null,
      camera: null,
      renderer: null,
      particles: null,
      positionsAttribute: null,
      targetPositions: null,

      currentBaseScale: 1.0,
      targetHandScale: 1.0,

      // 配置
      CONFIG: {
        particleCount: 6000,
        particleSize: 0.08,
        initialColor: '#00ffff',
        transitionSpeed: 0.08,
        handSensitivity: 1.2,
        shapes: ['爱心', '花朵', '土星', '环形结(替代佛像)', '烟花']
      },

      guiState: {
        shape: '爱心',
        color: '#00ffff'
      },

      hands: null,
      cameraUtils: null
    }
  },

  mounted() {
    this.initScene();
    this.initHandTracking();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
  },

  beforeDestroy() {
    if (this.cameraUtils) this.cameraUtils.stop();
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
  },

  methods: {
    // ================= 1. Three.js 场景初始化 =================
    initScene() {
      const { CONFIG } = this;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
      this.scene.background = new THREE.Color(0x000000); // 👈 关键：设置场景背景

      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 12;

      // 👇 关键修改：移除 alpha: true，并设置 clearColor
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
        // alpha: true ← 删除这一行
      });
      this.renderer.setClearColor(0x000000, 1); // 黑色，不透明
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.$refs.canvasContainer.appendChild(this.renderer.domElement);

      this.targetPositions = new Float32Array(CONFIG.particleCount * 3);
      this.initParticles();
      this.initGUI();
    },

    // ================= 2. 粒子系统 =================
    initParticles() {
      const { CONFIG } = this;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(CONFIG.particleCount * 3);

      this.generateFireworksPoints(positions);
      this.targetPositions.set(positions);

      this.positionsAttribute = new THREE.BufferAttribute(positions, 3);
      geometry.setAttribute('position', this.positionsAttribute);

      const material = new THREE.PointsMaterial({
        color: CONFIG.initialColor,
        size: CONFIG.particleSize,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);

      this.changeShape(this.guiState.shape);
    },

    // ================= 3. 形状生成函数 =================
    randomSpherePoint(radius) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
      };
    },

    generateHeartPoints(arr) {
      const { CONFIG } = this;
      for (let i = 0; i < CONFIG.particleCount; i++) {
        let t = Math.random() * Math.PI * 2;
        let offset = Math.random() * 0.5;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let z = (Math.random() - 0.5) * 4;
        let i3 = i * 3;
        arr[i3] = x * 0.3 + (Math.random() - 0.5) * offset;
        arr[i3 + 1] = y * 0.3 + (Math.random() - 0.5) * offset;
        arr[i3 + 2] = z * 0.3;
      }
    },

    generateFlowerPoints(arr) {
      const { CONFIG } = this;
      for (let i = 0; i < CONFIG.particleCount; i++) {
        const r_base = 5;
        const petals = 6;
        let t = Math.random() * Math.PI * 2;
        let r = r_base * Math.abs(Math.sin(petals / 2 * t)) + Math.random() * 2;
        let z_offset = (Math.random() - 0.5) * (5 - r / 2);
        let i3 = i * 3;
        arr[i3] = r * Math.cos(t);
        arr[i3 + 1] = r * Math.sin(t);
        arr[i3 + 2] = z_offset;
      }
    },

    generateSaturnPoints(arr) {
      const { CONFIG } = this;
      const ringRatio = 0.7;
      const splitIndex = Math.floor(CONFIG.particleCount * ringRatio);
      for (let i = 0; i < splitIndex; i++) {
        let t = Math.random() * Math.PI * 2;
        let r = 6 + Math.random() * 3;
        let i3 = i * 3;
        arr[i3] = r * Math.cos(t);
        arr[i3 + 1] = (Math.random() - 0.5) * 0.2;
        arr[i3 + 2] = r * Math.sin(t);
      }
      for (let i = splitIndex; i < CONFIG.particleCount; i++) {
        let p = this.randomSpherePoint(3.5 + Math.random() * 0.5);
        let i3 = i * 3;
        arr[i3] = p.x;
        arr[i3 + 1] = p.y;
        arr[i3 + 2] = p.z;
      }
    },

    generateTorusKnotPoints(arr) {
      const { CONFIG } = this;
      for (let i = 0; i < CONFIG.particleCount; i++) {
        let t = (i / CONFIG.particleCount) * Math.PI * 2 * 3;
        const p = 2, q = 3, radius = 3, tube = 1.2;
        let r = radius * (2 + Math.cos(q * t));
        let x = r * Math.cos(p * t);
        let y = r * Math.sin(p * t);
        let z = -radius * Math.sin(q * t) * 2.5;
        let tubeAngle = Math.random() * Math.PI * 2;
        let tubeR = Math.random() * tube;
        x += tubeR * Math.cos(tubeAngle);
        y += tubeR * Math.sin(tubeAngle);
        z += (Math.random() - 0.5) * tube;
        let i3 = i * 3;
        arr[i3] = x;
        arr[i3 + 1] = y;
        arr[i3 + 2] = z;
      }
    },

    generateFireworksPoints(arr) {
      const { CONFIG } = this;
      for (let i = 0; i < CONFIG.particleCount; i++) {
        let radius = Math.pow(Math.random(), 1 / 3) * 15;
        let p = this.randomSpherePoint(radius);
        let i3 = i * 3;
        arr[i3] = p.x;
        arr[i3 + 1] = p.y;
        arr[i3 + 2] = p.z;
      }
    },

    // ================= 4. 核心逻辑 =================
    changeShape(shapeName) {
      switch (shapeName) {
        case '爱心': this.generateHeartPoints(this.targetPositions); break;
        case '花朵': this.generateFlowerPoints(this.targetPositions); break;
        case '土星': this.generateSaturnPoints(this.targetPositions); break;
        case '环形结(替代佛像)': this.generateTorusKnotPoints(this.targetPositions); break;
        case '烟花': this.generateFireworksPoints(this.targetPositions); break;
      }
    },

    animate() {
      requestAnimationFrame(this.animate);

      // 缩放平滑过渡
      this.currentBaseScale += (this.targetHandScale - this.currentBaseScale) * 0.1;
      if (this.particles) {
        this.particles.scale.set(this.currentBaseScale, this.currentBaseScale, this.currentBaseScale);
      }

      // 位置插值
      if (this.positionsAttribute) {
        const current = this.positionsAttribute.array;
        for (let i = 0; i < current.length; i++) {
          current[i] += (this.targetPositions[i] - current[i]) * this.CONFIG.transitionSpeed;
        }
        this.positionsAttribute.needsUpdate = true;
      }

      // 自转
      if (this.particles) {
        this.particles.rotation.y += 0.002;
        this.particles.rotation.x += 0.001;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    onWindowResize() {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    // ================= 5. MediaPipe 手势识别 =================
    initHandTracking() {
      const video = this.$refs.inputVideo;
      if (!window.Hands) {
        console.error('MediaPipe Hands not loaded');
        this.loading = false;
        return;
      }

      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults(this.onHandsResults);

      this.cameraUtils = new Camera(video, {
        onFrame: async () => {
          await this.hands.send({ image: video });
        },
        width: 640,
        height: 480
      });

      this.cameraUtils.start().then(() => {
        this.loading = false;
      }).catch(err => {
        this.loading = false;
        document.getElementById('loading').innerText = "摄像头启动失败，请检查权限。";
        console.error(err);
      });
    },

    onHandsResults(results) {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const wrist = landmarks[0];
        const fingertips = [4, 8, 12, 16, 20];
        let totalDistance = 0;
        for (let i of fingertips) {
          const tip = landmarks[i];
          const dx = tip.x - wrist.x;
          const dy = tip.y - wrist.y;
          totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        const avgDistance = totalDistance / 5;

        const inputStart = 0.15, inputEnd = 0.5;
        const outputStart = 0.3, outputEnd = 2.5;
        let scale = outputStart + (avgDistance - inputStart) * (outputEnd - outputStart) / (inputEnd - inputStart);
        scale = Math.max(outputStart, Math.min(outputEnd, scale));
        this.targetHandScale = scale * this.CONFIG.handSensitivity;
      } else {
        this.targetHandScale = 1.0;
      }
    },

    // ================= 6. UI 控制 =================
    initGUI() {
      if (!window.lil) return;
      const gui = new lil.GUI({ title: '控制器面板' });
      gui.add(this.guiState, 'shape', this.CONFIG.shapes)
          .name('选择模型')
          .onChange((val) => this.changeShape(val));
      gui.addColor(this.guiState, 'color')
          .name('粒子颜色')
          .onChange((val) => {
            if (this.particles) this.particles.material.color.set(val);
          });
      gui.add({ fullscreen: this.toggleFullscreen }, 'fullscreen').name('全屏模式 [F11]');
    },

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
</script>

<style scoped>
/* 确保整个容器为黑色 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 防止滚动条出现 */
  background: black !important;
}

/* 最外层容器必须撑满 */
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: black;
  overflow: hidden;
}

.input_video {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

#loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  pointer-events: none;
  z-index: 200;
}
</style>
