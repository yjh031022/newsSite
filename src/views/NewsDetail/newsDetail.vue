<template>
  <div class="news-detail-container">
    <div class="news-detail-card" v-if="!loading">
      <!-- 新闻标题 -->
      <div class="title-section">
        <h1 class="news-title">{{ newsDetail.newsTitle }}</h1>
        <button class="subscribe-btn"
                :class="{ subscribed: isSubscribed }"
                @click="toggleSubscribe">
          <i class="fas" :class="isSubscribed ? 'fa-check' : 'fa-plus'"></i>
          {{ isSubscribed ? '已订阅' : '订阅' }}
        </button>
      </div>

      <!-- 新闻信息栏 -->
      <div class="news-info">
        <div class="info-left">
          <span class="source">
            <i class="fas fa-newspaper"></i>
            {{ source }}
          </span>
          <span class="publish-time">
            <i class="far fa-clock"></i>
            {{ newsDetail.releaseTime }}
          </span>
          <span class="views">
            <i class="far fa-eye"></i>
            {{ newsDetail.readingNum }} 阅读
          </span>
        </div>
      </div>

      <!-- 新闻内容区域添加操作按钮 -->
      <div class="news-content-wrapper">
        <div class="news-content" v-html="newsDetail.newsContent"></div>
        <div class="content-actions">
          <button class="action-btn like-btn" :class="{ active: isLiked }" @click="toggleNewsLike(isLiked)">
            <i class="far" :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
            <span>{{ newsDetail.appreciateNum || 0 }}</span>
          </button>
          <button class="action-btn interest-btn"
                  :class="{ 'interested': isInterested, 'not-interested': isNotInterested }"
                  @click="toggleInterest"
                  :title="getInterestTitle">
            <i class="fas" :class="getInterestIcon"></i>
            <span>{{ getInterestText }}</span>
          </button>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3 class="comments-title">
            <i class="far fa-comments"></i>
            评论区 <span class="comment-count">({{ comments.length }})</span>
          </h3>
          <div class="comments-sort">
            <span class="sort-item active">最新</span>
            <span class="sort-item">最热</span>
          </div>
        </div>

        <!-- 评论输入框 -->
        <div class="comment-input-section">
          <div class="input-header">
            <img class="user-avatar" src="https://picsum.photos/40/40" alt="用户头像">
            <div class="input-wrapper">
              <textarea
                v-model="newComment"
                placeholder="写下你的评论..."
                class="comment-input"
              ></textarea>
              <div class="input-footer">
                <div class="input-tools">
                  <span class="tool-btn">
                    <i class="far fa-smile"></i>
                  </span>
                  <span class="tool-btn">
                    <i class="far fa-image"></i>
                  </span>
                </div>
                <button class="submit-comment" @click="submitComment">发表评论</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-avatar">
              <img :src="comment.avatar" :alt="comment.username">
            </div>
            <div class="comment-main">
              <div class="comment-header">
                <div class="user-info">
                  <span class="username">{{ comment.username }}</span>
                  <span class="user-badge" v-if="comment.isAuthor">作者</span>
                </div>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <div class="action-left">
                  <span class="action-btn like-btn" :class="{ active: comment.isLiked }" @click="toggleLike(comment)">
                    <i class="far" :class="comment.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                    <span class="action-count">{{ comment.likes }}</span>
                  </span>
                </div>
                <div class="action-right">
                  <span class="action-btn reply-btn">
                    <i class="far fa-comment"></i>
                    <span class="action-text">回复</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="loading" v-else>
      <i class="fas fa-spinner fa-spin"></i> 加载中...
    </div>
  </div>
</template>

<script>
import { getNewsInfo, addLikeNews, addMarkNews } from '@/api/details';
import { addSubscribe,updateSubscribe } from "@/api/subscribe";

