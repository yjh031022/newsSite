<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo">在线新闻推荐系统</div>
      <div class="search-box">
        <input type="text" placeholder="搜索新闻名、来源" />
        <button class="search-btn">搜索</button>
      </div>
      <div class="nav-buttons">
        <button class="btn-register" @click="goToRegister">用户注册</button>
        <button class="btn-login" @click="goToLogin">用户登录</button>
        <button class="btn-category">新闻分类</button>
        <button class="btn-ranking">排行榜</button>
      </div>
    </div>

    <!-- 横幅区域 -->
    <div class="banner">
      <div class="banner-content">
        <div class="banner-left">
          <!-- <img src="@/assets/news-globe.png" alt="新闻图标" /> -->
          <h2>深度报道，独家视角</h2>
        </div>
        <div class="banner-right">
          <div class="recommendation-card">
            <h3>智能推荐，只为你关心的世界</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 为你推荐区域 -->
    <div class="recommendation-section">
      <h3 class="section-title">为你推荐</h3>
      <div class="news-grid">
        <!-- 新闻卡片网格布局 -->
        <div class="news-card" v-for="(item, index) in 6" :key="index">
          <div class="news-image"></div>
          <div class="news-content">
            <h4>新闻标题</h4>
            <p class="news-source">新闻来源</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 这里可以添加数据
    }
  },
  methods: {
    goToRegister() {
      this.$router.push('/register')
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
}

.logo {
  color: #4CAF50;
  font-size: 1.5rem;
  font-weight: bold;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.search-btn {
  background-color: #FF6B35;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.nav-buttons button {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-register { background-color: #9C27B0; color: white; }
.btn-login { background-color: #4CAF50; color: white; }
.btn-category { background-color: #9C27B0; color: white; }
.btn-ranking { background-color: #4CAF50; color: white; }

.banner {
  background-color: #FFF3E0;
  padding: 2rem;
  margin-bottom: 2rem;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 2rem;
}

.news-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.news-image {
  height: 200px;
  background-color: #f5f5f5;
}

.news-content {
  padding: 1rem;
}

.news-source {
  color: #666;
  font-size: 0.9rem;
}

.section-title {
  padding: 1rem 2rem;
  color: #333;
}
</style>