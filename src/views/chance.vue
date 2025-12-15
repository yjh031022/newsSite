<template>
  <div id="christmas-app" :class="bgClass">
    <!-- 主标题 -->
    <h1 id="main-title">Merry Christmas</h1>

    <!-- 启动页 -->
    <div v-if="showStartScreen" id="start-screen">
      <h1 style="font-family: 'Great Vibes'; font-size: 4rem; color: #ffd700; margin: 0;">Winter Magic</h1>
      <div style="margin-top:20px; text-align:center; color:#aaa; font-size:16px; line-height:1.8;">
        ⬅️ <strong>左手</strong>：张开手掌控制爆炸<br>
        ➡️ <strong>右手</strong>：双指捏合提取照片
      </div>
      <button id="btn-start" @click="startApp">开启魔法 ✨</button>
    </div>

    <!-- 照片弹窗 -->
    <div id="photo-modal" :class="{ active: photoActive }">
      <img id="modal-img" :src="currentPhoto" alt="Memory" />
      <div id="photo-caption">Sweet Memory</div>
    </div>

    <!-- 控制按钮 -->
    <button id="toggle-btn" @click="togglePanel">⚙️</button>
    <video ref="inputVideo" id="input_video" :class="{ 'hidden-cam': !showCamera }"></video>

    <!-- 控制面板 -->
    <div id="ui-panel" :class="{ hidden: !showPanel }">
      <h3>🎄 控制面板</h3>
      <div class="control-group">
        <button class="btn" @click="toggleFullscreen">{{ fullscreen ? '❌ 退出全屏' : '⛶ 进入全屏' }}</button>
      </div>
      <div class="control-group">
        <button class="btn" @click="toggleCamera">📹 {{ showCamera ? '隐藏' : '显示' }} 摄像头</button>
      </div>
      <div class="control-group">
        <label>场景风格</label>
        <select v-model="bgStyle" @change="updateBg">
          <option value="black">🌌 纯黑 (Black)</option>
          <option value="deep">🌃 深邃 (Deep Blue)</option>
          <option value="warm">🔥 暖冬 (Warm)</option>
          <option value="aurora">❄️ 极光 (Aurora)</option>
        </select>
      </div>
      <div class="control-group">
        <label>背景音乐</label>
        <button class="btn" @click="$refs.musicInput.click()">📁 换音乐 (MP3)</button>
        <input type="file" ref="musicInput" accept="audio/*" @change="onMusicChange" style="display:none;" />
        <div style="display:flex; gap:10px; margin-top:5px;">
          <button class="btn" style="width:40px;" @click="togglePlayPause">{{ isPlaying ? '⏸' : '▶' }}</button>
          <input type="range" v-model.number="volume" min="0" max="1" step="0.1" />
        </div>
      </div>
      <div class="control-group">
        <label>照片管理</label>
        <button
            class="btn"
            style="background:linear-gradient(90deg, #00b894, #00cec9); color:black; font-weight:bold;"
            @click="$refs.folderInput.click()"
        >
          📷 导入照片 (多选)
        </button>
        <input type="file" ref="folderInput" multiple accept="image/*" @change="onPhotoUpload" style="display:none;" />
      </div>
      <div class="control-group">
        <label>旋转速度 <span>{{ rotationSpeed.toFixed(3) }}</span></label>
        <input type="range" v-model.number="rotationSpeed" min="0" max="0.02" step="0.001" />
      </div>
      <div class="control-group">
        <label>树的高度</label>
        <input type="range" v-model.number="treeHeight" min="40" max="100" step="5" @input="rebuildTree" />
      </div>
      <div class="control-group">
        <label>音乐律动</label>
        <input type="range" v-model.number="beatSense" min="0.1" max="3.0" step="0.1" />
      </div>
      <div style="font-size:10px; color:#666; text-align:center; margin-top:15px;">
        自动识别：左手控树 / 右手控图
      </div>
    </div>

    <!-- 状态栏 -->
    <div id="status-bar">{{ statusText }}</div>
  </div>
</template>

<script>
import * as THREE from 'three'

