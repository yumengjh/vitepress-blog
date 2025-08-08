<template>
    <div class="tags">
        <span @click="toggleTag(String(key))" v-for="(_, key) in currentData" class="tag"
            :class="{ 'tag-active': selectTag === key }">
            {{ key }} <sup>{{ currentData[key].length }}</sup>
        </span>
    </div>
    <div class="tag-header">{{ selectTag }}</div>
    <div class="posts-container">
        <a :href="withBase(article.regularPath)" v-for="(article, index) in selectTag ? currentData[selectTag] : []"
            :key="index" class="posts">
            <div class="post-container">
                <span class="post-title">{{ article.frontMatter.title }}</span>
            </div>
            <div class="date">{{ article.frontMatter.date }}</div>
        </a>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useData, withBase, useRoute } from 'vitepress'
import { initTags } from '../functions'

const { theme } = useData()
const route = useRoute()

// 检测当前页面的语言路径
const getCurrentLangPath = computed(() => {
    const path = route.path
    // 匹配 /{lang}/ 格式的路径，如 /en/, /ja/, /ko/ 等
    const langMatch = path.match(/^\/([a-z]{2})\//)
    return langMatch ? langMatch[1] : 'root'
})

let selectTag = ref('')
let currentData = ref({})

// 从URL中获取tag参数
function getTagFromUrl() {
    const url = window.location.href
    const urlObj = new URL(url)
    return urlObj.searchParams.get('tag')
}

// 切换标签并更新URL
const toggleTag = (tag) => {
    selectTag.value = tag
    // 更新URL，但不刷新页面
    const url = new URL(window.location.href)
    url.searchParams.set('tag', tag)
    window.history.pushState({}, '', url.toString())
}

// 更新数据
const updateData = async () => {
    try {
        const langKey = getCurrentLangPath.value
        
        // 直接从主题配置中获取对应语言的文章
        let posts = []
        if (theme.value.posts && theme.value.posts[langKey]) {
            posts = theme.value.posts[langKey]
        } else if (langKey === 'root' && theme.value.posts && theme.value.posts.root) {
            posts = theme.value.posts.root
        } else {
            console.warn(`未找到${langKey}语言的文章数据`)
            posts = []
        }
        
        // 生成标签数据
        currentData.value = initTags(posts)
        
        // 重新设置选中的标签
        const tagFromUrl = getTagFromUrl()
        if (tagFromUrl && currentData.value[tagFromUrl]) {
            selectTag.value = tagFromUrl
        } else {
            // 选择第一个可用的标签
            const firstTag = Object.keys(currentData.value)[0]
            if (firstTag) {
                selectTag.value = firstTag
            }
        }
    } catch (error) {
        console.error('更新标签数据失败:', error)
        currentData.value = {}
    }
}

// 监听语言变化，重新获取数据
watch(() => getCurrentLangPath.value, async () => {
    await updateData()
})

// 组件挂载时初始化
onMounted(async () => {
    await updateData()
})
</script>

<style scoped>
.posts-container {
    margin-top: 0rem !important;
}

.posts {
    padding: 0.75rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    /* border-bottom: 1px solid var(--vp-c-divider); */
    transition: all 0.2s ease;
}

.post-container {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    color: var(--vp-c-text-1);
    font-size: 0.9375rem;
    font-weight: 400;
    transition: color 0.2s;
}


.post-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 1rem;
}

.post-title:hover {
    color: var(--vp-c-text-2);
}

.date {
    flex-shrink: 0;
    font-family: var(--date-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 500;
    font-size: 1rem;
    opacity: 0.8;
    color: var(--vp-c-text-2);
}

.tags {
    margin: 1.5rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.1s ease;
    background-color: var(--vp-c-bg-alt);
    border-radius: 3px;
}

.tag:hover {
    background-color: var(--vp-c-divider);
}

.tag-active {
    background-color: var(--vp-c-divider);
}

.tag sup {
    font-weight: 600;
    font-size: 0.75rem;
    opacity: 0.8;
    border-radius: 50%;
    line-height: 21px;
    position: relative;
    top: -8px;
    right: -6px;
}

.tag-header {
    margin: 2rem 0 0.5rem;
    padding-bottom: 1rem;
    font-size: 1.75rem;
    font-weight: 400;
}

@media screen and (max-width: 768px) {
    .posts {
        padding: 0.625rem 0;
    }

    .post-container {
        font-size: 0.875rem;
    }

    .post-title {
        max-width: calc(100vw - 110px);
    }

    .date {
        font-size: 0.75rem;
    }

    .tag {
        padding: 4px 12px;
        font-size: 0.8125rem;
    }

    .tag sup {
        font-size: 0.6875rem;
        margin-left: 4px;
    }

    .tag-header {
        font-size: 1.25rem;
        margin: 1.5rem 0 1rem;
        padding-bottom: 0.75rem;
    }

    .tags {
        margin: 1rem 0;
        gap: 8px;
    }
}
</style>
