<template>
  <div class="bookmark-container">
    <!-- 骨架屏 -->
    <div v-if="isLoading" class="collapse-container">
      <div v-for="i in 6" :key="i" class="collapse-item skeleton-item">
        <div class="collapse-header skeleton-header">
          <div class="header-content">
            <div class="skeleton-title">title</div>
            <div class="skeleton-time">time</div>
          </div>
          <div class="skeleton-arrow">arrow</div>
        </div>
      </div>
    </div>

    <!-- 实际内容 -->
    <div v-else class="collapse-container">
      <div v-for="(category, index) in categories" :key="category.id" class="collapse-item">
        <div class="collapse-header" @click="toggleCategory(index)">
          <div class="header-content">
            <span class="title">{{ category.title }}</span>
            <span class="time">创建于: {{ formatTime(category.created_at) }} | 更新于: {{ formatTime(category.updated_at) }}</span>
          </div>
          <div class="arrow" :class="{ 'is-active': expandedCategories[index] }">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <Transition name="section">
          <div class="collapse-content" v-show="expandedCategories[index]">
            <!-- 分类内容加载骨架屏 -->
            <div v-if="loadingStates[index]" class="bookmark-grid">
              <div v-for="i in 6" :key="i" class="bookmark-card skeleton-card">
                <div class="card-header">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-title-wrapper">
                    <div class="skeleton-card-title"></div>
                    <div class="skeleton-badge"></div>
                  </div>
                </div>
                <div class="skeleton-description"></div>
                <div class="skeleton-description-short"></div>
                <div class="card-footer">
                  <div class="skeleton-link"></div>
                  <div class="skeleton-time-info">
                    <div class="skeleton-time-item"></div>
                    <div class="skeleton-time-item"></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="category.items && category.items.length" class="bookmark-grid">
              <div v-for="item in category.items" :key="item.uuid" class="bookmark-card">
                <div class="card-header">
                  <div class="icon-wrapper">
                    <svg v-if="isSvg(item.icon)" class="svg-icon" v-html="item.icon"></svg>
                    <img v-else :src="item.icon || getFavicon(item.link)" 
                         @error="handleImageError($event, item)" 
                         class="favicon" 
                         alt="" />
                  </div>
                  <div class="title-wrapper">
                    <a :href="item.link" target="_blank" class="title">{{ item.title }}</a>
                    <span v-if="item.badge" class="badge" :class="item.badge_type">{{ item.badge }}</span>
                  </div>
                </div>
                <p class="description">{{ item.desc }}</p>
                <div class="card-footer">
                  <span class="link-text">{{ item.linktxt }}</span>
                  <div class="time-info">
                    <div class="time-item">
                      <span class="time-label">创建</span>
                      <time :datetime="item.created_at" :title="formatDetailTime(item.created_at)">
                        {{ formatTime(item.created_at) }}
                      </time>
                    </div>
                    <div class="time-item">
                      <span class="time-label">更新</span>
                      <time :datetime="item.updated_at" :title="formatDetailTime(item.updated_at)">
                        {{ formatTime(item.updated_at) }}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              暂无书签
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'
import axios from 'axios'

const { theme, isDark } = useData()
const isLoading = ref(true) // 添加整体加载状态
const categories = ref([])
const expandedCategories = ref({})
const loadingStates = ref({})

// 判断是否为 SVG
const isSvg = (icon) => {
  if (!icon) return false
  return icon.trim().startsWith('<svg')
}

// 获取网站图标
const getFavicon = (url) => {
  try {
    const domain = new URL(url).hostname
    return `https://favicon.yandex.net/favicon/${domain}?size=32`
  } catch (e) {
    return 'https://s21.ax1x.com/2025/01/31/pEZi6J0.png'
  }
}