export default {
  name: 'ChristmasMagic',
  data() {
    return {
      // UI 状态
      showStartScreen: true,
      bgStyle: 'black',
      showPanel: true,
      showCamera: false,
      fullscreen: false,
      volume: 0.6,
      rotationSpeed: 0.002,
      treeHeight: 70,
      beatSense: 1.0,
      photoActive: false,
      currentPhoto: '',
      statusText: '系统初始化中...',
      isPlaying: false,

      // Three.js & MediaPipe
      scene: null,
      camera: null,
      renderer: null,
      clock: null,
      particleSystem: null,
      treeGroup: null,
      starMesh: null,
      photoMeshes: [],
      loadedImages: [],
      audioCtx: null,
      analyser: null,
      dataArray: null,
      audioEl: null,
      hands: null,
      cameraUtils: null,

      uniforms: null,
      explosion: 0,
      targetExplosion: 0,

      vertexShader: `
precision highp float;

attribute vec3 position;
attribute vec3 spherePos;
attribute vec3 customColor;
attribute float size;
attribute float type;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uExplosion;
uniform float uBeat;

varying vec3 vColor;
varying float vType;

void main() {
    vColor = customColor;
    vType = type;
    float t = uExplosion;
    float ease = 1.0 - pow(1.0 - t, 3.0);
    vec3 finalPos = mix(position, spherePos, ease);
    float beatScale = 1.0;
    if (t < 0.2) beatScale += uBeat * 0.15 * (1.0 - t * 3.0);
    if (type > 0.5) beatScale += uBeat * 0.2;
    vec4 mvPosition = modelViewMatrix * vec4(finalPos * beatScale, 1.0);
    float s = size;
    if(type > 0.5) s *= (1.0 + uBeat * 0.5);
    gl_PointSize = s * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`,
      fragmentShader: `
precision mediump float;

uniform float uTime;
uniform float uBeat;
varying vec3 vColor;
varying float vType;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (length(coord) > 0.5) discard;
    vec3 color = vColor;
    float alpha = 1.0;
    if (vType > 0.5) {
        float flash = 0.5 + 0.5 * sin(uTime * 5.0 + vType * 10.0);
        color += vec3(0.5) * flash * uBeat * 2.0;
    } else {
        alpha = 0.8;
    }
    gl_FragColor = vec4(color, alpha);
}
`
    }
  },
  computed: {
    bgClass() {
      return `bg-${this.bgStyle}`
    }
  },
  mounted() {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  },
  beforeDestroy() {
    if (this.renderer) this.renderer.dispose()
    if (this.cameraUtils && typeof this.cameraUtils.stop === 'function') this.cameraUtils.stop()
    if (this.audioEl) this.audioEl.pause()
    if (this.hands && typeof this.hands.close === 'function') this.hands.close()
  },
  methods: {
    startApp() {
      this.showStartScreen = false
      this.$nextTick(() => {
        document.getElementById('main-title').style.opacity = '1'
      })
      this.showCamera = true
      this.initAudio()
      this.initThree()
      this.startHandTracking()
    },

    initAudio() {
      this.audioEl = new Audio()
      this.audioEl.crossOrigin = 'anonymous'
      this.audioEl.src =
          'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5c3a3f4d9e.mp3?filename=christmas-music-box-128249.mp3'
      this.audioEl.loop = true
      this.audioEl.volume = this.volume

      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioCtx = new AudioContext()
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 256
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

      const source = this.audioCtx.createMediaElementSource(this.audioEl)
      source.connect(this.analyser)
      this.analyser.connect(this.audioCtx.destination)

      this.audioEl
          .play()
          .then(() => {
            this.isPlaying = true
          })
          .catch((e) => console.warn('Auto-play blocked:', e))
    },

    initThree() {
      this.clock = new THREE.Clock()
      this.scene = new THREE.Scene()
      this.scene.fog = new THREE.FogExp2(0x000000, 0.004)

      this.camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
      )
      this.camera.position.set(0, 30, 90)
      this.camera.lookAt(0, 30, 0)

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(window.devicePixelRatio)

      const appContainer = document.getElementById('christmas-app')
      if (appContainer) {
        appContainer.appendChild(this.renderer.domElement)
      } else {
        document.body.appendChild(this.renderer.domElement)
      }

      this.treeGroup = new THREE.Group()
      this.scene.add(this.treeGroup)

      this.createParticles()
      this.createStar()
      this.createSnow()
      this.animate()

      window.addEventListener('resize', this.onWindowResize)
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    createParticles() {
      if (this.particleSystem) {
        this.treeGroup.remove(this.particleSystem)
        this.particleSystem.geometry.dispose()
      }

      const count = 18000
      const geo = new THREE.BufferGeometry()
      const positions = []
      const spherePos = []
      const colors = []
      const sizes = []
      const types = []
      const h = this.treeHeight
      const colorHelper = new THREE.Color()

      for (let i = 0; i < count; i++) {
        const y = (i / count) * h
        const rBase = (1 - y / h) * (h * 0.4)
        const angle = i * 0.2
        const r = rBase * Math.sqrt(Math.random())
        positions.push(Math.cos(angle) * r, y - 10, Math.sin(angle) * r)

        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
        v.multiplyScalar(40 + Math.random() * 50)
        v.y += 20
        spherePos.push(v.x, v.y, v.z)

        const rnd = Math.random()
        if (rnd > 0.96) {
          types.push(2)
          sizes.push(4)
          colorHelper.setHex(0xffaa00)
        } else if (rnd > 0.92) {
          types.push(1)
          sizes.push(3)
          colorHelper.setHex(Math.random() > 0.5 ? 0xff0000 : 0x00aaff)
        } else {
          types.push(0)
          sizes.push(1.5)
          colorHelper.setHex(0x228b22)
        }

        colors.push(colorHelper.r, colorHelper.g, colorHelper.b)
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setAttribute('spherePos', new THREE.Float32BufferAttribute(spherePos, 3))
      geo.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3))
      geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
      geo.setAttribute('type', new THREE.Float32BufferAttribute(types, 1))

      this.uniforms = {
        uTime: { value: 0 },
        uExplosion: { value: 0 },
        uBeat: { value: 0 }
      }

      const mat = new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
      })

      this.particleSystem = new THREE.Points(geo, mat)
      this.treeGroup.add(this.particleSystem)
    },

    updatePhotos() {
      this.photoMeshes.forEach((m) => this.treeGroup.remove(m))
      this.photoMeshes = []
      if (this.loadedImages.length === 0) return

      this.loadedImages.forEach((img) => {
        const cvs = document.createElement('canvas')
        cvs.width = 256
        cvs.height = 256
        const ctx = cvs.getContext('2d')
        ctx.beginPath()
        ctx.arc(128, 128, 120, 0, Math.PI * 2)
        ctx.clip()
        const asp = img.width / img.height
        if (asp > 1) {
          ctx.drawImage(img, (img.width - img.height) / 2, 0, img.height, img.height, 0, 0, 256, 256)
        } else {
          ctx.drawImage(img, 0, (img.height - img.width) / 2, img.width, img.width, 0, 0, 256, 256)
        }
        ctx.lineWidth = 10
        ctx.strokeStyle = '#fff'
        ctx.stroke()

        const tex = new THREE.CanvasTexture(cvs)
        const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true })
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), mat)

        const y = Math.random() * (this.treeHeight * 0.8)
        const r = (1 - y / this.treeHeight) * (this.treeHeight * 0.4) + 2
        const a = Math.random() * Math.PI * 2
        const origin = new THREE.Vector3(Math.cos(a) * r, y - 10, Math.sin(a) * r)
        const explodeDir = origin.clone().normalize().multiplyScalar(40 + Math.random() * 30)
        explodeDir.y += 20

        mesh.position.copy(origin)
        mesh.userData = { origin, explodePos: explodeDir, imgSrc: img.src }
        this.treeGroup.add(mesh)
        this.photoMeshes.push(mesh)
      })

      alert(`已挂载 ${this.loadedImages.length} 张照片`)
    },

    animate() {
      requestAnimationFrame(this.animate)
      const t = this.clock.getElapsedTime()
      let beat = 0
      if (this.analyser) {
        this.analyser.getByteFrequencyData(this.dataArray)
        let sum = 0
        for (let i = 0; i < 15; i++) sum += this.dataArray[i]
        beat = (sum / 15 / 255) * this.beatSense
      }

      if (this.uniforms) {
        this.uniforms.uTime.value = t
        this.uniforms.uBeat.value = beat
        this.explosion += (this.targetExplosion - this.explosion) * 0.05
        this.uniforms.uExplosion.value = this.explosion
      }

      const ease = 1.0 - Math.pow(1.0 - this.explosion, 3.0)
      this.photoMeshes.forEach((p) => {
        p.position.lerpVectors(p.userData.origin, p.userData.explodePos, ease)
        p.lookAt(this.camera.position)
        p.rotation.z += 0.005 * (1 + this.explosion * 5)
      })

      this.treeGroup.rotation.y += this.rotationSpeed + this.explosion * 0.01

      if (this.starMesh) {
        this.starMesh.rotation.y -= 0.02
        const s = 1 + beat * 0.3
        this.starMesh.scale.set(s, s, s)
      }

      if (window.snowSystem) {
        const pos = window.snowSystem.geometry.attributes.position.array
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= 0.3
          if (pos[i] < -20) pos[i] = 100
        }
        window.snowSystem.geometry.attributes.position.needsUpdate = true
      }

      this.renderer.render(this.scene, this.camera)
    },

    createStar() {
      const s = new THREE.Shape()
      const p = 5
      for (let i = 0; i < p * 2; i++) {
        const r = i % 2 === 0 ? 4 : 2
        const a = (i / p) * Math.PI
        s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      const g = new THREE.ExtrudeGeometry(s, {
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.2
      })
      this.starMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffdd00 }))
      this.starMesh.position.y = this.treeHeight
      this.treeGroup.add(this.starMesh)
    },

    createSnow() {
      const g = new THREE.BufferGeometry()
      const pos = []
      for (let i = 0; i < 1000; i++) {
        pos.push((Math.random() - 0.5) * 200, Math.random() * 150, (Math.random() - 0.5) * 200)
      }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      window.snowSystem = new THREE.Points(
          g,
          new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.6 })
      )
      this.scene.add(window.snowSystem)
    },

    rebuildTree() {
      this.createParticles()
      if (this.starMesh) this.starMesh.position.y = this.treeHeight
    },

    // ✅ 关键修改：使用全局 Hands 和 Camera（由 CDN 注入）
    startHandTracking() {
      // 安全检查
      if (typeof window.Hands === 'undefined' || typeof window.Camera === 'undefined') {
        console.error('MediaPipe scripts not loaded! Please add them in public/index.html')
        this.statusText = '⚠️ MediaPipe 未加载'
        return
      }

      const video = this.$refs.inputVideo

      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      })

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      this.hands.onResults((results) => {
        let statusText = ''
        let leftFound = false

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (let i = 0; i < results.multiHandedness.length; i++) {
            const label = results.multiHandedness[i].label
            const lm = results.multiHandLandmarks[i]

            if (label === 'Left') {
              leftFound = true
              const d = Math.hypot(lm[4].x - lm[20].x, lm[4].y - lm[20].y)
              this.targetExplosion = Math.min(Math.max((d - 0.15) * 4, 0), 1)
              statusText += `🖐️ 左手: ${this.targetExplosion > 0.5 ? '爆炸' : '还原'}  `
            }

            if (label === 'Right') {
              const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y)
              if (pinchDist < 0.05) {
                if (!this.photoActive) {
                  this.showRandomPhoto()
                  this.photoActive = true
                }
                statusText += `| 👌 右手: 捏合提取 `
              } else if (pinchDist > 0.08) {
                if (this.photoActive) {
                  document.getElementById('photo-modal').classList.remove('active')
                  this.photoActive = false
                }
                statusText += `| ✋ 右手: 松开 `
              } else {
                statusText += `| ✋ 右手: 就绪 `
              }
            }
          }
        } else {
          statusText = '👀 等待双手...'
        }

        if (!leftFound) this.targetExplosion = 0
        this.statusText = statusText
      })

      this.cameraUtils = new window.Camera(video, {
        onFrame: async () => {
          await this.hands.send({ image: video })
        },
        width: 320,
        height: 240
      })
      this.cameraUtils.start()
    },

    showRandomPhoto() {
      if (this.loadedImages.length === 0) return
      const img = this.loadedImages[Math.floor(Math.random() * this.loadedImages.length)]
      this.currentPhoto = img.src
      this.photoActive = true
    },

    togglePanel() {
      this.showPanel = !this.showPanel
    },
    toggleCamera() {
      this.showCamera = !this.showCamera
    },
    updateBg() {},
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        this.fullscreen = true
      } else {
        document.exitFullscreen()
        this.fullscreen = false
      }
    },
    togglePlayPause() {
      if (this.audioEl.paused) {
        this.audioEl.play()
        this.isPlaying = true
      } else {
        this.audioEl.pause()
        this.isPlaying = false
      }
    },
    onMusicChange(e) {
      if (e.target.files[0]) {
        this.audioEl.src = URL.createObjectURL(e.target.files[0])
        this.audioEl.play()
        this.isPlaying = true
      }
    },
    onPhotoUpload(e) {
      const files = Array.from(e.target.files)
      this.loadedImages = []
      let loadedCount = 0
      const limit = Math.min(files.length, 30)
      files.slice(0, limit).forEach((f) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const img = new Image()
          img.onload = () => {
            this.loadedImages.push(img)
            loadedCount++
            if (loadedCount === limit) {
              this.updatePhotos()
            }
          }
          img.src = ev.target.result
        }
        reader.readAsDataURL(f)
      })
    }
  }
}
</script>

