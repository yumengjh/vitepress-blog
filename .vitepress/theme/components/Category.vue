<template>
    <div class="category-container">
        <div v-for="(posts, key) in data" :key="key" class="category-section">
            <div class="category-header">
                <div class="category-title">
                    <svg class="category-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M4 4C4 3.44772 4.44772 3 5 3H9C9.55228 3 10 3.44772 10 4V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V4Z" fill="currentColor"/>
                        <path d="M14 4C14 3.44772 14.4477 3 15 3H19C19.5523 3 20 3.44772 20 4V9C20 9.55228 19.5523 10 19 10H15C14.4477 10 14 9.55228 14 9V4Z" fill="currentColor"/>
                        <path d="M4 14C4 13.4477 4.44772 13 5 13H9C9.55228 13 10 13.4477 10 14V19C10 19.5523 9.55228 20 9 20H5C4.44772 20 4 19.5523 4 19V14Z" fill="currentColor"/>
                        <path d="M14 14C14 13.4477 14.4477 13 15 13H19C19.5523 13 20 13.4477 20 14V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V14Z" fill="currentColor"/>
                    </svg>
                    <span class="category-name">{{ key }}</span>
                    <span class="post-count">{{ posts.length }}</span>
                </div>
            </div>
            
            <div class="posts-list">
                <a 
                    v-for="(article, index) in posts" 
                    :key="`${key}-${index}`" 
                    :href="withBase(article.regularPath)"
                    class="post-item"
                >
                    <div class="post-content">
                        <h3 class="post-title">{{ article.frontMatter.title }}</h3>
                        <!-- <p v-if="article.frontMatter.description" class="post-desc">
                            {{ article.frontMatter.description }}
                        </p> -->
                    </div>
                    <div class="post-meta">
                        <time class="post-date">{{ formatDate(article.frontMatter.date) }}</time>
                        <div v-if="article.frontMatter.tags?.length" class="post-tags">
                            <span 
                                v-for="tag in article.frontMatter.tags.slice(0, 2)" 
                                :key="tag" 
                                class="tag"
                            >
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </a>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="Object.keys(data).length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
            </svg>
            <p>暂无分类文章</p>
        </div>
    </div>
</template>

<script setup>
import { useData, withBase, useRoute } from 'vitepress'
import { computed } from 'vue'
import { initCategory } from '../functions'

const { theme } = useData()
const route = useRoute()

// 检测当前页面的语言路径
const getCurrentLangPath = computed(() => {
    const path = route.path
    const langMatch = path.match(/^\/([a-z]{2})\//)
    return langMatch ? langMatch[1] : 'root'
})

// 获取当前语言的文章数据
const getCurrentLangPosts = computed(() => {
    const langKey = getCurrentLangPath.value
    if (theme.value.posts && theme.value.posts[langKey]) {
        return theme.value.posts[langKey]
    } else if (langKey === 'root' && theme.value.posts && theme.value.posts.root) {
        return theme.value.posts.root
    }
    console.warn(`未找到${langKey}语言的文章数据`)
    return []
})

// 生成分类数据
const data = computed(() => {
    const posts = getCurrentLangPosts.value
    if (!posts || posts.length === 0) {
        console.warn('没有找到文章数据')
        return {}
    }
    return initCategory(posts)
})

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<style scoped>
.category-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.category-section {
    margin-bottom: 3rem;
}

.category-header {
    margin-bottom: 1.5rem;
    position: relative;
}

.category-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
    line-height: 1.4;
}

.category-icon {
    color: var(--vp-c-brand);
    opacity: 0.9;
}

.category-name {
    position: relative;
    padding-right: 0.5rem;
}

.post-count {
    font-size: 0.875rem;
    color: var(--vp-c-text-3);
    font-weight: normal;
}

.posts-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.post-item {
    position: relative;
    padding: 1rem 1.25rem;
    text-decoration: none;
    border-radius: 8px;
    background: var(--vp-c-bg);
    transition: all 0.2s ease;
}

.post-item::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    transition: all 0.2s ease;
}

.post-item:hover {
    /* transform: translateY(-2px); */
}

.post-item:hover::before {
    border-color: var(--vp-c-brand);
    opacity: 0.5;
}

.post-content {
    margin-bottom: 0.75rem;
}

.post-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
    margin: 0;
    line-height: 1.4;
}

.post-desc {
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8125rem;
}

.post-date {
    color: var(--vp-c-text-3);
}

.post-tags {
    display: flex;
    gap: 0.5rem;
}

.tag {
    color: var(--vp-c-brand);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    background: var(--vp-c-brand-dimm);
    white-space: nowrap;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--vp-c-text-3);
}

.empty-icon {
    margin-bottom: 1rem;
    opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .category-container {
        padding: 1rem;
    }

    .category-title {
        font-size: 1.25rem;
    }

    .post-item {
        padding: 0.875rem 1rem;
    }
}

/* 深色模式适配 */
:root[class*='dark'] .post-item {
    background: var(--vp-c-bg-soft);
}

:root[class*='dark'] .post-item:hover {
    background: var(--vp-c-bg-mute);
}

:root[class*='dark'] .tag {
    background: var(--vp-c-brand-dimm);
    color: var(--vp-c-brand-light);
}
</style>