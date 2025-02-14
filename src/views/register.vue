<template>
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <h2>用户注册</h2>
          <p>创建您的账号，开启个性化新闻之旅</p>
        </div>
        
        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">用户名</label>
            <div class="input-with-icon">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                id="username" 
                v-model="registerForm.username"
                placeholder="请设置用户名"
                required
              >
            </div>
          </div>
  
          <div class="form-group">
            <label for="email">邮箱</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                v-model="registerForm.email"
                placeholder="请输入邮箱"
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
                v-model="registerForm.password"
                placeholder="请设置密码"
                required
              >
            </div>
          </div>
  
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="registerForm.confirmPassword"
                placeholder="请再次输入密码"
                required
              >
            </div>
          </div>
  
          <div class="form-agreement">
            <label class="agreement-checkbox">
              <input type="checkbox" v-model="registerForm.agreement" required>
              <span>我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a></span>
            </label>
          </div>
  
          <button type="submit" class="register-btn">注册</button>
  
          <div class="login-link">
            已有账号？ <a @click="goToLogin">立即登录</a>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Register',
    data() {
      return {
        registerForm: {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreement: false
        }
      }
    },
    methods: {
      handleRegister() {
        // 处理注册逻辑
        console.log('注册表单提交', this.registerForm)
      },
      goToLogin() {
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  <style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
  }
  
  .register-box {
    background: white;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }
  
  .register-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .register-header h2 {
    color: #333;
    margin-bottom: 10px;
  }
  
  .register-header p {
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
  
  .form-agreement {
    margin-bottom: 20px;
  }
  
  .agreement-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #666;
    font-size: 0.9rem;
  }
  
  .agreement-checkbox a {
    color: #4CAF50;
    text-decoration: none;
  }
  
  .agreement-checkbox a:hover {
    text-decoration: underline;
  }
  
  .register-btn {
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
  
  .register-btn:hover {
    background: #45a049;
  }
  
  .login-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 0.9rem;
  }
  
  .login-link a {
    color: #4CAF50;
    text-decoration: none;
    cursor: pointer;
  }
  
  .login-link a:hover {
    text-decoration: underline;
  }
  </style>