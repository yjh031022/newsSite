<template>
  <div class="article-list">
    <h2>文章列表</h2>
    <div class="articles">
      <div class="article-item" v-for="(article, index) in articles" :key="index">
        <div class="article-image">
          <!-- 这里用div模拟图片区域 -->
          <div class="image-placeholder"></div>
        </div>
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-desc">{{ article.description }}</p>
          <div class="article-meta">
            <span class="date">{{ article.date }}</span>
            <span class="author">作者：{{ article.author }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      articles: [
        {
          title: '5G技术发展最新动向',
          description: '本文详细介绍了5G技术的最新发展趋势，以及其在各个领域的应用前景...',
          date: '2024-03-20',
          author: '张三'
        },
        {
          title: '人工智能在医疗领域的应用',
          description: '随着AI技术的发展，其在医疗诊断、药物研发等领域发挥着越来越重要的作用...',
          date: '2024-03-19',
          author: '李四'
        },
        {
          title: '环保科技创新案例分析',
          description: '探讨最新的环保科技创新案例，展示科技如何助力环境保护...',
          date: '2024-03-18',
          author: '王五'
        }
      ]
    }
  }
}
</script>

<style scoped>
.article-list {
  padding: 20px;
}

.articles {
  margin-top: 20px;
}

.article-item {
  display: flex;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-image {
  flex: 0 0 200px;
  margin-right: 20px;
}

.image-placeholder {
  width: 200px;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.article-content {
  flex: 1;
}

.article-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #333;
}

.article-desc {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.6;
}

.article-meta {
  color: #999;
  font-size: 14px;
}

.article-meta span {
  margin-right: 20px;
}
</style>