// 图片加载失败处理
const handleImageError = (event, cell) => {
  const img = event.target
  const domain = new URL(cell.link).hostname

  // 尝试其他源
  if (!img.src.includes('icon.horse')) {
    img.src = `https://icon.horse/icon/${domain}`
  } else if (!img.src.includes('google.com')) {
    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } else {
    img.src = 'https://s21.ax1x.com/2025/01/31/pEZi6J0.png'
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化具体时间
const formatDetailTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载分类书签
const loadCategoryBookmarks = async (index) => {
  if (loadingStates.value[index]) return
  
  const category = categories.value[index]
  if (category.items) return // 已加载过的不重复加载
  
  loadingStates.value[index] = true
  try {
    const response = await axios.get(`https://inter.yumeng.icu/bookmark/resources-list?categoryId=${category.id}&enabledStatus=true`)
    if (response.data.statusCode === 200) {
      categories.value[index] = {
        ...category,
        items: response.data.data
      }
    }
  } catch (error) {
    console.error(`Failed to load bookmarks for category ${category.id}:`, error)
  } finally {
    loadingStates.value[index] = false
  }
}

// 切换分类展开状态
const toggleCategory = async (index) => {
  expandedCategories.value[index] = !expandedCategories.value[index]
  if (expandedCategories.value[index]) {
    await loadCategoryBookmarks(index)
  }
}

// 初始化
onMounted(async () => {
  try {
    isLoading.value = true
    const response = await axios.get('https://inter.yumeng.icu/bookmark/resources-categories-list?enabledStatus=true')
    if (response.data.statusCode === 200) {
      categories.value = response.data.data
      
      // 初始化展开状态
      categories.value.forEach((category, index) => {
        expandedCategories.value[index] = category.default_expanded
        loadingStates.value[index] = false
        
        // 加载默认展开的分类
        if (category.default_expanded) {
          loadCategoryBookmarks(index)
        }
      })
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.bookmark-container {
  /* 使用 VitePress 的主题变量 */
  --bookmark-transition-duration: 0.3s;
  --bookmark-border-radius: 4px;
  
  padding: 20px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}

.collapse-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--bookmark-border-radius);
  background-color: var(--vp-c-bg);
}

.collapse-item {
  &:not(:last-child) {
    border-bottom: 1px solid var(--vp-c-divider);
  }
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background-color var(--bookmark-transition-duration);
  
  &:hover {
    background-color: var(--vp-c-bg-soft);
  }
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--vp-c-text-1);
    }
    
    .time {
      font-size: 12px;
      color: var(--vp-c-text-2);
    }
  }
}

.arrow {
  transition: transform var(--bookmark-transition-duration);
  color: var(--vp-c-text-2);
  
  &.is-active {
    transform: rotate(180deg);
  }

  svg {
    stroke: currentColor;
  }
}

.collapse-content {
  overflow: hidden;
  transition: all var(--bookmark-transition-duration) ease-in-out;
  opacity: 1;
  max-height: none;
  
  &.is-collapsed {
    opacity: 0;
    max-height: 0 !important;
    margin: 0;
    padding: 0;
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
  transition: all var(--bookmark-transition-duration) ease-in-out;
}

/* 添加内容区域的动画类 */
.section-enter-active,
.section-leave-active {
  transition: all var(--bookmark-transition-duration) ease-in-out;
  max-height: 2000px;
}

.section-enter-from,
.section-leave-to {
  opacity: 0;
  max-height: 0;
}

.bookmark-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--bookmark-border-radius);
  padding: 16px;
  background-color: var(--vp-c-bg);
  transition: all var(--bookmark-transition-duration);
  
  &:hover {
    border-color: var(--vp-c-brand);
    box-shadow: 0 0 12px var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);

    .title {
      color: var(--vp-c-brand);
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--bookmark-border-radius);
  overflow: hidden;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  
  .favicon, .svg-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    min-width: 16px;
    min-height: 16px;
  }

  .favicon {
    padding: 2px;
  }

  .svg-icon {
    fill: var(--vp-c-text-1);
  }
}

.title-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .title {
    color: var(--vp-c-text-1);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--bookmark-transition-duration);
    
    &:hover {
      color: var(--vp-c-brand);
    }
  }
}

.badge {
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 10px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  
  &.hot {
    background-color: var(--vp-c-red-dimm-2);
    color: var(--vp-c-red-1);
  }
  
  &.new {
    background-color: var(--vp-c-green-dimm-2);
    color: var(--vp-c-green-1);
  }
}

.description {
  margin: 8px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.time-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
}

.time-label {
  color: var(--vp-c-text-2);
  font-weight: 500;
}

time {
  color: var(--vp-c-text-2);
  cursor: help;
}

.link-text {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border-radius: var(--bookmark-border-radius);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .bookmark-container {
    padding: 0;
  }

  .bookmark-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content .time {
    display: none;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .time-info {
    width: 100%;
    justify-content: space-between;
  }

  .icon-wrapper {
    width: 28px;
    height: 28px;
    
    .favicon {
      padding: 1px;
    }
  }

  /* 针对不同设备像素比的优化 */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .icon-wrapper .favicon {
      image-rendering: -webkit-optimize-contrast;
      transform: translateZ(0);
    }
  }
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .bookmark-container {
    padding: 0px;
  }

  .bookmark-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }

  .bookmark-card {
    padding: 12px;
  }

  .card-header {
    margin-bottom: 8px;
  }

  .icon-wrapper {
    width: 28px; /* 调整移动端图标大小 */
    height: 28px;
    
    .favicon {
      padding: 1px; /* 移动端减小内边距 */
    }
  }

  /* 针对不同设备像素比的优化 */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .icon-wrapper {
      .favicon {
        image-rendering: -webkit-optimize-contrast; /* 优化高分辨率屏幕的图标显示 */
        transform: translateZ(0); /* 防止图标模糊 */
      }
    }
  }
}

/* 针对超小屏幕的优化 */
@media (max-width: 360px) {
  .bookmark-container {
    padding: 8px;
  }

  .bookmark-grid {
    padding: 8px;
    gap: 8px;
  }

  .time-info {
    justify-content: flex-start;
  }

  .time-item {
    font-size: 10px;
  }
}

/* 骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-item {
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  
  &:last-child {
    border-bottom: none;
  }
}

.skeleton-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: default;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.skeleton-title {
  height: 20px;
  width: 100px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  color: transparent;
  user-select: none;
}

.skeleton-time {
  height: 14px;
  width: 240px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  opacity: 0.7;
  color: transparent;
  user-select: none;
}

/* 添加箭头占位 */
.skeleton-arrow {
  width: 24px;
  height: 24px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;
  opacity: 0.5;
  color: transparent;
  user-select: none;
  flex-shrink: 0;
}

.skeleton-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--bookmark-border-radius);
  padding: 16px;
  background-color: var(--vp-c-bg);
}

.skeleton-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title-wrapper {
  flex: 1;
  margin-left: 12px;
}

.skeleton-card-title {
  height: 20px;
  width: 70%;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-badge {
  height: 16px;
  width: 40px;
  margin-top: 8px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
}

.skeleton-description {
  height: 16px;
  width: 100%;
  margin: 16px 0 8px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-description-short {
  height: 16px;
  width: 60%;
  margin-bottom: 16px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-link {
  height: 16px;
  width: 100px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-time-info {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.skeleton-time-item {
  height: 16px;
  width: 80px;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 50%,
    var(--vp-c-bg-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .skeleton-time {
    display: none; /* 移动端隐藏时间，与实际布局一致 */
  }

  .skeleton-icon {
    width: 28px;
    height: 28px;
  }

  .skeleton-card-title {
    width: 60%;
  }
}
</style>
