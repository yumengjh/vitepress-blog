<template>
    <div class="tags">
        <span 
            @click="toggleTag(String(key))" 
            v-for="(_, key) in data" 
            class="tag"
            :class="{ 'tag-active': selectTag === key }"
        >
            {{ key }} <sup>{{ data[key].length }}</sup>
        </span>
    </div>
    <div class="tag-header">{{ selectTag }}</div>
    <div class="posts-container">
        <a
            :href="withBase(article.regularPath)"
            v-for="(article, index) in selectTag ? data[selectTag] : []"
            :key="index"
            class="posts"
        >
            <div class="post-container">
                <span class="post-title">{{ article.frontMatter.title }}</span>
            </div>
            <div class="date">{{ article.frontMatter.date }}</div>
        </a>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useData, withBase } from 'vitepress'
import { initTags } from '../functions'

const { theme } = useData()
const data = computed(() => initTags(theme.value.posts || []))
let selectTag = ref('')

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

// 组件挂载时从URL中读取tag参数
onMounted(() => {
    const tagFromUrl = getTagFromUrl()
    if (tagFromUrl && data.value[tagFromUrl]) {
        // 如果URL中有tag参数且该标签存在，则选中该标签
        selectTag.value = tagFromUrl
    } else {
        // 否则选择第一个标签
        // const defaultDisplayTag = Object.keys(data.value)[0]
        // if (defaultDisplayTag) {
        //     toggleTag(defaultDisplayTag)
        // }
    }
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
    border: 1px solid var(--vp-c-divider);
    border-radius: 9999px;
}

.tag:hover {
    background-color: var(--vp-c-bg-soft);
}

.tag sup {
    margin-left: 6px;
    font-weight: 600;
    font-size: 0.75rem;
    opacity: 0.8;
    border-radius: 50%;
    background-color: inherit;
    border: 1px solid var(--vp-c-divider);
    padding: 2px 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 21px;
    height: 21px;
    line-height: 21px;
}

.tag-header {
    margin: 2rem 0 0.5rem;
    padding-bottom: 1rem;
    font-size: 1.75rem;
    font-weight: 600;
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