export default {
  name: 'NewsDetail',
  data() {
    return {
      columnId:'',
      source: 4,
      publishTime: '',
      views: 4,
      loading: true,
      newsDetail: {},
      comments: [
        {
          id: 1,
          username: '用户1',
          avatar: 'https://picsum.photos/50/50?random=1',
          content: '评论内容1',
          time: '10分钟前',
          likes: 12,
          replies: 2,
          isLiked: false
        },
        {
          id: 2,
          username: '用户2',
          avatar: 'https://picsum.photos/50/50?random=2',
          content: '评论内容2',
          time: '20分钟前',
          likes: 8,
          replies: 1,
          isLiked: true
        }
      ],
      newComment: '',
      isLiked: false,
      isInterested: false,
      isNotInterested: false,
      isSubscribed: false,
      newsId:'',
      currentTime:''
    }
  },
  computed: {
    getInterestIcon() {
      if (this.isInterested) return 'fa-thumbs-up';
      if (this.isNotInterested) return 'fa-thumbs-down';
      return 'fa-thumbs-up';
    },
    getInterestText() {
      if (this.isInterested) return '感兴趣';
      if (this.isNotInterested) return '不感兴趣';
      return '感兴趣';
    },
    getInterestTitle() {
      if (this.isInterested) return '点击切换为不感兴趣';
      if (this.isNotInterested) return '点击取消标记';
      return '点击标记为感兴趣';
    }
  },
  created() {

    this.newsId = this.$route.params.id;
    console.log('News ID:', this.newsId);
    console.log(this.getCurrentTime())
  },
  mounted() {
    this.getNewsDetail()
  },
  methods: {
    //获取当前时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (`0${now.getMonth() + 1}`).slice(-2);
      const day = (`0${now.getDate()}`).slice(-2);
      const hours = (`0${now.getHours()}`).slice(-2);
      const minutes = (`0${now.getMinutes()}`).slice(-2);
      const currentTime = `${year}-${month}-${day}`;
      return currentTime
  },
    //获取新闻详情信息
    getNewsDetail() {
      getNewsInfo(this.newsId).then(res =>{
        this.loading = false;
        this.newsDetail = res.data;
        this.columnId = res.data.columnId
        console.log("res",res)
      })
    },
    toggleLike(comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes += comment.isLiked ? 1 : -1;
    },
    submitComment() {
      if (!this.newComment.trim()) return;
      // 这里添加提交评论的逻辑
      this.newComment = '';
    },
    // 切换点赞状态
    toggleNewsLike(isLiked) {
      console.log("isLiked",isLiked)
      if(isLiked) {
        this.isLiked = false
        const delParams = {
          newsId: this.newsId,
          userId: '1903269844354760706',
          appreciateStatus: 0,
          // appreciateTime: this.getCurrentTime()
        }
        addLikeNews(delParams).then(res => {
          console.log("del:",res)
          this.$message.error(res.msg);
        })
      }
      else {
        this.isLiked = true
        const params = {
          newsId: this.newsId,
          userId: '1903269844354760706',
          appreciateStatus: 1,
          // appreciateTime: this.getCurrentTime()
        }
        addLikeNews(params).then(res => {
          console.log("add:",res)
          this.$message.success(res.msg);
        })
      }
    },
    //标记
     toggleInterest() {
   if (this.isInterested && !this.isNotInterested) {
     // 当前是感兴趣的，切换为不感兴趣
     this.isInterested = false;
     this.isNotInterested = true;

     const deleteParams = {
       newsId: this.newsId,
       markName: '1903269844354760706',
       markType: 0,
     };

     deleteMarkNews(deleteParams).then(res => {
       console.log("delete:", res);
       this.$message.success(res.msg);
     }).catch(error => {
       this.isInterested = true;
       this.isNotInterested = false;
     });

   } else {
     this.isInterested = true;
     this.isNotInterested = false;

     const addParams = {
       newsId: this.newsId,
       markName: '1903269844354760706',
       markType: 1,
     };

     addMarkNews(addParams).then(res => {
       console.log("add:", res);
       this.$message.success(res.msg);
     }).catch(error => {
       this.isInterested = false;
       this.isNotInterested = true;
     });
   }
 },

    toggleSubscribe() {
      this.isSubscribed = !this.isSubscribed;
      console.log("isSubscribed:", this.isSubscribed);
      if (this.isSubscribed) {
        const params = {
          userId: '1903269844354760706',
          columnId: this.columnId
        };
        addSubscribe(params).then(res => {
          console.log("add1:", res);
          this.$message.success(res.msg);
          this.isSubscribed = true;
        });
      } else {
        const params = {
          userId: '1903269844354760706',
          columnId: this.columnId
        }
        updateSubscribe(params).then(res => {
          console.log("up1:", res);
          this.$message.success(res.msg);
          this.isSubscribed = false;
        });
      }

    }
  }
}
</script>

