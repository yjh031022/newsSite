<template>
  <div class="news-type-container">
    <!-- 新闻分类导航 -->
    <div class="news-categories">
      <div 
        v-for="category in categories" 
        :key="category.id"
        :class="['category-item', { active: currentCategory === category.id }]"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- 新闻列表 -->
    <div class="news-list">
      <div v-for="news in newsList" :key="news.id" class="news-card">
        <div class="news-image"></div>
        <div class="news-content">
          <h3 class="news-title">{{ news.title }}</h3>
          <p class="news-summary">{{ news.summary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsType',
  data() {
    return {
      currentCategory: 1,
      categories: [
        { id: 1, name: '社会新闻' },
        { id: 2, name: '科技资讯' },
        { id: 3, name: '娱乐动态' },
        { id: 4, name: '体育快讯' },
        { id: 5, name: '财经新闻' }
      ],
      newsList: [
        {
          id: 1,
          title: '示例新闻标题1',
          summary: '这是一段新闻摘要，描述了新闻的主要内容。这是一段新闻摘要，描述了新闻的主要内容。',
          image: 'url1'
        },
        {
          id: 2,
          title: '示例新闻标题2',
          summary: '这是一段新闻摘要，描述了新闻的主要内容。这是一段新闻摘要，描述了新闻的主要内容。',
          image: 'url2'
        },
        // 更多新闻数据...
      ]
    }
  },
  methods: {
    selectCategory(categoryId) {
      this.currentCategory = categoryId
      // 这里可以添加获取对应分类新闻的逻辑
    }
  }
}
</script>

<style scoped>
.news-type-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.news-categories {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.category-item {
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f5f5f5;
}

.category-item:hover {
  background-color: #e0e0e0;
}

.category-item.active {
  background-color: #1890ff;
  color: white;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.news-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.news-card:hover {
  transform: translateY(-5px);
}

.news-image {
  height: 200px;
  background-color: #f0f0f0;
  /* 实际使用时替换为真实图片 */
}

.news-content {
  padding: 16px;
}

.news-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.news-summary {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>
