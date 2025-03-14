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
              <div class="news-image" v-if="item.image">
                <img :src="item.image" :alt="item.title">
              </div>
              <div class="news-source-badge">{{ item.source }}</div>
            </div>
            <div class="news-item-content">
              <h3 class="news-title">{{ item.title }}</h3>
              <div class="news-meta">
                <span class="time">
                  <i class="far fa-clock pulse"></i>
                  {{ item.publishTime }}
                </span>
                <span class="views">
                  <i class="far fa-eye"></i>
                  {{ item.views }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 热门排行 -->
        <div class="sidebar-section hot-news-section">
          <h3>
            <i class="fas fa-fire animated-fire"></i>
            热门排行
          </h3>
          <div class="hot-news-list">
            <div class="hot-news-item" 
                 v-for="(item, index) in hotNews" 
                 :key="index"
                 :style="{ animationDelay: `${index * 0.1}s` }">
              <span class="rank-number" :class="{ 'top-rank': index < 3 }">{{ index + 1 }}</span>
              <div class="hot-news-content">
                <h4>{{ item.title }}</h4>
                <span class="view-count">
                  <i class="far fa-eye"></i>
                  {{ item.views }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 相关话题 -->
        <div class="sidebar-section topics-section">
          <h3>
            <i class="fas fa-hashtag rotating"></i>
            相关话题
          </h3>
          <div class="topic-list">
            <a class="topic-tag" 
               v-for="(topic, index) in relatedTopics" 
               :key="index"
               :style="{ animationDelay: `${index * 0.1}s` }">
              # {{ topic }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Category',
  data() {
    return {
      categoryName: '',
      totalNews: 1234,
      totalViews: 45678,
      currentPage: 1,
      totalPages: 10,
      newsList: [
        {
          id: 1,
          title: '重要新闻标题1：国务院最新政策解读与展望',
          publishTime: '2小时前',
          views: 1234,
          source: '新华网',
          image: 'https://picsum.photos/400/300?random=1'
        },
        {
          id: 2,
          title: '重要新闻标题2：经济发展新动向分析报告',
          publishTime: '3小时前',
          views: 2345,
          source: '人民日报',
          image: 'https://picsum.photos/400/300?random=2'
        },
        {
          id: 3,
          title: '重要新闻标题3：科技创新引领产业升级',
          publishTime: '4小时前',
          views: 3456,
          source: '央视新闻',
          image: 'https://picsum.photos/400/300?random=3'
        },
        {
          id: 4,
          title: '重要新闻标题4：教育改革最新进展报道',
          publishTime: '5小时前',
          views: 4567,
          source: '环球时报',
          image: 'https://picsum.photos/400/300?random=4'
        },
        {
          id: 5,
          title: '重要新闻标题5：医疗健康领域重大突破',
          publishTime: '6小时前',
          views: 5678,
          source: '科技日报',
          image: 'https://picsum.photos/400/300?random=5'
        },
        {
          id: 6,
          title: '重要新闻标题6：文化产业发展新趋势',
          publishTime: '7小时前',
          views: 6789,
          source: '文汇报',
          image: 'https://picsum.photos/400/300?random=6'
        },
        {
          id: 7,
          title: '重要新闻标题7：体育赛事最新战报',
          publishTime: '8小时前',
          views: 7890,
          source: '体坛周报',
          image: 'https://picsum.photos/400/300?random=7'
        },
        {
          id: 8,
          title: '重要新闻标题8：环保事业新进展',
          publishTime: '9小时前',
          views: 8901,
          source: '中国日报',
          image: 'https://picsum.photos/400/300?random=8'
        },
        {
          id: 9,
          title: '重要新闻标题9：金融市场最新动态',
          publishTime: '10小时前',
          views: 9012,
          source: '经济日报',
          image: 'https://picsum.photos/400/300?random=9'
        },
        {
          id: 10,
          title: '重要新闻标题10：社会民生热点关注',
          publishTime: '11小时前',
          views: 10123,
          source: '光明日报',
          image: 'https://picsum.photos/400/300?random=10'
        }
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
  created() {
    // 获取路由参数并设置分类名称
    const categoryId = this.$route.params.id;
    this.setCategoryName(categoryId);
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
  methods: {
    setCategoryName(categoryId) {
      // 根据 ID 设置分类名称
      const categoryMap = {
        'politics': '时政',
        'sports': '体育',
        'culture': '文化',
        'tech': '科技',
        'travel': '旅游',
        'finance': '财经',
        'entertainment': '娱乐',
        'health': '健康',
        'economy': '经济',
        'education': '教育'
      };
      this.categoryName = categoryMap[categoryId] || '未知分类';
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