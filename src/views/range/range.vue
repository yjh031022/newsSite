<template>
  <div class="news-ranking">
    <h2 class="ranking-title">新闻点赞排行榜</h2>
    <div class="ranking-list">
      <div v-for="(item, index) in newsData" :key="index" class="news-item">
        <div class="rank-number" :class="{'top-three': index < 3}">{{ index + 1 }}</div>
        <div class="news-content">
          <div class="news-title">{{ item.title }}</div>
          <div class="likes">
            <i class="iconfont icon-like"></i>
            <span>{{ item.likes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsRanking',
  data() {
    return {
      newsData: [
        {
          title: '科技突破：新型电池续航能力提升50%',
          likes: 2584
        },
        {
          title: '2024全球气候变化报告发布',
          likes: 2147
        },
        {
          title: '人工智能在医疗领域取得重大进展',
          likes: 1893
        },
        {
          title: '世界最大海洋清理计划启动',
          likes: 1562
        },
        {
          title: '新发现：火星表面或存在液态水',
          likes: 1234
        }
      ]
    }
  }
}
</script>

<style scoped>
.news-ranking {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.ranking-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

.news-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.news-item:hover {
  transform: translateX(5px);
  background: #f0f2f5;
}

.rank-number {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #e0e0e0;
  border-radius: 50%;
  margin-right: 15px;
  font-weight: bold;
}

.top-three {
  color: #fff;
}

.rank-number:nth-child(1) {
  background: #ffd700;
}

.news-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-title {
  font-size: 16px;
  color: #333;
}

.likes {
  display: flex;
  align-items: center;
  color: #ff6b6b;
}

.likes i {
  margin-right: 5px;
}

/* 前三名的样式 */
.news-item:nth-child(1) .rank-number {
  background: #ffd700;
}

.news-item:nth-child(2) .rank-number {
  background: #c0c0c0;
}

.news-item:nth-child(3) .rank-number {
  background: #cd7f32;
}
</style>
