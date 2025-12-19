<template>
  <div id="app" :class="{ 'ui-hidden': !isUiVisible }">
    <!-- 加载动画 -->
    <div v-if="loading" id="loading" class="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">正在初始化粒子引擎...</div>
    </div>

    <!-- 显隐切换按钮 -->
    <button
        id="toggle-ui-btn"
        class="toggle-ui-btn"
        @click="toggleUI"
        title="切换界面显示 (快捷键: H)"
    >
      <svg class="eye-icon" viewBox="0 0 24 24">
        <path :d="isUiVisible ? eyeOpenIcon : eyeClosedIcon" />
      </svg>
    </button>

    <!-- 左上角状态面板 -->
    <div v-if="!loading" id="status-panel" class="status-panel ui-element">
      <h1 class="panel-title">粒子控制系统</h1>
      <p class="panel-subtitle">手势识别已激活</p>
      <div id="current-gesture" class="gesture-display">
        {{ currentGesture }}
      </div>
      <div class="gesture-hints">
        <p class="hint-item">✊ <strong class="hint-label">握拳</strong> &nbsp; 新年模式</p>
        <p class="hint-item">🖐 <strong class="hint-label">张开手掌</strong> &nbsp; 倒计时</p>
      </div>
    </div>

    <!-- 摄像头预览 -->
    <div v-if="!loading" id="video-wrapper" class="video-wrapper ui-element">
      <video id="input-video" class="video-preview"></video>
    </div>

    <!-- Canvas容器 -->
    <div id="canvas-container" class="canvas-container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'

