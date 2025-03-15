<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="userInfo.avatar || 'https://picsum.photos/200'" alt="用户头像" class="avatar">
            <div class="avatar-edit" @click="triggerAvatarUpload">
              <i class="fas fa-camera"></i>
            </div>
            <input type="file" ref="avatarInput" style="display: none" @change="handleAvatarChange" accept="image/*">
          </div>
          <h2 class="username">{{ userInfo.nickname || '设置昵称' }}</h2>
          <p class="user-id">ID: {{ userInfo.userId || 'USER_001' }}</p>
        </div>
      </div>

      <!-- 个人信息表单 -->
      <div class="profile-form">
        <h3 class="section-title">
          <i class="fas fa-user-edit"></i>
          个人资料
        </h3>
        
        <div class="form-group">
          <label>昵称</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input type="text" v-model="userInfo.nickname" placeholder="设置昵称">
          </div>
        </div>

        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <i class="fas fa-id-card"></i>
            <input type="text" v-model="userInfo.username" placeholder="设置用户名">
          </div>
        </div>

        <div class="form-group">
          <label>性别</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="userInfo.gender" value="male">
              <i class="fas fa-mars"></i> 男
            </label>
            <label class="radio-label">
              <input type="radio" v-model="userInfo.gender" value="female">
              <i class="fas fa-venus"></i> 女
            </label>
            <label class="radio-label">
              <input type="radio" v-model="userInfo.gender" value="other">
              <i class="fas fa-genderless"></i> 其他
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>生日</label>
          <div class="input-wrapper">
            <i class="fas fa-birthday-cake"></i>
            <input type="date" v-model="userInfo.birthday">
          </div>
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input type="email" v-model="userInfo.email" placeholder="设置邮箱">
          </div>
        </div>

        <div class="form-group">
          <label>个人简介</label>
          <div class="input-wrapper">
            <i class="fas fa-pen"></i>
            <textarea v-model="userInfo.bio" placeholder="介绍一下自己吧..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="save-btn" @click="saveProfile">
            <i class="fas fa-save"></i>
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
  data() {
    return {
      userInfo: {
        avatar: '',
        nickname: '',
        userId: 'USER_001',
        username: '',
        gender: '',
        birthday: '',
        email: '',
        bio: ''
      }
    }
  },
  methods: {
    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 这里可以添加头像上传逻辑
        const reader = new FileReader()
        reader.onload = (e) => {
          this.userInfo.avatar = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    saveProfile() {
      // 这里添加保存个人信息的逻辑
      console.log('保存的用户信息：', this.userInfo)
      // 显示保存成功提示
      alert('保存成功！')
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-header {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #2196F3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid white;
  transition: all 0.3s ease;
}

.avatar-edit:hover {
  background: #1976D2;
  transform: scale(1.1);
}

.username {
  font-size: 1.8rem;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-id {
  font-size: 0.9rem;
  opacity: 0.8;
}

.profile-form {
  padding: 30px;
}

.section-title {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #666;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 12px;
  color: #666;
}

.input-wrapper input,
.input-wrapper textarea {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-wrapper textarea {
  min-height: 100px;
  resize: vertical;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33,150,243,0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.radio-label:hover {
  background: #f5f5f5;
}

.radio-label input[type="radio"] {
  margin: 0;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

.save-btn {
  padding: 12px 40px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33,150,243,0.3);
}

.save-btn:hover {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33,150,243,0.4);
}

@media (max-width: 768px) {
  .profile-card {
    border-radius: 15px;
  }

  .profile-header {
    padding: 30px 15px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .username {
    font-size: 1.5rem;
  }

  .profile-form {
    padding: 20px;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
