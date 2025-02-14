<template>
	<div class="login-page">
		<div class="background-animation">
			<div v-for="i in 50" 
				 :key="i" 
				 class="dot"
				 :style="{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }">
			</div>
		</div>

		<div class="login-container">
			<h1 class="login-title">登录</h1>
			<div class="input-group">
				<input 
					type="text" 
					v-model="formData.username" 
					placeholder="请输入用户名"
				>
			</div>
			<div class="input-group">
				<input 
					type="password" 
					v-model="formData.password" 
					placeholder="请输入密码"
				>
			</div>
			<div class="input-group captcha-group">
				<input 
					type="text" 
					v-model="formData.captcha" 
					placeholder="请输入验证码" 
					class="captcha-input"
				>
				<div class="captcha-image" @click="refreshCaptcha">{{ captchaText }}</div>
			</div>
			<button class="login-btn" @click="handleLogin">立即登录</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Login',
	data() {
		return {
			formData: {
				username: '',
				password: '',
				captcha: ''
			},
			captchaText: 'tC83'
		}
	},
	methods: {
		handleLogin() {
			// 验证表单
			if (!this.formData.username) {
				this.$message.error('请输入用户名')
				return
			}
			if (!this.formData.password) {
				this.$message.error('请输入密码')
				return
			}
			if (!this.formData.captcha) {
				this.$message.error('请输入验证码')
				return
			}

			// 这里添加登录逻辑
			console.log('登录信息：', this.formData)
		},
		refreshCaptcha() {
			// 这里添加刷新验证码的逻辑
			this.captchaText = Math.random().toString(36).substr(2, 4)
		}
	}
}
</script>

<style scoped>
.login-page {
	margin: 0;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: linear-gradient(45deg, #006994, #00a6c4);
	font-family: "Microsoft YaHei", sans-serif;
}

.login-container {
	background: rgba(255, 255, 255, 0.1);
	padding: 40px;
	border-radius: 10px;
	backdrop-filter: blur(10px);
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	width: 320px;
	position: relative;
	z-index: 1;
}

.login-title {
	color: white;
	text-align: center;
	font-size: 24px;
	margin-bottom: 30px;
}

.input-group {
	margin-bottom: 20px;
}

input {
	width: 100%;
	padding: 12px;
	border: none;
	border-radius: 5px;
	background: rgba(255, 255, 255, 0.9);
	margin-bottom: 10px;
	box-sizing: border-box;
	font-size: 14px;
}

.captcha-group {
	display: flex;
	gap: 10px;
}

.captcha-input {
	flex: 1;
}

.captcha-image {
	width: 100px;
	height: 40px;
	background: white;
	border-radius: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-size: 16px;
	user-select: none;
}

.login-btn {
	width: 100%;
	padding: 12px;
	border: none;
	border-radius: 5px;
	background: #0088cc;
	color: white;
	font-size: 16px;
	cursor: pointer;
	transition: background 0.3s;
}

.login-btn:hover {
	background: #006699;
}

.background-animation {
	position: fixed;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
}

.dot {
	position: absolute;
	width: 2px;
	height: 10px;
	background: rgba(255, 255, 255, 0.2);
	animation: fall 3s linear infinite;
}

@keyframes fall {
	0% {
		transform: translateY(-100%);
		opacity: 0;
	}
	50% {
		opacity: 1;
	}
	100% {
		transform: translateY(100vh);
		opacity: 0;
	}
}
</style>