export default {
  name: 'AppleParticleSystem',

  data() {
    return {
      // UI 状态
      loading: true,
      isUiVisible: true,
      currentGesture: '等待识别',

      // 图标路径
      eyeOpenIcon: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
      eyeClosedIcon: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.30 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',

      // 配置
      CONFIG: {
        particleCount: 12000,
        baseSize: 1.8,
        sizeVariation: 1.5,
        smoothness: 0.08,
        scatterRadius: 150,
        colorTech: '#e0e5ff',
        colorGold: '#ffcc00',
        colorRed: '#ff3333',
        isNewYear: false
      },

      // Three.js 对象
      scene: null,
      camera: null,
      renderer: null,
      particles: null,
      geometry: null,
      material: null,
      controls: null,
      gui: null,

      // 粒子数据
      targetPositions: [],
      currentPositions: [],
      velocities: [],
      particleExtras: [],

      // 文字相关
      textPixelCount: 0,
      lastText: '',
      time: 0,

      // 鼠标位置
      mouse: new THREE.Vector2(9999, 9999),

      // MediaPipe
      hands: null,
      videoStream: null,

      // GUI 库
      GUI: null,

      // 摄像头状态
      cameraEnabled: true,  // 摄像头是否启用
      cameraActive: false,  // 摄像头是否正在运行
      cameraError: false,   // 摄像头错误
      errorMessage: '',     // 错误信息
      loadingText: '正在初始化粒子引擎...', // 加载文本

      // 动画帧ID
      animationFrameId: null,
      handDetectionFrameId: null
    }
  },

  mounted() {
    // 设置页面样式
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.height = '100vh'

    // 先初始化Three.js
    this.initThreeJS()

    // 延迟加载GUI和摄像头
    setTimeout(() => {
      this.loadLilGUI().then(() => {
        this.initGUI()
      }).catch(error => {
        console.warn('lil-gui 加载失败:', error)
      })

      // 初始化计算机视觉
      this.initComputerVision().then(() => {
        this.startAnimation()
        setTimeout(() => {
          this.loading = false
        }, 1500)
      }).catch(error => {
        console.error('计算机视觉初始化失败:', error)
        this.loading = false
        this.startAnimation()
      })
    }, 500)

    this.initKeyboardShortcuts()
  },

  beforeDestroy() {
    // 清理资源
    this.stopCamera()

    if (this.renderer) {
      this.renderer.dispose()
    }
    if (this.gui) {
      this.gui.destroy()
    }
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('keydown', this.onKeyDown)

    // 停止动画循环
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.handDetectionFrameId) {
      cancelAnimationFrame(this.handDetectionFrameId)
    }

    // 恢复页面样式
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  },

  methods: {
    // 动态加载 lil-gui
    loadLilGUI() {
      return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (window.GUI) {
          this.GUI = window.GUI
          resolve()
          return
        }

        // 创建 script 标签加载 lil-gui
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/lil-gui@0.19.1/dist/lil-gui.umd.js'
        script.onload = () => {
          this.GUI = window.GUI
          resolve()
        }
        script.onerror = (error) => {
          console.warn('lil-gui 加载失败，GUI功能将不可用')
          resolve() // 不reject，让系统继续运行
        }
        document.head.appendChild(script)
      })
    },

    // === UI 控制 ===
    toggleUI() {
      this.isUiVisible = !this.isUiVisible
    },

    initKeyboardShortcuts() {
      window.addEventListener('keydown', this.onKeyDown)
    },

    onKeyDown(e) {
      if (e.key.toLowerCase() === 'h') {
        this.toggleUI()
      }
    },

    // === 初始化 ===
    initThreeJS() {
      const container = document.getElementById('canvas-container')

      // 1. 创建场景
      this.scene = new THREE.Scene()
      this.scene.fog = new THREE.FogExp2(0x000000, 0.008)

      // 2. 创建相机
      this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.camera.position.set(0, 0, 60)

      // 3. 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(this.renderer.domElement)

      // 4. 创建控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.autoRotate = true
      this.controls.autoRotateSpeed = 0.2
      this.controls.enableZoom = false

      // 5. 创建粒子系统
      this.createParticles()

      // 6. 初始化文字
      this.updateText("你好\n2025")

      // 7. 事件监听
      window.addEventListener('resize', this.onResize)
      document.addEventListener('mousemove', this.onMouseMove)
    },

    // === 粒子系统 ===
    createParticles() {
      this.geometry = new THREE.BufferGeometry()

      const posArray = new Float32Array(this.CONFIG.particleCount * 3)
      const colorArray = new Float32Array(this.CONFIG.particleCount * 3)
      const sizeArray = new Float32Array(this.CONFIG.particleCount)

      const techColor = new THREE.Color(this.CONFIG.colorTech)

      for (let i = 0; i < this.CONFIG.particleCount; i++) {
        const x = (Math.random() - 0.5) * this.CONFIG.scatterRadius * 2
        const y = (Math.random() - 0.5) * this.CONFIG.scatterRadius * 2
        const z = (Math.random() - 0.5) * this.CONFIG.scatterRadius

        posArray[i * 3] = x
        posArray[i * 3 + 1] = y
        posArray[i * 3 + 2] = z

        this.currentPositions.push({ x, y, z })
        this.targetPositions.push({ x, y, z })
        this.velocities.push({ x: 0, y: 0, z: 0 })

        colorArray[i * 3] = techColor.r
        colorArray[i * 3 + 1] = techColor.g
        colorArray[i * 3 + 2] = techColor.b

        const baseS = Math.random()
        sizeArray[i] = baseS

        this.particleExtras.push({
          baseSize: baseS,
          life: 0,
          maxLife: 0,
          isFirework: true,
          vx: 0,
          vy: 0,
          vz: 0
        })
      }

      this.geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
      this.geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1))

      const texture = this.createSoftGlowTexture()

      this.material = new THREE.PointsMaterial({
        size: this.CONFIG.baseSize,
        map: texture,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
      })

      this.particles = new THREE.Points(this.geometry, this.material)
      this.scene.add(this.particles)
    },

    createSoftGlowTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')

      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.15, 'rgba(255,255,255,0.9)')
      grad.addColorStop(0.4, 'rgba(255,255,255,0.2)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 128, 128)

      const tex = new THREE.Texture(canvas)
      tex.needsUpdate = true
      return tex
    },

    // === 文字生成 ===
    updateText(text) {
      if (text === this.lastText) return
      this.lastText = text
      this.CONFIG.isNewYear = text.includes("新年快乐")

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const width = 300
      const height = 150
      canvas.width = width
      canvas.height = height

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      const fontSize = text.length > 5 ? 40 : 100
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Arial"`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'

      if (text.includes('\n')) {
        const lines = text.split('\n')
        ctx.fillText(lines[0], width / 2, height / 2 - fontSize * 0.6)
        ctx.fillText(lines[1], width / 2, height / 2 + fontSize * 0.6)
      } else {
        ctx.fillText(text, width / 2, height / 2)
      }

      const data = ctx.getImageData(0, 0, width, height).data
      const validPoints = []

      const step = 2
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4] > 128) {
            validPoints.push({
              x: (x - width / 2) * 0.5,
              y: -(y - height / 2) * 0.5
            })
          }
        }
      }

      this.textPixelCount = validPoints.length

      for (let i = 0; i < this.CONFIG.particleCount; i++) {
        const extras = this.particleExtras[i]

        if (i < this.textPixelCount) {
          extras.isFirework = false
          this.targetPositions[i] = {
            x: validPoints[i].x,
            y: validPoints[i].y,
            z: 0
          }
        } else {
          extras.isFirework = true
          if (!this.CONFIG.isNewYear) {
            this.targetPositions[i] = {
              x: (Math.random() - 0.5) * this.CONFIG.scatterRadius,
              y: (Math.random() - 0.5) * this.CONFIG.scatterRadius * 0.6,
              z: (Math.random() - 0.5) * 40
            }
          }
        }
      }
    },

    // === 动画循环 ===
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)
      this.time += 0.015

      const positions = this.geometry.attributes.position.array
      const colors = this.geometry.attributes.color.array

      const cTech = new THREE.Color(this.CONFIG.colorTech)
      const cGold = new THREE.Color(this.CONFIG.colorGold)
      const cRed = new THREE.Color(this.CONFIG.colorRed)

      for (let i = 0; i < this.CONFIG.particleCount; i++) {
        const idx = i * 3
        const extras = this.particleExtras[i]
        const current = this.currentPositions[i]

        if (!extras.isFirework) {
          const target = this.targetPositions[i]

          let breathing = 0
          if (this.CONFIG.isNewYear) {
            breathing = Math.sin(this.time * 2 + current.x * 0.1) * 0.5
          }

          let dx = this.mouse.x - current.x
          let dy = this.mouse.y - current.y
          let dist = Math.sqrt(dx * dx + dy * dy)
          let forceX = 0,
              forceY = 0

          if (dist < 30) {
            const force = (30 - dist) / 30
            forceX = -dx * force * 0.5
            forceY = -dy * force * 0.5
          }

          const tx = target.x + forceX
          const ty = target.y + forceY + breathing
          const tz = target.z

          this.velocities[i].x += (tx - current.x) * this.CONFIG.smoothness
          this.velocities[i].y += (ty - current.y) * this.CONFIG.smoothness
          this.velocities[i].z += (tz - current.z) * this.CONFIG.smoothness

          this.velocities[i].x *= 0.85
          this.velocities[i].y *= 0.85
          this.velocities[i].z *= 0.85

          current.x += this.velocities[i].x
          current.y += this.velocities[i].y
          current.z += this.velocities[i].z

          let targetColor = this.CONFIG.isNewYear ? cGold : cTech

          colors[idx] += (targetColor.r - colors[idx]) * 0.05
          colors[idx + 1] += (targetColor.g - colors[idx + 1]) * 0.05
          colors[idx + 2] += (targetColor.b - colors[idx + 2]) * 0.05
        } else {
          if (this.CONFIG.isNewYear) {
            if (extras.life <= 0) {
              extras.life = 1.5 + Math.random()
              current.x = (Math.random() - 0.5) * 100
              current.y = (Math.random() - 0.5) * 60
              current.z = (Math.random() - 0.5) * 40

              const theta = Math.random() * Math.PI * 2
              const phi = Math.random() * Math.PI
              const speed = 0.2 + Math.random() * 0.8

              extras.vx = speed * Math.sin(phi) * Math.cos(theta)
              extras.vy = speed * Math.sin(phi) * Math.sin(theta)
              extras.vz = speed * Math.cos(phi)

              const isGold = Math.random() > 0.3
              const fc = isGold ? cGold : cRed
              colors[idx] = fc.r
              colors[idx + 1] = fc.g
              colors[idx + 2] = fc.b
            }

            current.x += extras.vx
            current.y += extras.vy
            current.z += extras.vz

            extras.vy -= 0.015
            extras.vx *= 0.98
            extras.vy *= 0.98
            extras.vz *= 0.98

            extras.life -= 0.02

            if (extras.life < 0.5) {
              colors[idx] *= 0.9
              colors[idx + 1] *= 0.9
              colors[idx + 2] *= 0.9
            }
          } else {
            const target = this.targetPositions[i]
            current.x += (target.x - current.x) * 0.01
            current.y += (target.y - current.y) * 0.01
            current.z += (target.z - current.z) * 0.01

            current.y += Math.sin(this.time * 0.3 + i) * 0.02

            colors[idx] += (cTech.r * 0.3 - colors[idx]) * 0.05
            colors[idx + 1] += (cTech.g * 0.3 - colors[idx + 1]) * 0.05
            colors[idx + 2] += (cTech.b * 0.3 - colors[idx + 2]) * 0.05
          }
        }

        positions[idx] = current.x
        positions[idx + 1] = current.y
        positions[idx + 2] = current.z
      }

      this.geometry.attributes.position.needsUpdate = true
      this.geometry.attributes.color.needsUpdate = true

      this.renderer.render(this.scene, this.camera)
    },

    startAnimation() {
      this.animate()
    },

    // === 事件处理 ===
    onMouseMove(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 200 - 100
      this.mouse.y = -(event.clientY / window.innerHeight) * 100 + 50
    },

    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    // === GUI 控制面板 ===
    initGUI() {
      if (!this.GUI) {
        console.warn('lil-gui 未加载，跳过GUI初始化')
        return
      }

      try {
        this.gui = new this.GUI({ title: '控制系统' })
        this.gui.domElement.classList.add('ui-element')
        this.gui.domElement.style.top = '80px'
        this.gui.domElement.style.right = '20px'
        this.gui.domElement.style.position = 'fixed'
        this.gui.domElement.style.zIndex = '1000'

        const f1 = this.gui.addFolder('外观设置')
        f1.add(this.CONFIG, 'baseSize', 0.5, 5.0).name('粒子大小').onChange(v => {
          if (this.material) this.material.size = v
        })
        f1.add(this.material, 'opacity', 0.1, 1.0).name('亮度')

        const f2 = this.gui.addFolder('物理参数')
        f2.add(this.CONFIG, 'smoothness', 0.01, 0.3).name('响应速度')

        const f3 = this.gui.addFolder('颜色设置')
        f3.addColor(this.CONFIG, 'colorTech').name('科技色')
        f3.addColor(this.CONFIG, 'colorGold').name('新年金色')

        f1.open()
        f2.open()
        f3.open()
      } catch (error) {
        console.error('初始化GUI失败:', error)
      }
    },

    // === 视觉识别 ===
    async initComputerVision() {
      try {
        const videoElement = document.getElementById('input-video')

        if (!videoElement) {
          console.warn('未找到视频元素')
          this.cameraEnabled = false
          return
        }

        // 检查浏览器是否支持 MediaPipe Hands
        if (!window.Hands) {
          console.warn('MediaPipe Hands 未加载')
          this.cameraEnabled = false
          return
        }

        // 初始化 MediaPipe Hands
        this.hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        this.hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        })

        // 设置手势识别结果回调
        this.hands.onResults((results) => {
          this.onHandResults(results)
        })

        // 尝试获取摄像头
        await this.startCamera(videoElement)

      } catch (error) {
        console.error('计算机视觉初始化失败:', error)
        this.cameraEnabled = false
        this.cameraError = true
        this.errorMessage = error.message
      }
    },

    // 启动摄像头（参考代码方式）
    async startCamera(videoElement) {
      try {
        // 检查媒体设备权限
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('浏览器不支持摄像头')
        }

        // 获取摄像头流
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' // 使用前置摄像头
          },
          audio: false
        })

        // 保存流以便清理
        this.videoStream = stream

        // 设置视频源
        videoElement.srcObject = stream

        // 等待视频加载
        return new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play().then(() => {
              this.cameraEnabled = true
              this.cameraActive = true
              this.cameraError = false

              // 启动手势检测循环
              this.startHandDetectionLoop(videoElement)
              resolve()
            }).catch(error => {
              console.error('视频播放失败:', error)
              throw error
            })
          }
        })

      } catch (error) {
        console.error('摄像头启动失败:', error)
        this.cameraEnabled = false
        this.cameraActive = false
        this.cameraError = true

        // 根据不同错误类型设置错误信息
        if (error.name === 'NotAllowedError') {
          this.errorMessage = '摄像头访问被拒绝，请检查权限设置'
        } else if (error.name === 'NotFoundError') {
          this.errorMessage = '未找到摄像头设备'
        } else {
          this.errorMessage = '摄像头启动失败: ' + error.message
        }

        throw error
      }
    },

    // 启动手势检测循环
    startHandDetectionLoop(videoElement) {
      const detectHands = async () => {
        if (!this.cameraActive || !this.hands) return

        try {
          // 检查视频是否准备好
          if (videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
            await this.hands.send({ image: videoElement })
          }
        } catch (error) {
          console.warn('手势检测失败:', error)
        }

        // 继续循环
        if (this.cameraActive) {
          this.handDetectionFrameId = requestAnimationFrame(detectHands)
        }
      }

      // 启动循环
      detectHands()
    },

    // 停止摄像头
    stopCamera() {
      this.cameraActive = false

      // 停止动画帧
      if (this.handDetectionFrameId) {
        cancelAnimationFrame(this.handDetectionFrameId)
        this.handDetectionFrameId = null
      }

      const videoElement = document.getElementById('input-video')
      if (videoElement && videoElement.srcObject) {
        videoElement.pause()
        videoElement.srcObject = null
      }

      // 停止视频流
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks()
        tracks.forEach(track => track.stop())
        this.videoStream = null
      }
    },

    // 手势识别结果处理
    onHandResults(results) {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]
        const gesture = this.analyzeGesture(landmarks)

        this.currentGesture = gesture.name

        this.updateText(gesture.text)
      }
    },

    analyzeGesture(landmarks) {
      const fingers = [8, 12, 16, 20]
      const pips = [6, 10, 14, 18]
      const wrist = landmarks[0]

      let extendedCount = 0
      for (let i = 0; i < 4; i++) {
        if (this.dist(landmarks[fingers[i]], wrist) > this.dist(landmarks[pips[i]], wrist) + 0.03) {
          extendedCount++
        }
      }

      const thumbTip = landmarks[4]
      const pinkyMcp = landmarks[17]
      const thumbMcp = landmarks[2]
      let thumbExtended = this.dist(thumbTip, pinkyMcp) > this.dist(thumbMcp, pinkyMcp) + 0.03

      const count = extendedCount + (thumbExtended ? 1 : 0)

      if (thumbExtended && extendedCount === 0)
        return { name: "竖起大拇指", text: "2026\n准备就绪", isNewYear: false }

      if (count === 0)
        return { name: "新年快乐", text: "新年\n快乐", isNewYear: true }

      if (count === 5) return { name: "倒计时: 5", text: "5", isNewYear: false }
      if (count === 4) return { name: "倒计时: 4", text: "4", isNewYear: false }
      if (count === 3) return { name: "倒计时: 3", text: "3", isNewYear: false }
      if (count === 2) return { name: "倒计时: 2", text: "2", isNewYear: false }
      if (count === 1) return { name: "倒计时: 1", text: "1", isNewYear: false }

      return { name: "识别中...", text: "...", isNewYear: false }
    },

    dist(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    },

    // 重试摄像头
    retryCamera() {
      this.cameraError = false
      this.loading = true
      this.loadingText = '正在重新连接摄像头...'

      setTimeout(() => {
        this.initComputerVision().then(() => {
          this.loading = false
          if (!this.cameraEnabled) {
            this.cameraError = true
          }
        })
      }, 500)
    },

    // 跳过摄像头
    skipCamera() {
      this.stopCamera()
      this.cameraEnabled = false
      this.cameraActive = false
      this.cameraError = false
      this.loading = false
      this.currentGesture = '手势识别已禁用'
    }
  }
}
</script>

