<template>
  <div class="profile-container">
    <!-- 左侧导航栏 -->
    <aside class="profile-nav">
      <div class="nav-header">
        <div class="avatar-container">
          <img :src="userInfo.avatar || 'https://picsum.photos/200'" alt="用户头像" class="avatar">
        </div>
        <h3 class="nav-username">{{ userInfo.nickname || '用户昵称' }}</h3>
      </div>
      <nav class="nav-menu">
        <div class="nav-item" 
             :class="{ active: currentView === 'profile' }"
             @click="currentView = 'profile'">
          <i class="fas fa-user"></i>
          <span>我的主页</span>
        </div>
        <div class="nav-item" 
             :class="{ active: currentView === 'settings' }"
             @click="currentView = 'settings'">
          <i class="fas fa-cog"></i>
          <span>个人设置</span>
        </div>
      </nav>
    </aside>

    <!-- 右侧内容区 -->
    <main class="profile-content">
      <transition name="fade" mode="out-in">
        <!-- 我的主页 -->
        <div v-if="currentView === 'profile'" class="profile-overview">
          <!-- 数据概览 -->
          <section class="overview-section">
            <div class="stats-grid">
              <div class="stat-box">
                <i class="fas fa-heart"></i>
                <div class="stat-details">
                  <h4>{{ userStats.likes }}</h4>
                  <span>获赞</span>
                </div>
              </div>
              <div class="stat-box">
                <i class="fas fa-star"></i>
                <div class="stat-details">
                  <h4>{{ userStats.follows }}</h4>
                  <span>关注</span>
                </div>
              </div>
              <div class="stat-box">
                <i class="fas fa-users"></i>
                <div class="stat-details">
                  <h4>{{ userStats.followers }}</h4>
                  <span>粉丝</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 个人资料 -->
          <section class="info-section">
            <h2 class="section-title">个人资料</h2>
            <div class="info-content">
              <div class="info-row">
                <div class="info-col">
                  <label>用户ID</label>
                  <span>{{ userInfo.userId }}</span>
                </div>
                <div class="info-col">
                  <label>昵称</label>
                  <span>{{ userInfo.nickname }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-col">
                  <label>性别</label>
                  <span>{{ formatGender(userInfo.gender) }}</span>
                </div>
                <div class="info-col">
                  <label>生日</label>
                  <span>{{ userInfo.birthday || '未设置' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-col full">
                  <label>个人简介</label>
                  <p>{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 最近动态 -->
          <section class="activity-section">
            <h2 class="section-title">最近动态</h2>
            <div class="activity-list">
              <div v-for="(activity, index) in recentActivities" 
                   :key="index" 
                   class="activity-card">
                <i :class="activity.icon"></i>
                <div class="activity-details">
                  <p>{{ activity.content }}</p>
                  <time>{{ activity.time }}</time>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 个人设置 -->
        <div v-else class="settings-view">
          <section class="settings-section">
            <h2 class="section-title">个人资料设置</h2>
            <form class="settings-form" @submit.prevent="saveProfile">
              <!-- 头像设置 -->
              <div class="form-section">
                <div class="avatar-setting">
                  <img :src="userInfo.avatar || 'https://picsum.photos/200'" alt="头像">
                  <button type="button" class="upload-btn" @click="triggerAvatarUpload">
                    更换头像
                  </button>
                  <input type="file" ref="avatarInput" hidden @change="handleAvatarChange" accept="image/*">
                </div>
              </div>

              <!-- 基本信息 -->
              <div class="form-grid">
                <div class="form-field">
                  <label>昵称</label>
                  <input type="text" v-model="userInfo.nickname" placeholder="请输入昵称">
                </div>
                <div class="form-field">
                  <label>性别</label>
                  <div class="radio-options">
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
                <button type="submit" class="submit-btn">保存修改</button>
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
      currentView: 'profile', // 当前视图：profile/settings
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
  methods: {
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
      // 保存个人信息的逻辑
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
  background: #f8fafc;
}

/* 左侧导航样式优化 */
.profile-nav {
  width: 220px;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  padding: 32px 0;
}

.nav-header {
  padding: 0 24px;
  text-align: center;
}

.avatar-container {
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8f2ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-username {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 24px;
}

.nav-menu {
  padding: 0 16px;
}

.nav-item {
  padding: 12px 20px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4a5568;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #3182ce;
}

.nav-item.active {
  background: #3182ce;
  color: white;
}

/* 右侧内容区样式优化 */
.profile-content {
  flex: 1;
  margin-left: 220px;
  padding: 32px;
}

/* 数据概览样式 */
.overview-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-box i {
  font-size: 24px;
  color: #3182ce;
}

.stat-details h4 {
  font-size: 24px;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.stat-details span {
  font-size: 14px;
  color: #666;
}

/* 信息区域样式 */
.info-section,
.activity-section,
.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-col.full {
  grid-column: 1 / -1;
}

.info-col label {
  font-size: 14px;
  color: #666;
}

.info-col span,
.info-col p {
  color: #1a1a1a;
}

/* 活动列表样式 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  transition: transform 0.2s ease;
}

.activity-card:hover {
  transform: translateX(8px);
}

.activity-card i {
  color: #3182ce;
  font-size: 16px;
}

.activity-details {
  flex: 1;
}

.activity-details p {
  margin: 0 0 4px;
  color: #1a1a1a;
}

.activity-details time {
  font-size: 12px;
  color: #666;
}

/* 设置表单样式 */
.settings-form {
  max-width: 720px;
}

.form-section {
  margin-bottom: 32px;
}

.avatar-setting {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-setting img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  padding: 8px 16px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.upload-btn:hover {
  background: #2c5282;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
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
}

.form-field input,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
  outline: none;
}

.form-field textarea {
  height: 120px;
  resize: vertical;
}

.radio-options {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  margin-top: 32px;
  text-align: right;
}

.submit-btn {
  padding: 12px 32px;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #2c5282;
  transform: translateY(-1px);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
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
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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
    padding: 16px;
  }
  
  .profile-content {
    margin-left: 0;
    padding: 16px;
  }
  
  .stats-grid,
  .info-row,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
