<template>
	<div class="login-container">
	  <div class="login-box">
		<div class="login-header">
		  <h2>用户登录</h2>
		  <p>欢迎回来，请登录您的账号</p>
		</div>
		
		<form class="login-form" @submit.prevent="handleLogin">
		  <div class="form-group">
			<label for="username">用户名</label>
			<div class="input-with-icon">
			  <i class="fas fa-user"></i>
			  <input 
				type="text" 
				id="username" 
				v-model="loginForm.username"
				placeholder="请输入用户名"
				required
			  >
			</div>
		  </div>
  
		  <div class="form-group">
			<label for="password">密码</label>
			<div class="input-with-icon">
			  <i class="fas fa-lock"></i>
			  <input 
				type="password" 
				id="password" 
				v-model="loginForm.password"
				placeholder="请输入密码"
				required
			  >
			</div>
		  </div>
  
		  <div class="form-options">
			<label class="remember-me">
			  <input type="checkbox" v-model="loginForm.remember">
			  <span>记住我</span>
			</label>
			<a href="#" class="forgot-password">忘记密码？</a>
		  </div>
  
		  <button type="submit" class="login-btn">登录</button>
  
		  <div class="register-link">
			还没有账号？ <a @click="goToRegister">立即注册</a>
		  </div>
		</form>
	  </div>
	</div>
  </template>
  
  <script>
  export default {
	name: 'Login',
	data() {
	  return {
		loginForm: {
		  username: '',
		  password: '',
		  remember: false
		}
	  }
	},
	methods: {
	  handleLogin() {
		// 处理登录逻辑
		console.log('登录表单提交', this.loginForm)
	  },
	  goToRegister() {
		this.$router.push('/register')
	  }
	}
  }
  </script>
  
  <style scoped>
  .login-container {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	padding: 20px;
  }
  
  .login-box {
	background: white;
	border-radius: 10px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	padding: 40px;
	width: 100%;
	max-width: 400px;
  }
  
  .login-header {
	text-align: center;
	margin-bottom: 30px;
  }
  
  .login-header h2 {
	color: #333;
	margin-bottom: 10px;
  }
  
  .login-header p {
	color: #666;
	font-size: 0.9rem;
  }
  
  .form-group {
	margin-bottom: 20px;
  }
  
  .form-group label {
	display: block;
	margin-bottom: 8px;
	color: #333;
	font-size: 0.9rem;
  }
  
  .input-with-icon {
	position: relative;
  }
  
  .input-with-icon i {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: #666;
  }
  
  .input-with-icon input {
	width: 100%;
	padding: 12px 12px 12px 40px;
	border: 1px solid #ddd;
	border-radius: 5px;
	font-size: 1rem;
	transition: border-color 0.3s;
  }
  
  .input-with-icon input:focus {
	border-color: #4CAF50;
	outline: none;
  }
  
  .form-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
  }
  
  .remember-me {
	display: flex;
	align-items: center;
	gap: 8px;
	color: #666;
	font-size: 0.9rem;
  }
  
  .forgot-password {
	color: #4CAF50;
	text-decoration: none;
	font-size: 0.9rem;
  }
  
  .login-btn {
	width: 100%;
	padding: 12px;
	background: #4CAF50;
	color: white;
	border: none;
	border-radius: 5px;
	font-size: 1rem;
	cursor: pointer;
	transition: background-color 0.3s;
  }
  
  .login-btn:hover {
	background: #45a049;
  }
  
  .register-link {
	text-align: center;
	margin-top: 20px;
	color: #666;
	font-size: 0.9rem;
  }
  
  .register-link a {
	color: #4CAF50;
	text-decoration: none;
	cursor: pointer;
  }
  
  .register-link a:hover {
	text-decoration: underline;
  }
  </style>