<style scoped>
/* 全局样式重置 */
#app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}

/* Canvas容器 */
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  text-align: center;
  pointer-events: none;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
}

/* 显隐切换按钮 */
.toggle-ui-btn {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
}

.toggle-ui-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.eye-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* 状态面板 */
.status-panel {
  position: absolute;
  top: 40px;
  left: 40px;
  padding: 24px;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 280px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.panel-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.5px;
}

.panel-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.gesture-display {
  display: inline-block;
  margin-top: 12px;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, #a5a5a5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gesture-hints {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.hint-item {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-label {
  color: white;
}

/* 摄像头预览 */
.video-wrapper {
  position: absolute;
  bottom: 40px;
  right: 40px;
  width: 180px;
  height: 135px;
  border-radius: 24px;
  overflow: hidden;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 10;
  transform: scaleX(-1); /* 镜像 */
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

/* UI 隐藏状态 */
.ui-hidden .ui-element {
  opacity: 0 !important;
  transform: translateY(-20px) !important;
  pointer-events: none !important;
  transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1),
  transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) !important;
}

/* 摄像头预览的特殊变换 */
.ui-hidden .video-wrapper {
  transform: scaleX(-1) translateY(20px) !important;
}

/* 特殊处理 lil-gui */
.ui-hidden ::v-deep(.lil-gui) {
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .status-panel {
    left: 20px;
    top: 20px;
    right: 20px;
    width: auto;
    padding: 20px;
  }

  .video-wrapper {
    bottom: 20px;
    right: 20px;
    width: 160px;
    height: 120px;
  }

  .toggle-ui-btn {
    top: 20px;
    right: 20px;
  }
}
</style>
