<template>
  <div class="category-container">
    <!-- 顶部分类标题 - 添加动画效果 -->
    <div class="category-header animate-in">
      <h1 class="category-title">
        <div class="icon-wrapper">
          <i class="fas" :class="getCategoryIcon"></i>
        </div>
        {{ categoryName }}
      </h1>

      <div class="categoryRemark">
        {{ categoryRemark }}
      </div>

      <div class="category-stats">
        <span class="stat-item">
          <i class="far fa-newspaper"></i>
          <span class="stat-value">{{ totalNews }}</span>
          篇文章
        </span>
        <span class="stat-item">
          <i class="far fa-eye"></i>
          <span class="stat-value">{{ totalViews }}</span>
          次浏览
        </span>
      </div>
    </div>

    <!-- 新闻内容区域 -->
    <div class="news-content">
      <!-- 左侧新闻列表 -->
      <div class="main-news-list">
        <div class="news-grid">
          <div class="news-item" 
               v-for="(item, index) in newsList" 
               :key="index" 
               @click="goToDetail(item.id)"
               :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="news-image-wrapper">
              <div class="news-image" v-if="item.imgUrl">
                <!-- <img :src="`${item.imgUrl}${item.random}`" :alt="item.newsTitle"> -->
                <img :src="getImgUrl(item.imgUrl)" :alt="item.newsTitle">
              </div>
              <div class="news-source-badge">{{ source }}</div>
            </div>
            <div class="news-item-content">
              <h3 class="news-title">{{ item.newsTitle }}</h3>
              <div class="news-meta">
                <span class="time">
                  <i class="far fa-clock pulse"></i>
                  {{ item.releaseTime }}
                </span>
                <span class="views">
                  <i class="far fa-eye"></i>
                  {{ totalViews }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

 
      
    </div>
  </div>
</template>

<script>
import { getNewsDetails,getNewsDetailsList } from '../../api/details';
export default {
  name: 'Category',
  data() {
    return {
      categoryId:'',
      categoryName: '',
      categoryRemark: '',
      totalNews: '',
      totalViews: 45678,
      image: 'https://picsum.photos/400/300?random=1',
      source: '新华网',
      newsList: [
        // {
        //   id: 1,
        //   title: '重要新闻标题1：国务院最新政策解读与展望',
        //   publishTime: '2小时前',
        //   views: 1234,
        //   source: '新华网',
        //   image: 'https://picsum.photos/400/300?random=1'
        // },
      ],
      hotNews: [
        {
          title: '热门新闻标题1',
          views: 12345
        },
        // 添加更多热门新闻...
      ],
      relatedTopics: ['两会', '经济发展', '民生', '科技创新']
    }
  },
  computed: {
    getCategoryIcon() {
      // 根据分类返回对应的图标类名
      const icons = {
        '时政': 'fa-landmark',
        '体育': 'fa-running',
        '文化': 'fa-book',
        '科技': 'fa-microchip',
        '旅游': 'fa-plane',
        '财经': 'fa-chart-line',
        '娱乐': 'fa-film',
        '健康': 'fa-heartbeat',
        '经济': 'fa-dollar-sign',
        '教育': 'fa-graduation-cap'
      }
      return icons[this.categoryName] || 'fa-newspaper'
    }
  },
  created() {
    this.totalViews = this.generateRandomNumber()
    this.categoryId = this.$route.params.id
    console.log('categoryId:', this.categoryId)
  },
  mounted() {
    this.getAloneNewsTypes()
    this.getNewsList()
    this.generateRandomNumber()
  },
  methods: {
    //查询详细新闻类别内容
    getAloneNewsTypes() {
      getNewsDetails(this.categoryId).then(res => {
        this.categoryName = res.data.newsName
        this.categoryRemark = res.data.newsRemark
      })
    },
    //获取新闻列表
    getNewsList() {
      const params = {
        typeId: this.categoryId,
        pageSize: 50,
        pageNum: 1
      }
      getNewsDetailsList(params).then(res => {
        this.totalNews = res.total
        this.newsList = res.rows
        console.log("newsList:",this.newsList)
      
      })
    },
    //生成随机数
    generateRandomNumber() {
      const randomNumber = Math.floor(Math.random() * 1000) + 1;
      return randomNumber
    },
    getImgUrl(imgUrl) {
      const randomNumber = this.generateRandomNumber();
      return `${imgUrl}${randomNumber}`;
  },
    goToDetail(id) {
      this.$router.push({
        name: 'NewsDetail',
        params: { id: id }
      }).catch(err => {
        console.error('Navigation failed:', err)
      });
    },
    changePage(page) {
      this.currentPage = page
      // 这里添加获取新页面数据的逻辑
    }
  },
  // 监听路由参数变化
  watch: {
    '$route.params.id': {
      handler(newId) {
        this.setCategoryName(newId);
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.category-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

/* 添加入场动画 */
.animate-in {
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

.category-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2196F3, #1565C0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper i {
  color: white;
  font-size: 1.5rem;
}

.category-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 1.1rem;
}

.stat-value {
  font-weight: 600;
  color: #2196F3;
}

/* 新闻网格样式优化 */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.news-item {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.news-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.news-image-wrapper {
  position: relative;
  overflow: hidden;
}

.news-image {
  height: 200px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-item:hover .news-image img {
  transform: scale(1.08);
}

.news-source-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(33, 150, 243, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
}

/* 热门新闻样式优化 */
.hot-news-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
}

.hot-news-item {
  padding: 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hot-news-item:hover {
  background: #f5f9ff;
  transform: translateX(8px);
}

/* 动画效果 */
.animated-fire {
  animation: flame 1.5s ease-in-out infinite;
  color: #ff4d4f;
}

@keyframes flame {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.rotating {
  animation: rotate 6s linear infinite;
  color: #2196F3;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 话题标签样式优化 */
.topic-tag {
  padding: 8px 16px;
  background: #f0f7ff;
  color: #2196F3;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.topic-tag:hover {
  background: #2196F3;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* 响应式优化 */
@media (max-width: 1024px) {
  .news-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .category-header {
    padding: 20px;
  }
  
  .category-title {
    font-size: 1.8rem;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style> 