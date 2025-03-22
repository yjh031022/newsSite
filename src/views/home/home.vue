<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo">新闻智能推荐系统</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/home' }">
          <i class="fas fa-home"></i>首页
        </router-link>
        <router-link to="/subscribe" class="nav-link" :class="{ active: $route.path === '/subscribe' }" @click="goToSubscribe">
          <i class="fas fa-star"></i>我的订阅
        </router-link>
      </div>
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input type="text" placeholder="搜索新闻..." />
        <button class="search-btn">搜索</button>
      </div>
      <div class="nav-buttons" @click="goToProfile">
        <div class="nav-link profile-link">
          <i class="fas fa-user"></i>
          <span>个人中心</span>
        </div>
      </div>
    </div>

    <!-- 新闻分类导航 -->
    <div class="category-nav">
      <div class="category-item"
           v-for="category in categories"
           :key="category.id"
           :class="{ active: currentCategory === category.id }"
           @click="goToCategory(category.id)">
        {{ category.newsName }}
      </div>
    </div>

    <!-- 轮播图区域 -->
    <div class="carousel-section">
      <div class="carousel-container">
        <div class="carousel-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div class="carousel-item" v-for="(item, index) in carouselItems" :key="index">
            <img :src="item.image" :alt="item.title">
            <div class="carousel-title">{{ item.title }}</div>
          </div>
        </div>
        <!-- 添加左右箭头 -->
        <div class="carousel-arrow left" @click="prevSlide">&lt;</div>
        <div class="carousel-arrow right" @click="nextSlide">&gt;</div>
        <!-- 轮播图指示器 -->
        <div class="carousel-indicators">
          <span v-for="(item, index) in carouselItems"
                :key="index"
                :class="{ active: currentIndex === index }"
                @click="setCurrentIndex(index)">
          </span>
        </div>
      </div>
    </div>

    <!-- 新闻展示区域 -->
    <div class="news-sections">
      <div class="news-section">
        <div class="section-header">
          <h3><i class="fas fa-newspaper"></i> 今日要闻</h3>
          <a class="more-link">查看更多 <i class="fas fa-angle-right"></i></a>
        </div>
        <div class="news-list">
          <div class="news-item" v-for="i in 5" :key="i">
            <div class="news-item-content">
              <h4 class="news-title">新闻标题示例新闻标题示例</h4>
              <p class="news-brief">新闻简介内容新闻简介内容新闻简介内容...</p>
              <div class="news-meta">
                <span><i class="far fa-clock"></i> 2小时前</span>
                <span><i class="far fa-eye"></i> 1234</span>
              </div>
            </div>
            <div class="news-image">
              <img src="https://picsum.photos/100/100" alt="新闻图片">
            </div>
          </div>
        </div>
      </div>

      <div class="news-section">
        <div class="section-header">
          <h3><i class="fas fa-heart"></i> 猜你喜欢</h3>
          <a class="more-link">更多推荐 <i class="fas fa-angle-right"></i></a>
        </div>
        <div class="news-list">
          <div class="news-card" v-for="i in 4" :key="i">
            <div class="news-card-image">
              <img src="https://picsum.photos/300/200" alt="新闻图片">
            </div>
            <div class="news-card-content">
              <h4>推荐新闻标题示例</h4>
              <p class="news-brief">推荐新闻简介内容...</p>
              <div class="news-meta">
                <span><i class="far fa-thumbs-up"></i> 88%匹配</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="news-section">
        <div class="section-header">
          <h3><i class="fas fa-fire"></i> 热门栏目</h3>
          <a class="more-link">全部热门 <i class="fas fa-angle-right"></i></a>
        </div>
        <div class="news-list">
          <div class="hot-news-item" v-for="i in 6" :key="i">
            <span class="hot-rank" :class="i <= 3 ? 'top-rank' : ''">{{i}}</span>
            <div class="hot-news-content">
              <h4>热门新闻标题示例</h4>
              <div class="news-meta">
                <span><i class="fas fa-fire"></i> {{10000 - i * 1000}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getNewsTypeList } from '../../api/home'
export default {
  name: 'Home',
  data() {
    return {
      currentCategory: 'politics',
      categories: [],
      currentIndex: 0,
      carouselItems: [
        { image: 'https://picsum.photos/1920/1080?random=1'},
        { image: 'https://picsum.photos/1920/1080?random=2' },
        { image: 'https://picsum.photos/1920/1080?random=3' },
        { image: 'https://picsum.photos/1920/1080?random=4' }
      ],
      carouselInterval: null,
      todayNews: [
        {
          title: '新闻标题',
          brief: '新闻简介',
          image: '图片URL',
          time: '发布时间',
          views: '浏览量'
        }
        // ... 更多新闻
      ],
      recommendNews: [
        {
          title: '推荐新闻标题',
          brief: '推荐新闻简介',
          image: '图片URL',
          match: '匹配度'
        }
        // ... 更多推荐
      ],
      hotNews: [
        {
          title: '热门新闻标题',
          hot: '热度值'
        }
        // ... 更多热门
      ]
    }
  },
  created() {
    this.getNewsCategory();
  },
  methods: {
    //获取新闻类别列表
    getNewsCategory() {
      const params = {
        pageSize: 10,
        pageNum: 1
      }
      getNewsTypeList(params).then(res =>{
        console.log("Res:",res)
        this.categories = res.rows
      })
    },
    //单个新闻类别列表
    goToCategory(categoryId) {
      this.$router.push({
        name: "Category",
        params: { id: categoryId}
         
      });
    },
    startCarousel() {
      this.carouselInterval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.carouselItems.length
      }, 3000)
    },
    setCurrentIndex(index) {
      this.currentIndex = index
    },
    prevSlide() {
      this.currentIndex = this.currentIndex === 0
        ? this.carouselItems.length - 1
        : this.currentIndex - 1;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.carouselItems.length;
    },
   
    goToProfile() {
      this.$router.push('/profile')
    },
    goToSubscribe() {
      this.$router.push('/subscribe')
    }
  },
  mounted() {
    this.startCarousel()
  },
  beforeDestroy() {
    clearInterval(this.carouselInterval)
  }
}
</script>

