<template>
  <div class="subscribe-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <i class="fas fa-star"></i>
        我的订阅
      </h1>
      <p class="subtitle">管理您感兴趣的新闻栏目</p>
    </div>

    <!-- 订阅内容主体 -->
    <div class="subscribe-content">
      <!-- 已订阅栏目 -->
      <div class="subscribed-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-heart"></i>
            已订阅栏目
          </h2>
          <span class="subscribe-count">{{ subscribedCategories.length }} 个栏目</span>
        </div>

        <div class="category-grid">
          <div v-for="category in subscribedCategories" 
               :key="category.id"
               class="category-card">
            <div class="category-icon">
              <i :class="category.icon"></i>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
            <div class="category-actions">
              <button class="setting-btn" @click="openSettings(category)">
                <i class="fas fa-cog"></i>
              </button>
              <button class="unsubscribe-btn" @click="unsubscribe(category)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐订阅 -->
      <div class="recommended-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-lightbulb"></i>
            推荐订阅
          </h2>
        </div>

        <div class="category-grid">
          <div v-for="category in recommendedCategories" 
               :key="category.id"
               class="category-card recommended">
            <div class="category-icon">
              <i :class="category.icon"></i>
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
            <button class="subscribe-btn" @click="subscribe(category)">
              <i class="fas fa-plus"></i>
              订阅
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div class="settings-modal" v-if="showSettings" @click.self="closeSettings">
      <div class="modal-content">
        <div class="modal-header">
          <h3>订阅设置 - {{ currentCategory.name }}</h3>
          <button class="close-btn" @click="closeSettings">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>推送提醒</label>
            <div class="toggle-switch">
              <input type="checkbox" v-model="currentCategory.notifications">
              <span class="slider"></span>
            </div>
          </div>
          <div class="setting-item">
            <label>更新频率</label>
            <select v-model="currentCategory.updateFrequency">
              <option value="realtime">实时推送</option>
              <option value="daily">每日一次</option>
              <option value="weekly">每周汇总</option>
            </select>
          </div>
          <div class="setting-item">
            <label>关键词过滤</label>
            <div class="keywords-input">
              <input type="text" 
                     v-model="newKeyword"
                     @keyup.enter="addKeyword"
                     placeholder="输入关键词后按回车添加">
            </div>
            <div class="keywords-list">
              <span v-for="(keyword, index) in currentCategory.keywords" 
                    :key="index" 
                    class="keyword-tag">
                {{ keyword }}
                <i class="fas fa-times" @click="removeKeyword(index)"></i>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeSettings">取消</button>
          <button class="save-btn" @click="saveSettings">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Subscribe',
  data() {
    return {
      subscribedCategories: [
        {
          id: 1,
          name: '时政要闻',
          description: '及时了解国内外重要新闻动态',
          icon: 'fas fa-landmark',
          notifications: true,
          updateFrequency: 'realtime',
          keywords: ['政策', '改革']
        },
        {
          id: 2,
          name: '科技创新',
          description: '最新科技动态和创新资讯',
          icon: 'fas fa-microchip',
          notifications: true,
          updateFrequency: 'daily',
          keywords: ['AI', '创新']
        }
        // 可以添加更多已订阅栏目
      ],
      recommendedCategories: [
        {
          id: 3,
          name: '文化艺术',
          description: '探索文化艺术的无限魅力',
          icon: 'fas fa-palette'
        },
        {
          id: 4,
          name: '体育赛事',
          description: '体育赛事实时动态',
          icon: 'fas fa-running'
        }
        // 可以添加更多推荐栏目
      ],
      showSettings: false,
      currentCategory: null,
      newKeyword: ''
    }
  },
  methods: {
    openSettings(category) {
      this.currentCategory = { ...category }
      this.showSettings = true
    },
    closeSettings() {
      this.showSettings = false
      this.currentCategory = null
    },
    saveSettings() {
      const index = this.subscribedCategories.findIndex(c => c.id === this.currentCategory.id)
      if (index !== -1) {
        this.subscribedCategories[index] = { ...this.currentCategory }
      }
      this.closeSettings()
      // 这里可以添加保存到后端的逻辑
    },
    subscribe(category) {
      const newCategory = {
        ...category,
        notifications: true,
        updateFrequency: 'daily',
        keywords: []
      }
      this.subscribedCategories.push(newCategory)
      this.recommendedCategories = this.recommendedCategories.filter(c => c.id !== category.id)
    },
    unsubscribe(category) {
      if (confirm(`确定要取消订阅 "${category.name}" 栏目吗？`)) {
        this.subscribedCategories = this.subscribedCategories.filter(c => c.id !== category.id)
        this.recommendedCategories.push({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon
        })
      }
    },
    addKeyword() {
      if (this.newKeyword.trim() && !this.currentCategory.keywords.includes(this.newKeyword.trim())) {
        this.currentCategory.keywords.push(this.newKeyword.trim())
        this.newKeyword = ''
      }
    },
    removeKeyword(index) {
      this.currentCategory.keywords.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.subscribe-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-header i {
  color: #f1c40f;
}

.subtitle {
  color: #666;
  margin-top: 10px;
}

.subscribe-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subscribe-count {
  color: #666;
  font-size: 0.9rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.category-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  position: relative;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.category-icon {
  width: 50px;
  height: 50px;
  background: #f0f7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #2196F3;
}

.category-info {
  flex: 1;
}

.category-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 5px;
}

.category-info p {
  font-size: 0.9rem;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.setting-btn,
.unsubscribe-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.setting-btn {
  background: #f0f7ff;
  color: #2196F3;
}

.setting-btn:hover {
  background: #2196F3;
  color: white;
}

.unsubscribe-btn {
  background: #fff5f5;
  color: #ff4d4f;
}

.unsubscribe-btn:hover {
  background: #ff4d4f;
  color: white;
}

.subscribe-btn {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.subscribe-btn:hover {
  background: #1976D2;
  transform: scale(1.05);
}

/* 设置弹窗样式 */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.keywords-input input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  background: #f0f7ff;
  color: #2196F3;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.keyword-tag i {
  cursor: pointer;
  font-size: 0.8rem;
}

.keyword-tag i:hover {
  color: #ff4d4f;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.save-btn {
  background: #2196F3;
  border: none;
  color: white;
}

.save-btn:hover {
  background: #1976D2;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>
