<template>
  <div class="profile-container">
    <!-- 左侧导航栏 -->
    <aside class="profile-nav">
      <div class="nav-header">
        <div class="avatar-container">
          <img :src="userInfo.avatar || 'https://picsum.photos/200'" alt="用户头像" class="avatar">
          <div class="avatar-overlay">
            <span class="username">{{ userInfo.nickname || '用户昵称' }}</span>
          </div>
        </div>
      </div>
      <nav class="nav-menu">
        <div class="nav-item" 
             :class="{ active: currentView === 'profile' }"
             @click="currentView = 'profile'">
          <i class="fas fa-user"></i>
          <span>个人资料</span>
        </div>
        <div class="nav-item" 
             :class="{ active: currentView === 'settings' }"
             @click="currentView = 'settings'">
          <i class="fas fa-cog"></i>
          <span>修改资料</span>
        </div>
      </nav>
    </aside>

    <!-- 右侧内容区 -->
    <main class="profile-content">
      <transition name="fade" mode="out-in">
        <!-- 个人资料展示 -->
        <div v-if="currentView === 'profile'" class="profile-overview">
          <section class="info-section">
            <h2 class="section-title">个人资料</h2>
            <div class="info-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>用户ID</label>
                  <span>{{ userInfo.userId }}</span>
                </div>
                <div class="info-item">
                  <label>用户名</label>
                  <span>{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <label>昵称</label>
                  <span>{{ userInfo.nickname }}</span>
                </div>
                <div class="info-item">
                  <label>性别</label>
                  <span>{{ formatGender(userInfo.gender) }}</span>
                </div>
                <div class="info-item">
                  <label>生日</label>
                  <span>{{ userInfo.birthday || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>邮箱</label>
                  <span>{{ userInfo.email || '未设置' }}</span>
                </div>
                <div class="info-item full">
                  <label>个人简介</label>
                  <p class="bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 个人设置 -->
        <div v-else class="settings-view">
          <section class="settings-section">
            <h2 class="section-title">修改个人资料</h2>
            <form class="settings-form" @submit.prevent="saveProfile">
              <div class="form-section">
                <div class="avatar-upload">
                  <div class="avatar-preview">
                    <img :src="userInfo.avatar || 'https://picsum.photos/200'" alt="头像">
                    <div class="avatar-overlay">
                      <i class="fas fa-camera"></i>
                    </div>
                  </div>
                  <button type="button" class="upload-btn" @click="triggerAvatarUpload">
                    更换头像
                  </button>
                  <input type="file" ref="avatarInput" hidden @change="handleAvatarChange" accept="image/*">
                </div>
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label>登录用户名</label>
                  <input type="text" v-model="userInfo.username" placeholder="请输入登录用户名">
                </div>
                <div class="form-field">
                  <label>昵称</label>
                  <input type="text" v-model="userInfo.nickname" placeholder="请输入昵称">
                </div>
                <div class="form-field">
                  <label>性别</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="userInfo.gender" value="male">
                      <span>男</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="userInfo.gender" value="female">
                      <span>女</span>
                    </label>
                  </div>
                </div>
                <div class="form-field">
                  <label>生日</label>
                  <input type="date" v-model="userInfo.birthday">
                </div>
                <div class="form-field">
                  <label>邮箱</label>
                  <input type="email" v-model="userInfo.email" placeholder="请输入邮箱">
                </div>
                <div class="form-field full">
                  <label>个人简介</label>
                  <textarea v-model="userInfo.bio" placeholder="介绍一下自己吧..."></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="submit-btn">
                  <i class="fas fa-save"></i>
                  保存修改
                </button>
              </div>
            </form>
          </section>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
  data() {
    return {
      currentView: 'profile',
      userInfo: {
        avatar: '',
        nickname: '示例用户',
        userId: 'USER_001',
        username: '',
        gender: 'male',
        birthday: '',
        email: '',
        bio: '这是一个示例简介...'
      },
      userStats: {
        likes: 128,
        follows: 56,
        followers: 89
      },
      recentActivities: [
        {
          icon: 'fas fa-heart',
          content: '点赞了文章《XXXX》',
          time: '2小时前'
        },
        {
          icon: 'fas fa-comment',
          content: '评论了文章《YYYY》',
          time: '3小时前'
        },
        {
          icon: 'fas fa-star',
          content: '收藏了文章《ZZZZ》',
          time: '1天前'
        }
      ]
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const loginUsername = localStorage.getItem('username')
      if (loginUsername) {
        this.userInfo.username = loginUsername
      }
    },
    formatGender(gender) {
      const genderMap = {
        male: '男',
        female: '女',
        other: '其他'
      }
      return genderMap[gender] || '未设置'
    },
    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.userInfo.avatar = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    saveProfile() {
      console.log('保存的用户信息：', this.userInfo)
      alert('保存成功！')
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
}

/* 左侧导航样式优化 */
.profile-nav {
  width: 240px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  padding: 40px 0;
}

.nav-header {
  padding: 0 24px;
  text-align: center;
  margin-bottom: 40px;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 20px 10px 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
  transform: translateY(0);
}

.avatar-container:hover .avatar {
  transform: scale(1.1);
}

.username {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.nav-menu {
  padding: 0 20px;
}

.nav-item {
  padding: 14px 24px;
  margin: 8px 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4a5568;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #f7fafc;
  color: #2b6cb0;
  transform: translateX(5px);
}

.nav-item.active {
  background: linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
}

/* 右侧内容区样式优化 */
.profile-content {
  flex: 1;
  margin-left: 240px;
  padding: 40px;
}

/* 信息展示样式 */
.info-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, #2b6cb0, #4299e1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.info-item span,
.info-item p {
  color: #2d3748;
  font-size: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  min-height: 45px;
  display: flex;
  align-items: center;
}

.info-item p.bio {
  min-height: 100px;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 表单样式优化 */
.settings-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview .avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  color: white;
  font-size: 24px;
}

.upload-btn {
  padding: 10px 20px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.upload-btn:hover {
  background: #4299e1;
  transform: translateY(-2px);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.form-field input,
.form-field textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #2b6cb0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
  outline: none;
  background: white;
}

.form-field textarea {
  height: 120px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 24px;
  padding: 8px 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-label:hover {
  background: #f8fafc;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .profile-nav {
    width: 200px;
  }

  .profile-content {
    margin-left: 200px;
    padding: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-nav {
    width: 100%;
    height: auto;
    position: static;
    padding: 20px;
  }

  .profile-content {
    margin-left: 0;
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