<style scoped>
/* 修改和新增的背景相关样式 */
.home-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
  position: relative;
}

/* 添加背景纹理 */
.home-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(45deg, #ffffff20 25%, transparent 25%),
    linear-gradient(-45deg, #ffffff20 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ffffff20 75%),
    linear-gradient(-45deg, transparent 75%, #ffffff20 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  pointer-events: none;
  z-index: 0;
}

/* 修改顶部导航栏背景 */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
}

.logo {
  color: #2196F3;
  font-size: 1.6rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  transition: color 0.3s ease;
  min-width: 200px;
}

.nav-links {
  display: flex;
  gap: 20px;
  margin-right: 20px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 1rem;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link i {
  font-size: 1.1rem;
}

.nav-link:hover {
  color: #2196F3;
  background-color: #f0f7ff;
}

.nav-link.active {
  color: #2196F3;
  background-color: #f0f7ff;
  font-weight: 500;
}

.search-box {
  display: flex;
  align-items: center;
  position: relative;
  max-width: 400px;
  width: 100%;
  margin: 0 20px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
}

.search-box input {
  padding: 10px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  width: 100%;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.search-box input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow:
    0 0 0 2px rgba(33, 150, 243, 0.2),
    0 4px 6px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 1);
}

.search-btn {
  position: absolute;
  right: 5px;
  padding: 6px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background-color: #1976D2;
  transform: translateY(-1px);
}

.profile-link {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.profile-link:hover {
  background-color: #e0e0e0;
  color: #1976D2;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .search-box {
    max-width: 300px;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0.8rem 1rem;
  }

  .logo {
    font-size: 1.3rem;
    min-width: auto;
  }

  .search-box {
    max-width: 200px;
  }

  .nav-link span {
    display: none;
  }

  .nav-link i {
    font-size: 1.2rem;
  }
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.category-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.category-item {
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s;
}

.category-item:hover,
.category-item.active {
  background: #2196F3;
  color: white;
}

.carousel-section {
  width: 100%;
  padding: 20px;
  background: transparent;
}

.carousel-container {
  width: 100%;
  max-width: 1300px;
  height: 500px;  /* 调整高度 */
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.carousel-wrapper {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
}

.carousel-item {
  min-width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  color: white;
  font-size: 18px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
}

/* 修改指示器样式 */
.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.carousel-indicators span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-indicators span.active {
  background: white;
  transform: scale(1.2);
}

/* 添加箭头样式 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0,0,0,0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 2;
}

.carousel-arrow:hover {
  background: rgba(0,0,0,0.5);
}

.carousel-arrow.left {
  left: 20px;
}

.carousel-arrow.right {
  right: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .carousel-container {
    height: 200px;
  }

  .carousel-title {
    font-size: 16px;
    padding: 10px 15px;
  }

  .carousel-arrow {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
}

.news-sections {
  display: grid;
  grid-template-columns: 2fr 1fr 300px;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.news-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h3 {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h3 i {
  color: #2196F3;
}

.more-link {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.more-link:hover {
  color: #2196F3;
}

/* 今日要闻样式 */
.news-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(248, 249, 250, 0.8);
}

.news-item-content {
  flex: 1;
  padding-right: 15px;
}

.news-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.news-brief {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
  line-height: 1.5;
}

.news-meta {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 0.85rem;
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 猜你喜欢样式 */
.news-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.news-card-image {
  height: 160px;
}

.news-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-card-content {
  padding: 12px;
}

/* 热门栏目样式 */
.hot-news-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-news-item:hover {
  background: #f8f9fa;
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #666;
  border-radius: 4px;
  margin-right: 12px;
  font-weight: bold;
}

.hot-rank.top-rank {
  background: #ff4d4f;
  color: white;
}

.hot-news-content {
  flex: 1;
}

.hot-news-content h4 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .news-sections {
    grid-template-columns: 1fr 1fr;
  }

  .news-section:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .news-sections {
    grid-template-columns: 1fr;
  }

  .news-section:last-child {
    grid-column: span 1;
  }

  .news-image {
    width: 100px;
    height: 70px;
  }
}
</style>
