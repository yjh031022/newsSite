<template>
  <div class="category-container">
    <!-- 顶部分类标题 -->
    <div class="category-header">
      <h1 class="category-title">
        <i class="fas" :class="getCategoryIcon"></i>
        {{ categoryName }}
      </h1>
      <div class="category-stats">
        <span><i class="far fa-newspaper"></i> {{ totalNews }} 篇文章</span>
        <span><i class="far fa-eye"></i> {{ totalViews }} 次浏览</span>
      </div>
    </div>

    <!-- 新闻列表 -->
    <div class="news-content">
      <!-- 左侧新闻列表 -->
      <div class="main-news-list">
        <div class="news-item" v-for="(item, index) in newsList" :key="index" @click="goToDetail(item.id)">
          <div class="news-item-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-brief">{{ item.brief }}</p>
            <div class="news-meta">
              <span class="time"><i class="far fa-clock"></i> {{ item.publishTime }}</span>
              <span class="views"><i class="far fa-eye"></i> {{ item.views }}</span>
              <span class="comments"><i class="far fa-comment"></i> {{ item.comments }}</span>
              <span class="source">{{ item.source }}</span>
            </div>
          </div>
          <div class="news-image" v-if="item.image">
            <img :src="item.image" :alt="item.title">
          </div>
        </div>
        
        <!-- 分页器 -->
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 热门排行 -->
        <div class="sidebar-section">
          <h3><i class="fas fa-fire"></i> 热门排行</h3>
          <div class="hot-news-list">
            <div class="hot-news-item" v-for="(item, index) in hotNews" :key="index">
              <span class="rank-number" :class="{ 'top-rank': index < 3 }">{{ index + 1 }}</span>
              <div class="hot-news-content">
                <h4>{{ item.title }}</h4>
                <span class="view-count"><i class="far fa-eye"></i> {{ item.views }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 相关话题 -->
        <div class="sidebar-section">
          <h3><i class="fas fa-hashtag"></i> 相关话题</h3>
          <div class="topic-list">
            <a class="topic-tag" v-for="(topic, index) in relatedTopics" :key="index">
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
          title: '示例新闻标题1',
          brief: '这是一段新闻简介，描述新闻的主要内容...',
          publishTime: '2小时前',
          views: 1234,
          comments: 56,
          source: '新华网',
          image: 'https://picsum.photos/200/150'
        },
        // 添加更多新闻项...
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
      this.$router.push(`/news-detail/${id}`)
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

.category-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  backdrop-filter: blur(10px);
}

.category-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-title i {
  color: #2196F3;
}

.category-stats {
  display: flex;
  gap: 20px;
  color: #666;
}

.category-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.news-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.main-news-list {
  background: #fff;
  border-radius: 8px;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.news-item {
  display: flex;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(248, 249, 250, 0.8);
}

.news-item-content {
  flex: 1;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  margin-bottom: 12px;
  line-height: 1.5;
}

.news-brief {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 13px;
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-meta i {
  font-size: 14px;
}

.news-meta .source {
  color: #2196F3;
}

.news-image {
  width: 180px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-item:hover .news-image img {
  transform: scale(1.05);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  backdrop-filter: blur(10px);
}

.sidebar-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-section h3 i {
  color: #2196F3;
}

.hot-news-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-news-item:hover {
  transform: translateX(5px);
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  color: #666;
  border-radius: 4px;
  margin-right: 10px;
  font-weight: bold;
}

.rank-number.top-rank {
  background: #ff4d4f;
  color: white;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.topic-tag {
  padding: 6px 12px;
  background: #f0f7ff;
  color: #2196F3;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-tag:hover {
  background: #2196F3;
  color: white;
}

.pagination {
  padding: 24px 0;
  margin-top: 0;
  border-top: none;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f0f7ff;
  color: #2196F3;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #2196F3;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 1024px) {
  .news-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .news-item {
    flex-direction: column;
    padding: 16px 0;
  }
  
  .news-item-content {
    padding-right: 0;
    margin-bottom: 16px;
  }
  
  .news-image {
    width: 100%;
    height: 180px;
  }
  
  .news-meta {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style> 