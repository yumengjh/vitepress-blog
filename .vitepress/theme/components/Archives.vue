<template>
    <div class="archives-container">
        <div v-for="yearList in sortedPosts" :key="yearList[0]?.frontMatter.date" class="year-section">
            <!-- 年份标题 -->
            <div class="year-header">
                <div class="year-title">
                    <svg class="year-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>
                    </svg>
                    <span class="year-text">
                        {{ yearList[0]?.frontMatter.date.split('-')[0] }}
                    </span>
                    <span class="year-count">{{ yearList.length }} 篇</span>
                </div>
            </div>

            <!-- 文章列表 -->
            <div class="posts-list">
                <a 
                    v-for="(article, index) in yearList" 
                    :key="index"
                    :href="withBase(article.regularPath)"
                    class="post-item"
                >
                    <div class="post-content">
                        <div class="post-date">
                            {{ formatDate(article.frontMatter.date) }}
                        </div>
                        <h3 class="post-title">{{ article.frontMatter.title }}</h3>
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
                    <div class="post-arrow">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!sortedPosts.length" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48">
                <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h10v2H7zm0 4h7v2H7z" fill="currentColor"/>
            </svg>
            <p>暂无文章</p>
        </div>
    </div>
</template>

<script setup>
import { useData, withBase, useRoute } from 'vitepress'
import { computed } from 'vue'

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

// 按年份分组并排序文章
const sortedPosts = computed(() => {
    const posts = getCurrentLangPosts.value
    if (!posts || !posts.length) return []

    // 按年份分组
    const groupedByYear = {}
    posts.forEach(post => {
        const year = post.frontMatter.date.split('-')[0]
        if (!groupedByYear[year]) {
            groupedByYear[year] = []
        }
        groupedByYear[year].push(post)
    })

    // 转换为数组并按年份降序排序
    return Object.entries(groupedByYear)
        .sort(([yearA], [yearB]) => yearB - yearA)
        .map(([, posts]) => {
            // 每年内的文章按日期降序排序
            return posts.sort((a, b) => {
                return b.frontMatter.date.localeCompare(a.frontMatter.date)
            })
        })
})

// 格式化日期
const formatDate = (date) => {
    if (!date) return ''
    const [, month, day] = date.split('-')
    return `${month}.${day}`
}
</script>

<style scoped>
.archives-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

/* 年份部分 */
.year-section {
    margin-bottom: 3rem;
}

.year-header {
    margin-bottom: 1.5rem;
    position: relative;
}

.year-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.4;
    font-family: var(--date-font-family), serif;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--vp-c-divider);
}

.year-icon {
    color: var(--vp-c-brand);
    opacity: 0.9;
}

.year-text {
    background: linear-gradient(135deg, var(--vp-c-brand), var(--vp-c-brand-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.year-count {
    font-size: 0.875rem;
    color: var(--vp-c-text-3);
    font-weight: normal;
    background: var(--vp-c-bg-soft);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    margin-left: 0.5rem;
}

/* 文章列表 */
.posts-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 2.75rem;
}

.post-item {
    position: relative;
    padding: 1rem 1.25rem;
    text-decoration: none;
    border-radius: 8px;
    background: var(--vp-c-bg);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    transform: translateX(4px);
}

.post-item:hover::before {
    border-color: var(--vp-c-brand);
    opacity: 0.5;
}

.post-content {
    flex: 1;
    min-width: 0;
}

.post-date {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-family: var(--date-font-family), serif;
    color: var(--vp-c-brand);
}

.post-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--vp-c-text-1);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.post-tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.tag {
    color: var(--vp-c-brand);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    background: var(--vp-c-brand-dimm);
    white-space: nowrap;
}

.post-arrow {
    color: var(--vp-c-text-3);
    transition: transform 0.2s ease;
    flex-shrink: 0;
    opacity: 0;
    transform: translateX(-4px);
}

.post-item:hover .post-arrow {
    opacity: 1;
    transform: translateX(0);
    color: var(--vp-c-brand);
}

/* 空状态 */
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
    .archives-container {
        padding: 1rem;
    }

    .year-title {
        font-size: 1.5rem;
        padding-bottom: 0.5rem;
    }

    .posts-list {
        padding-left: 1rem;
    }

    .post-item {
        padding: 0.875rem 1rem;
    }

    .post-title {
        font-size: 0.9375rem;
    }

    .post-date {
        font-size: 0.8125rem;
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

:root[class*='dark'] .year-count {
    background: var(--vp-c-bg-mute);
}
</style>