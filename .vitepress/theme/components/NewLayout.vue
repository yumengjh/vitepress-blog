<template>
    <Layout>
        <template #nav-bar-content-after>
            <!-- 导航栏内容后 -->
            <CustomNavbar />
        </template>
        <template #doc-before>
            <div class="post-info" v-if="!$frontmatter.page">
                <div class="post-info-left">
                    <span class="post-date">
                        {{ $frontmatter.date?.substring(0, 10) }}
                    </span>
                    <div class="post-tags">
                        <a v-for="item in $frontmatter.tags" :key="item" class="post-tag meta-bg"
                            :href="withBase(`/pages/tags.html?tag=${item}`)">
                            {{ item }}
                        </a>
                    </div>
                </div>
                <div class="post-info-right" v-if="lastUpdated && $frontmatter.date">
                    <span class="post-updated meta-bg" :title="formatDate(lastUpdated, 'YYYY-MM-DD HH:mm:ss')">
                        {{ updateText }}: {{ displayUpdatedTime }}
                    </span>
                </div>
            </div>

            <!-- 文章简介 -->
            <!-- <div class="post-description" v-if="$frontmatter.description && $frontmatter.date">
                <p>{{ $frontmatter.description }}</p>
            </div> -->
        </template>
        <template #doc-footer-before>
            <!-- 文档页脚前 - 原评论系统位置 -->
            <Giscus />
        </template>
        <!-- 6. 未找到页面插槽 -->
        <template #not-found>
            <!-- <NotFound /> -->
        </template>
    </Layout>
    <!-- <Copyright /> -->
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
// import Copyright from './Copyright.vue'
import CustomNavbar from './CustomNavbar.vue'
// import NotFound from './notfound.vue'
import Giscus from './giscus.vue'
import { withBase, useData } from "vitepress"
import { computed } from 'vue'
import { getRelativeTime, formatDate } from '../functions'
const { Layout } = DefaultTheme

// 获取页面数据，包括最后更新时间
const { page, theme } = useData()

const updateText = computed(() => theme.value.website.updateText)
const RelativeTimeTextNow = computed(() => theme.value.website.RelativeTimeText.now)
const RelativeTimeTextMinute = computed(() => theme.value.website.RelativeTimeText.minute)
const RelativeTimeTextHour = computed(() => theme.value.website.RelativeTimeText.hour)
const RelativeTimeTextDay = computed(() => theme.value.website.RelativeTimeText.day)
const RelativeTimeTextFront = computed(() => theme.value.website.UpdateTextsuffix.front)
const RelativeTimeTextBack = computed(() => theme.value.website.UpdateTextsuffix.back)

// 计算最后更新时间
const lastUpdated = computed(() => page.value.lastUpdated)
// 计算显示的更新时间（相对或绝对）
const displayUpdatedTime = computed(() => {
    if (!lastUpdated.value) return ''

    // 使用相对时间函数，3天内显示相对时间，否则显示绝对日期
    return getRelativeTime(lastUpdated.value, {
        maxDays: 3,  // 3天以内使用相对时间
        format: 'YYYY-MM-DD', // 超过时显示月日
        suffix: true,  // 显示"前"后缀
        texts: {
            now: RelativeTimeTextNow.value,
            minute: RelativeTimeTextMinute.value,
            hour: RelativeTimeTextHour.value,
            day: RelativeTimeTextDay.value,
            front: RelativeTimeTextFront.value,
            back: RelativeTimeTextBack.value
        }
    })
})
</script>

<style scoped>
.post-info {
    margin: 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.post-info-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.post-info-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.meta-bg {
    background: var(--vp-c-bg-alt);
    padding: 0px 6px;
    border-radius: 5px;
}

.post-date {
    font-family: var(--date-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 500;
    font-size: 0.8rem;
    white-space: nowrap;
}

.post-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.post-tag {
    text-decoration: none;
    font-size: 0.8rem;
    transition: opacity 0.2s;
}

.post-tag:hover {
    opacity: 0.8;
}

.post-updated {
    font-family: var(--date-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    white-space: nowrap;
    font-size: 0.8rem;
}

/* 文章简介样式 */
/* .post-description {
    margin: 1rem 0 1.5rem;
    padding: 12px 16px;
    border-radius: 2px;
    line-height: 1.6;
    font-size: 0.95rem;
    color: var(--vp-c-text-2);
    border-left: 4px solid var(--vp-c-border);
} */

.post-description p {
    margin: 0;
}

@media screen and (max-width: 768px) {
    .post-info {
        flex-direction: column;
        align-items: flex-start;
        /* margin: 0.75rem 0 0rem; */
        gap: 10px;
    }

    .post-info-left {
        gap: 12px;
    }

    .post-date,
    .post-tag,
    .post-updated {
        padding: 2px 8px;
    }

    .post-date{
        padding-left: 0;
    }

    .post-tags {
        gap: 6px;
    }

    .post-updated{
        display: none;
    }
}
</style>
