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
        <button class="btn-category" @click="gotoNewsType">新闻分类</button>
        <button class="btn-ranking" @click="gotoRange">排行榜</button>
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
    },
    gotoRange() {
      this.$router.push('/range')
    },
    gotoNewsType() {
      this.$router.push('/newsType')
    },
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  color: #2196F3;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  transition: color 0.3s ease;
}

.logo:hover {
  color: #1976D2;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 5px rgba(33,150,243,0.3);
}

.search-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 25px;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background-color: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.nav-buttons button {
  margin-left: 1rem;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-register { 
  background-color: #673AB7; 
  color: white; 
}
.btn-login { 
  background-color: #2196F3; 
  color: white; 
}
.btn-category { 
  background-color: #FF5722; 
  color: white; 
}
.btn-ranking { 
  background-color: #4CAF50; 
  color: white; 
}

.nav-buttons button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.banner {
  background: linear-gradient(135deg, #1976D2, #64B5F6);
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  color: white;
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
  max-width: 1200px;
  margin: 0 auto;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.news-image {
  height: 200px;
  background-color: #e0e0e0;
  transition: all 0.3s ease;
}

.news-content {
  padding: 1.2rem;
}

.news-content h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.news-source {
  color: #757575;
  font-size: 0.9rem;
}

.section-title {
  padding: 1rem 2rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0;
}
</style>