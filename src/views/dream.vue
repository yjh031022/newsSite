<template>
  <div id="app">
    <!-- Canvas容器 -->
    <div id="canvas-container" ref="canvasContainer"></div>

    <!-- 隐藏的视频元素用于摄像头 -->
    <video id="video-element" ref="videoElement" playsinline style="display: none;"></video>

    <!-- 加载遮罩 -->
    <div
        v-if="loading"
        id="loader-overlay"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95 transition-opacity duration-700"
    >
      <div class="loader mb-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]"></div>
      <div class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 text-2xl font-bold tracking-widest uppercase">
        Visual Core
      </div>
      <div class="text-gray-500 text-xs mt-3 tracking-widest">INITIALIZING PARTICLE ENGINE v2.1</div>
    </div>

    <!-- UI界面 -->
    <div v-if="!loading" class="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-4 md:p-8 flex flex-col justify-between">
      <div class="flex justify-between items-start pointer-events-auto">
        <div class="glass-panel p-5 animate-fade-in-down transform transition-all hover:scale-105 duration-500">
          <h1 class="text-white text-2xl font-bold tracking-tight mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            粒子 · 幻境 <span class="text-xs text-cyan-400 align-top">v2.1</span>
          </h1>
          <div class="flex items-center gap-3 bg-black/30 rounded-full px-3 py-1 w-fit border border-white/5">
            <div
                :class="[
                'w-2 h-2 rounded-full transition-all duration-500',
                isHandDetected
                  ? 'bg-cyan-400 shadow-[0_0_15px_cyan]'
                  : 'bg-red-500 shadow-[0_0_10px_red]'
              ]"
            ></div>
            <span
                :class="[
                'text-[10px] font-mono uppercase tracking-wider',
                isHandDetected
                  ? 'text-cyan-300 font-bold'
                  : 'text-red-400 animate-pulse'
              ]"
            >
              {{ isHandDetected ? 'LINK ESTABLISHED' : 'SEARCHING SIGNAL...' }}
            </span>
          </div>
          <div class="text-[10px] text-gray-400 mt-3 font-mono border-t border-white/10 pt-2 flex flex-col gap-1">
            <div :class="['mode-item', currentStableMode === 'scale' ? 'active' : '']">👋 五指张合: 能量爆发 (缩放)</div>
            <div :class="['mode-item', currentStableMode === 'rotate' ? 'active' : '']">☝️ 食指滑动: 视角旋转 (锁定缩放)</div>
            <div :class="['mode-item', currentStableMode === 'roll' ? 'active' : '']">✌️ 双指旋转: 平面翻转 (旋钮操控)</div>
          </div>
        </div>

        <button @click="toggleFullScreen" class="glass-panel p-4 text-white hover:text-cyan-300 control-btn rounded-full group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <div class="pointer-events-auto flex flex-col md:flex-row gap-6 items-end md:items-center justify-between w-full">
        <div class="glass-panel p-2 flex gap-2 overflow-x-auto max-w-full custom-scroll">
          <button
              v-for="shape in shapes"
              :key="shape.id"
              @click="changeShape(shape.id)"
              :class="[
              'control-btn px-6 py-3 rounded-xl text-sm text-white font-semibold whitespace-nowrap tracking-wide',
              currentShape === shape.id ? 'active' : ''
            ]"
          >
            {{ shape.label }}
          </button>
        </div>

        <div class="glass-panel p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
          <span class="text-white text-xs font-mono tracking-wider uppercase opacity-70">Emission Color</span>
          <div class="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-cyan-400 transition-all">
            <input
                type="color"
                :value="userBaseColor"
                class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0"
                @change="updateColor($event.target.value)"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

