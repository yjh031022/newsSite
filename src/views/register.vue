<template>
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <h2>用户注册</h2>
          <p>创建您的账号，开启个性化新闻之旅</p>
        </div>
        
        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="account">账号</label>
            <div class="input-with-icon">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                id="account" 
                v-model="registerForm.account"
                placeholder="请设置账号"
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
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="registerForm.agreement"
                required
              >
              <span>我已阅读并同意服务条款和隐私政策</span>
            </label>
          </div>
  
          <button type="submit" class="register-btn">注册</button>
  
          <div class="login-link">
            已有账号？<a href="/login">立即登录</a>
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
          account: '',
          password: '',
          confirmPassword: '',
          agreement: false
        }
      }
    },
    methods: {
      handleRegister() {
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          alert('两次输入的密码不一致');
          return;
        }
        console.log('注册表单提交', this.registerForm);
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
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }
  
  .register-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .register-header h2 {
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .register-header p {
    color: #666;
    font-size: 16px;
  }
  
  .form-group {
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .form-group label {
    min-width: 70px;
    text-align: right;
    color: #333;
    font-size: 14px;
    font-weight: 500;
  }
  
  .input-with-icon {
    position: relative;
    flex: 1;
    max-width: 240px;
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
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  .input-with-icon input:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
  
  .form-agreement {
    margin-left: 80px;
    margin-bottom: 25px;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  .register-btn {
    margin-left: 80px;
    width: calc(100% - 80px);
    padding: 12px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .register-btn:hover {
    background: #45a049;
  }
  
  .login-link {
    margin-left: 80px;
    margin-top: 20px;
    color: #666;
    font-size: 14px;
    text-align: center;
  }
  
  .login-link a {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
  }
  
  .login-link a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 576px) {
    .register-box {
      padding: 30px 20px;
      margin: 0 15px;
    }
  
    .input-with-icon {
      max-width: 100%;
    }
  
    .form-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  
    .form-group label {
      min-width: auto;
      text-align: left;
    }
  
    .form-agreement,
    .register-btn,
    .login-link {
      margin-left: 0;
    }
  
    .register-btn {
      width: 100%;
    }
  }
  </style>