<style scoped>
#christmas-app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  transition: background 1s ease;
  z-index: 0;
}

/* ✅ 关键：Three.js canvas 作为底层背景 */
#christmas-app > canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
}

#christmas-app.bg-black {
  background: #000;
}
#christmas-app.bg-deep {
  background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
}
#christmas-app.bg-warm {
  background: radial-gradient(circle at center, #2e1a1a 0%, #0f0505 100%);
}
#christmas-app.bg-aurora {
  background: radial-gradient(circle at top, #0f2027 0%, #203a43 50%, #2c5364 100%);
}

#main-title {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  font-family: 'Great Vibes', cursive;
  font-size: 5rem;
  z-index: 50;
  pointer-events: none;
  opacity: 0;
  transition: opacity 2s;
  background: linear-gradient(to bottom, #ffd700, #ffec8b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

#start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}
#btn-start {
  padding: 15px 50px;
  font-size: 20px;
  background: linear-gradient(90deg, #ffd700, #ffaa00);
  border: none;
  border-radius: 30px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  margin-top: 30px;
  transition: transform 0.2s;
}
#btn-start:hover {
  transform: scale(1.05);
}

#photo-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  max-width: 80%;
  max-height: 80%;
  background: #fff;
  padding: 10px 10px 40px 10px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
  z-index: 150;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 4px;
}
#photo-modal.active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1) rotate(-3deg);
}
#photo-modal img {
  max-width: 100%;
  max-height: 60vh;
  display: block;
}
#photo-caption {
  text-align: center;
  color: #333;
  font-family: 'Great Vibes', cursive;
  font-size: 2rem;
  margin-top: 5px;
}

#status-bar {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-shadow: 0 2px 4px #000;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 0;
  z-index: 95;
}

#ui-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 280px;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(15px);
  padding: 20px;
  border-radius: 12px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
#ui-panel.hidden {
  transform: translateX(130%);
}

.control-group {
  margin-bottom: 10px;
}
.control-group label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #ccc;
  margin-bottom: 4px;
}
input[type='range'] {
  width: 100%;
  accent-color: #ffd700;
  cursor: pointer;
}
.btn {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 5px;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
select {
  width: 100%;
  padding: 6px;
  background: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

#toggle-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

#input_video {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  transform: scaleX(-1);
  z-index: 90;
  object-fit: cover;
  transition: opacity 0.5s ease;
}
#input_video.hidden-cam {
  opacity: 0;
  pointer-events: none;
}
</style>