<style scoped>
.news-detail-container {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.news-detail-card {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 30px;
}

.title-section {
  margin-bottom: 20px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.news-title {
  font-size: 24px;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.4;
}

.news-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.info-left {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.info-left span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.source {
  color: #1890ff;
  font-weight: 500;
}

.share-btn {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.share-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 新闻内容包装器 */
.news-content-wrapper {
  position: relative;
  margin: 40px 0;
  padding: 0 20px;
}

.news-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  min-height: 400px;
}

/* 内容操作按钮容器 */
.content-actions {
  position: absolute;
  bottom: -20px;
  right: 20px;
  display: flex;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 操作按钮样式 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 点赞按钮样式 */
.like-btn.active {
  color: #ff4d4f;
  border-color: #ff4d4f;
  background: #fff1f0;
}

.like-btn.active i {
  color: #ff4d4f;
}

/* 兴趣按钮样式 */
.interest-btn {
  min-width: 100px;
  justify-content: center;
}

.interest-btn.interested {
  color: #52c41a;
  border-color: #52c41a;
  background: #f6ffed;
}

.interest-btn.not-interested {
  color: #ff4d4f;
  border-color: #ff4d4f;
  background: #fff1f0;
}

.comments-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
  margin-top: 40px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 16px;
}

.comments-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.comments-sort {
  display: flex;
  gap: 16px;
}

.sort-item {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.sort-item:hover {
  color: #1890ff;
  background: #f0f7ff;
}

.sort-item.active {
  color: #1890ff;
  background: #e6f7ff;
  font-weight: 500;
}

.comment-input-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.input-header {
  display: flex;
  gap: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-input {
  width: 100%;
  height: 100px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.comment-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24,144,255,0.1);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-tools {
  display: flex;
  gap: 12px;
}

.tool-btn {
  padding: 8px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  color: #1890ff;
  background: #f0f7ff;
}

.submit-comment {
  padding: 8px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.submit-comment:hover {
  background: #40a9ff;
  transform: translateY(-1px);
}

.comments-list {
  padding: 0 16px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-main {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.user-badge {
  padding: 2px 8px;
  background: #1890ff;
  color: white;
  border-radius: 10px;
  font-size: 12px;
}

.comment-time {
  font-size: 13px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 13px;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn.like-btn.active {
  color: #ff4d4f;
}

.action-btn.like-btn.active i {
  color: #ff4d4f;
}

.action-count {
  font-size: 13px;
}

.action-text {
  font-size: 13px;
}

@media (max-width: 768px) {
  .comments-header {
    padding: 0 12px;
  }

  .comment-input-section {
    padding: 16px;
  }

  .comments-list {
    padding: 0 12px;
  }

  .comment-item {
    padding: 16px 0;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #666;
}

.subscribe-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #1890ff;
  background: white;
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.subscribe-btn:hover {
  background: #1890ff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(24,144,255,0.2);
}

.subscribe-btn.subscribed {
  background: #52c41a;
  border-color: #52c41a;
  color: white;
}

.subscribe-btn.subscribed:hover {
  background: #389e0d;
  border-color: #389e0d;
}

.info-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover {
  background: #f5f5f5;
}

.like-btn.active {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.like-btn.active i {
  color: #ff4d4f;
}

.interest-btn {
  padding: 6px 10px;
}

.interest-btn.interested {
  color: #52c41a;
  border-color: #52c41a;
}

.interest-btn.not-interested {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