export default {
  name: 'ParticleSystem',
  data() {
    return {
      // 配置常量
      PARTICLE_COUNT: 45000,
      PARTICLE_SIZE: 0.18,
      SATURN_BODY_RATIO: 0.3,

      // 状态变量
      loading: true,
      scene: null,
      camera: null,
      renderer: null,
      composer: null,
      particles: null,
      controls: null,

      targetPositions: [],
      targetColors: [],
      currentShape: 'sphere',
      isHandDetected: false,
      handInfluence: 0.5,
      clock: new THREE.Clock(),

      // 颜色状态
      userBaseColor: '#00ffff',

      // 旋转交互变量
      previousFingerPos: { x: 0, y: 0 },
      smoothedFingerPos: { x: 0, y: 0 },
      rotationVelocity: { x: 0, y: 0, z: 0 },
      isTrackingRotation: false,

      // 双指旋钮交互变量
      isTrackingRoll: false,
      smoothedIndexTip: { x: 0, y: 0 },
      smoothedMiddleTip: { x: 0, y: 0 },
      previousRollAngle: 0,

      // 模式变量
      currentStableMode: 'scale',
      modeFrameCounter: 0,
      lastTimeHandDetected: 0,

      // 形状列表
      shapes: [
        { id: 'sphere', label: '星云球' },
        { id: 'heart', label: '机械心' },
        { id: 'saturn', label: '土星环' },
        { id: 'lotus', label: '能量莲' },
        { id: 'galaxy', label: '黑洞' }
      ],

      // MediaPipe Hands 实例
      hands: null,
      cameraUtils: null
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    // 清理资源
    if (this.cameraUtils) {
      this.cameraUtils.stop()
    }
    if (this.renderer) {
      this.renderer.dispose()
    }
    window.removeEventListener('resize', this.onWindowResize)
  },
  methods: {
    async init() {
      try {
        await this.initThreeScene()
        await this.setupMediaPipe()
        this.startAnimation()
        setTimeout(() => {
          this.loading = false
        }, 1500)
      } catch (error) {
        console.error('初始化失败:', error)
      }
    },

    async initThreeScene() {
      // 1. 创建场景和相机
      this.scene = new THREE.Scene()
      this.scene.fog = new THREE.FogExp2(0x020205, 0.02)

      this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.camera.position.z = 30
      this.camera.position.y = 0

      // 2. 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance"
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      this.renderer.toneMapping = THREE.ReinhardToneMapping
      this.$refs.canvasContainer.appendChild(this.renderer.domElement)

      // 3. 后期处理 (Bloom效果)
      const renderScene = new RenderPass(this.scene, this.camera)
      const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.5,
          0.4,
          0.85
      )
      bloomPass.threshold = 0.05
      bloomPass.strength = 1.4
      bloomPass.radius = 0.6

      this.composer = new EffectComposer(this.renderer)
      this.composer.addPass(renderScene)
      this.composer.addPass(bloomPass)

      // 4. 轨道控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.autoRotate = true
      this.controls.autoRotateSpeed = 0.5
      this.controls.enableZoom = true

      // 5. 创建粒子系统
      this.createParticles()

      // 6. 窗口大小调整监听
      window.addEventListener('resize', this.onWindowResize)
    },

    createParticles() {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(this.PARTICLE_COUNT * 3)
      const colors = new Float32Array(this.PARTICLE_COUNT * 3)

      const sphere = this.getShapePositions('sphere')
      const initialColors = this.getShapeColors('sphere')

      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        positions[i * 3] = sphere[i * 3]
        positions[i * 3 + 1] = sphere[i * 3 + 1]
        positions[i * 3 + 2] = sphere[i * 3 + 2]

        colors[i * 3] = initialColors[i * 3]
        colors[i * 3 + 1] = initialColors[i * 3 + 1]
        colors[i * 3 + 2] = initialColors[i * 3 + 2]
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const sprite = this.createParticleTexture()

      const material = new THREE.PointsMaterial({
        size: this.PARTICLE_SIZE,
        map: sprite,
        color: new THREE.Color(this.userBaseColor),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        vertexColors: true
      })

      this.particles = new THREE.Points(geometry, material)
      this.scene.add(this.particles)

      this.targetPositions = Float32Array.from(sphere)
      this.targetColors = Float32Array.from(initialColors)
    },

    createParticleTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const context = canvas.getContext('2d')
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 32, 32)
      return new THREE.CanvasTexture(canvas)
    },

    getShapeColors(type) {
      const cols = new Float32Array(this.PARTICLE_COUNT * 3)

      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        let brightness = 0.2 + Math.random() * 0.8
        let r, g, b

        if (type === 'saturn') {
          if (i < this.PARTICLE_COUNT * this.SATURN_BODY_RATIO) {
            r = 1.0; g = 0.7; b = 0.3
          } else {
            r = 0.6; g = 0.8; b = 1.0
          }
          r *= brightness; g *= brightness; b *= brightness
        } else {
          r = brightness; g = brightness; b = brightness
        }

        cols[i * 3] = r
        cols[i * 3 + 1] = g
        cols[i * 3 + 2] = b
      }
      return cols
    },

    getShapePositions(type) {
      const pos = new Float32Array(this.PARTICLE_COUNT * 3)

      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        let x, y, z

        if (type === 'sphere') {
          const r = 10 + Math.random() * 2
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          x = r * Math.sin(phi) * Math.cos(theta)
          y = r * Math.sin(phi) * Math.sin(theta)
          z = r * Math.cos(phi)
          if (i < this.PARTICLE_COUNT * 0.2) { x *= 0.3; y *= 0.3; z *= 0.3 }
        }
        else if (type === 'heart') {
          const t = Math.PI - 2 * Math.PI * Math.random()
          const u = 2 * Math.PI * Math.random()
          x = 16 * Math.pow(Math.sin(t), 3)
          y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
          z = 6 * Math.cos(t) * Math.sin(u) * Math.sin(t)
          const scale = 0.6
          x *= scale; y *= scale; z *= scale
          if (Math.random() > 0.8) { x *= 1.1; y *= 1.1; z *= 1.1 }
        }
        else if (type === 'saturn') {
          if (i < this.PARTICLE_COUNT * this.SATURN_BODY_RATIO) {
            const r = 5.5
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            x = r * Math.sin(phi) * Math.cos(theta)
            y = r * 0.9 * Math.sin(phi) * Math.sin(theta)
            z = r * Math.cos(phi)
          } else {
            const angle = Math.random() * Math.PI * 2
            const ringSelector = Math.random()
            let r, thickness
            if (ringSelector < 0.45) {
              r = 7 + Math.random() * 3.5; thickness = 0.2
            } else if (ringSelector < 0.5) {
              r = 10.5 + Math.random() * 1.5; thickness = 0.1
              if (Math.random() > 0.2) { x=0; y=0; z=0; pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; continue }
            } else {
              r = 12 + Math.random() * 5; thickness = 0.4
            }
            r += (Math.random() - 0.5) * 0.3
            x = r * Math.cos(angle)
            y = (Math.random() - 0.5) * thickness
            z = r * Math.sin(angle)
            const tilt = 0.4
            const y_new = y * Math.cos(tilt) - x * Math.sin(tilt)
            const x_new = y * Math.sin(tilt) + x * Math.cos(tilt)
            x = x_new; y = y_new
          }
        }
        else if (type === 'lotus') {
          const u = Math.random() * Math.PI * 2
          const v = Math.random()
          const petals = 7
          const rBase = 8 * (0.5 + 0.5 * Math.pow(Math.sin(petals * u * 0.5), 2)) * v
          x = rBase * Math.cos(u)
          z = rBase * Math.sin(u)
          y = 4 * Math.pow(v, 2) - 2
          if (i < this.PARTICLE_COUNT * 0.15) {
            x = (Math.random()-0.5);
            z = (Math.random()-0.5);
            y = (Math.random()-0.5)*10
          }
        }
        else if (type === 'galaxy') {
          const arms = 3
          const spin = i % arms
          const angleOffset = (spin / arms) * Math.PI * 2
          const dist = Math.pow(Math.random(), 0.5)
          const r = dist * 20
          const angle = dist * 10 + angleOffset
          x = r * Math.cos(angle)
          z = r * Math.sin(angle)
          y = (Math.random() - 0.5) * (15 - r) * 0.2
          if (r < 2) y *= 0.2
        }

        pos[i * 3] = x
        pos[i * 3 + 1] = y
        pos[i * 3 + 2] = z
      }
      return pos
    },

    animate() {
      requestAnimationFrame(this.animate)

      const time = this.clock.getElapsedTime()

      const positions = this.particles.geometry.attributes.position.array
      const colors = this.particles.geometry.attributes.color.array

      let targetScaleBase = 1.0
      let targetParticleSize = this.PARTICLE_SIZE
      let turbulence = 0.05

      // 模式应用
      if (this.isHandDetected) {
        targetScaleBase = 0.2 + (this.handInfluence * 2.3)
        turbulence = 0.02 + (this.handInfluence * 0.3)
        targetParticleSize = this.PARTICLE_SIZE * (0.8 + this.handInfluence * 2.5)
      } else {
        targetScaleBase = 1.0 + Math.sin(time * 1.5) * 0.05
        targetParticleSize = this.PARTICLE_SIZE * (1.0 + Math.sin(time * 1.5) * 0.15)
      }

      if (this.particles && this.particles.material) {
        this.particles.material.size = THREE.MathUtils.lerp(
            this.particles.material.size,
            targetParticleSize,
            0.1
        )

        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize()
        const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion).normalize()
        const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize()

        this.particles.rotateOnWorldAxis(camUp, this.rotationVelocity.y)
        this.particles.rotateOnWorldAxis(camRight, this.rotationVelocity.x)
        this.particles.rotateOnWorldAxis(camForward, this.rotationVelocity.z)

        const MAX_SPEED = 0.06
        const MAX_ROLL_SPEED = 0.035

        this.rotationVelocity.x = THREE.MathUtils.clamp(this.rotationVelocity.x, -MAX_SPEED, MAX_SPEED)
        this.rotationVelocity.y = THREE.MathUtils.clamp(this.rotationVelocity.y, -MAX_SPEED, MAX_SPEED)
        this.rotationVelocity.z = THREE.MathUtils.clamp(this.rotationVelocity.z, -MAX_ROLL_SPEED, MAX_ROLL_SPEED)

        this.rotationVelocity.x *= 0.92
        this.rotationVelocity.y *= 0.92
        this.rotationVelocity.z *= 0.96
      }

      const lerpSpeed = 0.06
      const colorLerpSpeed = 0.03

      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        const idx = i * 3

        let tx = this.targetPositions[idx]
        let ty = this.targetPositions[idx + 1]
        let tz = this.targetPositions[idx + 2]

        const dist = Math.sqrt(tx * tx + ty * ty + tz * tz)
        const normalizedDist = Math.min(dist / 20.0, 1.0)

        let distanceExpansionBoost = 1.0
        if (this.isHandDetected) {
          distanceExpansionBoost = 1.0 + (this.handInfluence * Math.pow(normalizedDist, 1.5) * 2.0)
        }

        const finalScale = targetScaleBase * distanceExpansionBoost
        tx *= finalScale; ty *= finalScale; tz *= finalScale

        if (this.currentShape === 'galaxy') {
          const angle = time * (0.1 + (1.0 - (Math.sqrt(tx*tx+tz*tz)/20)) * 0.5)
          const cos = Math.cos(angle); const sin = Math.sin(angle)
          const rx = tx * cos - tz * sin
          const rz = tx * sin + tz * cos
          tx = rx; tz = rz
        } else if (this.currentShape === 'lotus') {
          ty += Math.sin(time + tx) * 0.5
        } else {
          tx += Math.sin(time * 2 + i) * turbulence
          ty += Math.cos(time * 3 + i) * turbulence
          tz += Math.sin(time * 4 + i) * turbulence
        }

        positions[idx] += (tx - positions[idx]) * lerpSpeed
        positions[idx + 1] += (ty - positions[idx + 1]) * lerpSpeed
        positions[idx + 2] += (tz - positions[idx + 2]) * lerpSpeed

        if (this.targetColors.length > 0) {
          colors[idx] += (this.targetColors[idx] - colors[idx]) * colorLerpSpeed
          colors[idx + 1] += (this.targetColors[idx + 1] - colors[idx + 1]) * colorLerpSpeed
          colors[idx + 2] += (this.targetColors[idx + 2] - colors[idx + 2]) * colorLerpSpeed
        }

        if (Math.random() > 0.9995) {
          colors[idx] = 2.0; colors[idx + 1] = 2.0; colors[idx + 2] = 2.0
        }
        if (colors[idx] > 1.5) {
          colors[idx] *= 0.9; colors[idx + 1] *= 0.9; colors[idx + 2] *= 0.9
        }
      }

      this.particles.geometry.attributes.position.needsUpdate = true
      this.particles.geometry.attributes.color.needsUpdate = true

      if (!this.isHandDetected) {
        this.controls.autoRotate = true
        this.controls.autoRotateSpeed = 1.0
      } else {
        this.controls.autoRotate = false
      }

      this.controls.update()
      this.composer.render()
    },

    startAnimation() {
      this.animate()
    },

    async setupMediaPipe() {
      const videoElement = this.$refs.videoElement

      this.hands = new self.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      this.hands.onResults(this.onHandResults)

      this.cameraUtils = new self.Camera(videoElement, {
        onFrame: async () => {
          await this.hands.send({ image: videoElement })
        },
        width: 640,
        height: 480
      })

      try {
        await this.cameraUtils.start()
      } catch (err) {
        console.error('摄像头启动失败:', err)
      }
    },

    onHandResults(results) {
      const now = Date.now()

      // 信号防抖核心逻辑
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // 检测到手
        this.isHandDetected = true
        this.lastTimeHandDetected = now

        const landmarks = results.multiHandLandmarks[0]

        const getDist = (i, j) => {
          return Math.sqrt(
              Math.pow(landmarks[i].x - landmarks[j].x, 2) +
              Math.pow(landmarks[i].y - landmarks[j].y, 2)
          )
        }

        // 手势判定宽松化
        const isIndexOpen = getDist(8, 0) > getDist(6, 0) * 1.1
        const isMiddleOpen = getDist(12, 0) > getDist(10, 0) * 1.1
        const isRingOpen = getDist(16, 0) > getDist(14, 0) * 1.1
        const isPinkyOpen = getDist(20, 0) > getDist(18, 0) * 1.1

        let detectedMode = 'scale'

        // 优先级逻辑优化
        if (isRingOpen || isPinkyOpen) {
          detectedMode = 'scale'
        } else if (isIndexOpen && isMiddleOpen) {
          detectedMode = 'roll'
        } else if (isIndexOpen && !isMiddleOpen) {
          detectedMode = 'rotate'
        } else {
          detectedMode = 'scale'
        }

        if (detectedMode === this.currentStableMode) {
          this.modeFrameCounter = 0
        } else {
          this.modeFrameCounter++
          const switchThreshold = 4

          if (this.modeFrameCounter > switchThreshold) {
            this.currentStableMode = detectedMode
            this.modeFrameCounter = 0
            this.isTrackingRotation = false
            this.isTrackingRoll = false
            this.previousFingerPos = { x: 0, y: 0 }
          }
        }

        if (this.currentStableMode === 'roll') {
          this.handleRollGesture(landmarks)
        } else if (this.currentStableMode === 'rotate') {
          this.handleRotateGesture(landmarks)
        } else {
          this.handleScaleGesture(landmarks)
        }

      } else {
        // 未检测到手
        if (now - this.lastTimeHandDetected < 800) {
          return
        }

        this.isHandDetected = false
        this.isTrackingRotation = false
        this.isTrackingRoll = false
        this.modeFrameCounter = 0
        this.currentStableMode = 'scale'
        this.handInfluence = THREE.MathUtils.lerp(this.handInfluence, 0.5, 0.02)
      }
    },

    handleRollGesture(landmarks) {
      const rawIndex = landmarks[8]
      const rawMiddle = landmarks[12]

      if (!this.isTrackingRoll) {
        this.smoothedIndexTip = { x: rawIndex.x, y: rawIndex.y }
        this.smoothedMiddleTip = { x: rawMiddle.x, y: rawMiddle.y }
        const dx = rawIndex.x - rawMiddle.x
        const dy = rawIndex.y - rawMiddle.y
        this.previousRollAngle = Math.atan2(dy, dx)
        this.isTrackingRoll = true
      } else {
        const lerpFactor = 0.2
        this.smoothedIndexTip.x = THREE.MathUtils.lerp(this.smoothedIndexTip.x, rawIndex.x, lerpFactor)
        this.smoothedIndexTip.y = THREE.MathUtils.lerp(this.smoothedIndexTip.y, rawIndex.y, lerpFactor)
        this.smoothedMiddleTip.x = THREE.MathUtils.lerp(this.smoothedMiddleTip.x, rawMiddle.x, lerpFactor)
        this.smoothedMiddleTip.y = THREE.MathUtils.lerp(this.smoothedMiddleTip.y, rawMiddle.y, lerpFactor)
      }

      const dx = this.smoothedIndexTip.x - this.smoothedMiddleTip.x
      const dy = this.smoothedIndexTip.y - this.smoothedMiddleTip.y
      const currentAngle = Math.atan2(dy, dx)

      let deltaAngle = currentAngle - this.previousRollAngle

      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI

      const inputVelocity = -deltaAngle * 1.5

      this.rotationVelocity.z = THREE.MathUtils.lerp(this.rotationVelocity.z, inputVelocity, 0.3)

      this.previousRollAngle = currentAngle
      this.isTrackingRotation = false
    },

    handleRotateGesture(landmarks) {
      const rawFingerX = landmarks[8].x
      const rawFingerY = landmarks[8].y

      if (!this.isTrackingRotation) {
        this.smoothedFingerPos = { x: rawFingerX, y: rawFingerY }
        this.previousFingerPos = { x: rawFingerX, y: rawFingerY }
        this.isTrackingRotation = true
      }

      const smoothingFactor = 0.2
      this.smoothedFingerPos.x = THREE.MathUtils.lerp(this.smoothedFingerPos.x, rawFingerX, smoothingFactor)
      this.smoothedFingerPos.y = THREE.MathUtils.lerp(this.smoothedFingerPos.y, rawFingerY, smoothingFactor)

      const deltaX = this.smoothedFingerPos.x - this.previousFingerPos.x
      const deltaY = this.smoothedFingerPos.y - this.previousFingerPos.y

      const MOVE_THRESHOLD = 0.005

      if (Math.abs(deltaX) > MOVE_THRESHOLD || Math.abs(deltaY) > MOVE_THRESHOLD) {
        const sensitivity = 3.5
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          const effectiveX = deltaX > 0 ? deltaX - MOVE_THRESHOLD : deltaX + MOVE_THRESHOLD
          this.rotationVelocity.y -= effectiveX * sensitivity
        } else {
          const effectiveY = deltaY > 0 ? deltaY - MOVE_THRESHOLD : deltaY + MOVE_THRESHOLD
          this.rotationVelocity.x += effectiveY * sensitivity
        }
      }
      this.previousFingerPos = { x: this.smoothedFingerPos.x, y: this.smoothedFingerPos.y }
      this.isTrackingRoll = false
    },

    handleScaleGesture(landmarks) {
      if (this.isTrackingRoll) {
        this.isTrackingRoll = false
      }
      this.isTrackingRotation = false

      const getDist = (i, j) => {
        return Math.sqrt(
            Math.pow(landmarks[i].x - landmarks[j].x, 2) +
            Math.pow(landmarks[i].y - landmarks[j].y, 2)
        )
      }

      const tips = [4, 8, 12, 16, 20]
      let totalDist = 0
      tips.forEach(idx => {
        totalDist += getDist(idx, 0)
      })

      const avgDist = totalDist / 5
      let rawOpenness = (avgDist - 0.08) / (0.4 - 0.08)
      rawOpenness = Math.max(0, Math.min(1, rawOpenness))

      this.handInfluence = THREE.MathUtils.lerp(this.handInfluence, rawOpenness, 0.2)
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.composer.setSize(window.innerWidth, window.innerHeight)
    },

    changeShape(shape) {
      this.currentShape = shape
      this.targetPositions = this.getShapePositions(shape)
      this.targetColors = this.getShapeColors(shape)

      if (shape === 'saturn') {
        this.tweenColor({ r: 1, g: 1, b: 1 }, 500)
      } else {
        const c = new THREE.Color(this.userBaseColor)
        this.tweenColor({ r: c.r, g: c.g, b: c.b }, 500)
      }
    },

    updateColor(hex) {
      this.userBaseColor = hex

      if (this.particles && this.currentShape !== 'saturn') {
        const c = new THREE.Color(hex)
        const initial = this.particles.material.color.clone()
        this.tweenColor({ r: c.r, g: c.g, b: c.b }, 500, initial)
      }
    },

    tweenColor(target, duration, initialColor = null) {
      if (!this.particles) return

      const obj = this.particles.material.color
      const initial = initialColor || obj.clone()
      const targetObj = target
      const startTime = performance.now()

      const animate = (time) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)

        obj.r = initial.r + (targetObj.r - initial.r) * ease
        obj.g = initial.g + (targetObj.g - initial.g) * ease
        obj.b = initial.b + (targetObj.b - initial.b) * ease

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    },

    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    },

    setHandInfluence(influence) {
      this.handInfluence = influence
    },

    setRotationVelocity(data) {
      this.rotationVelocity = data
    },

    setRollVelocity(velocity) {
      this.rotationVelocity.z = velocity
    }
  }
}
</script>

<style scoped>
#canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.glass-panel {
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.control-btn {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.control-btn.active {
  background: linear-gradient(135deg, rgba(100, 200, 255, 0.4), rgba(100, 200, 255, 0.1));
  border: 1px solid rgba(100, 200, 255, 0.5);
  box-shadow: 0 0 25px rgba(79, 209, 197, 0.3);
  text-shadow: 0 0 8px rgba(255,255,255,0.8);
}

.loader {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-left-color: #00ffff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.custom-scroll::-webkit-scrollbar {
  height: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

.mode-item {
  transition: all 0.2s ease;
  opacity: 0.4;
  transform: scale(0.95);
  font-weight: normal;
}

.mode-item.active {
  opacity: 1;
  transform: scale(1.0);
  color: #22d3ee;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
}
</style>
