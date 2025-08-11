<template>
    <Layout>
        <template #nav-bar-content-after>
            <!-- 导航栏内容后 -->
            <CustomNavbar />
        </template>
        <template #doc-before>
            <div class="post-info" v-if="!$frontmatter.page">
                <div class="post-info-left">
                    <div class="post-avatar">
                        <svg t="1754898988038" class="icon" viewBox="0 0 1225 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="9903" width="20" height="20">
                            <path
                                d="M 776.749 658.094 a 785.517 785.517 0 0 0 -138.964 -51.6008 a 302.677 302.677 0 0 0 153.031 -262.897 c 0 -166.782 -135.702 -302.484 -302.484 -302.484 S 185.918 176.814 185.918 343.596 a 302.642 302.642 0 0 0 149.961 261.126 a 754.385 754.385 0 0 0 -134.176 48.3735 c -57.2309 27.0632 -158.17 84.6625 -191.337 166.536 c -21.6962 53.5301 -9.08538 106.797 35.4646 149.997 c 15.0137 14.5401 46.3916 31.0096 165.291 42.8662 c 73.4548 7.31391 168.588 11.4006 267.861 11.5058 h 3.7008 c 98.2204 0 193.021 -3.91128 267.177 -11.0673 c 122.232 -11.7864 156.574 -28.975 171.78 -40.8842 c 49.1102 -38.4638 66.176 -88.6439 48.0227 -141.279 c -28.5365 -82.6805 -133.036 -143.682 -192.915 -172.675 Z M 256.076 343.596 c 0 -128.037 104.219 -232.326 232.309 -232.326 s 232.274 104.219 232.274 232.326 s -104.219 232.309 -232.326 232.309 S 256.076 471.703 256.076 343.596 Z m 622.314 573.221 c -0.859428 0.648956 -21.2226 15.1365 -133.159 26.081 c -71.1922 7.01574 -163.116 10.8393 -258.793 10.9446 h -3.75342 c -93.7829 0 -184.163 -3.63065 -255.127 -10.243 c -106.99 -9.99743 -130.686 -23.1344 -133.439 -24.8883 c -23.8535 -23.3624 -29.624 -45.8303 -18.697 -72.7357 c 17.4341 -43.024 75.8577 -91.4151 156.293 -129.458 c 82.0315 -38.7795 176.762 -61.9139 253.444 -61.9139 c 77.4187 0 174.99 24.9059 261.021 66.6495 C 828.735 761.208 888.983 812.072 903.278 853.658 c 5.57751 15.9783 7.73485 37.6044 -24.8883 63.1592 Z"
                                fill="currentColor" p-id="9904"></path>
                            <path
                                d="M 1220.74 775.239 c -26.9931 -97.6942 -178.112 -187.005 -324.127 -225.24 a 294.293 294.293 0 0 0 75.8752 -73.1566 A 315.305 315.305 0 0 0 1031.31 293.714 C 1031.31 131.756 899.524 0 737.583 0 a 26.309 26.309 0 0 0 0 52.6181 C 870.514 52.6181 978.697 160.766 978.697 293.714 c 0 113.024 -71.2273 212.226 -173.236 241.219 a 26.309 26.309 0 0 0 1.38561 50.9694 h 0.26309 c 0.631417 0.140315 1.28037 0.245551 1.92933 0.333247 l 0.526181 0.105236 c 77.2608 9.76942 162.239 38.3761 233.133 78.4886 c 70.0346 39.6039 116.444 84.9431 127.318 124.354 c 4.64793 16.8202 6.54218 42.5329 -30.3255 71.4027 c -2.36781 1.85917 -17.3289 11.5584 -79.997 20.942 a 26.309 26.309 0 0 0 3.84112 52.3199 a 27.0808 27.0808 0 0 0 3.92881 -0.28063 c 71.3325 -10.6639 93.9057 -23.1169 104.657 -31.5708 C 1228.91 857.569 1229.9 808.564 1220.74 775.239 Z"
                                fill="currentColor" p-id="9905"></path>
                        </svg>
                        <span>
                            {{ $frontmatter.author || author }}
                        </span>
                    </div>
                    <span class="post-date">
                        <svg t="1754898299064" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="8003" width="22">
                            <path
                                d="M512 929.959184c-230.4 0-417.959184-187.559184-417.959184-417.959184s187.559184-417.959184 417.959184-417.959184 417.959184 187.559184 417.959184 417.959184-187.559184 417.959184-417.959184 417.959184z m0-794.122449c-207.412245 0-376.163265 168.75102-376.163265 376.163265s168.75102 376.163265 376.163265 376.163265 376.163265-168.75102 376.163265-376.163265-168.75102-376.163265-376.163265-376.163265z"
                                fill="currentColor" p-id="8004"></path>
                            <path
                                d="M718.367347 538.122449h-208.979592c-11.493878 0-20.897959-9.404082-20.897959-20.897959s9.404082-20.897959 20.897959-20.897959h208.979592c11.493878 0 20.897959 9.404082 20.897959 20.897959s-9.404082 20.897959-20.897959 20.897959z"
                                fill="currentColor" p-id="8005"></path>
                            <path
                                d="M509.387755 538.122449c-11.493878 0-20.897959-9.404082-20.897959-20.897959V256c0-11.493878 9.404082-20.897959 20.897959-20.897959s20.897959 9.404082 20.897959 20.897959v261.22449c0 11.493878-9.404082 20.897959-20.897959 20.897959z"
                                fill="currentColor" p-id="8006"></path>
                        </svg>
                        <span>
                            {{ $frontmatter.date?.substring(0, 10) }}
                        </span>
                    </span>
                    <div class="post-tags">
                        <svg t="1754898217810" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="6887" width="25">
                            <path
                                d="M448 853.333333L170.666667 576 576 170.666667H853.333333v277.333333L448 853.333333z m0-59.733333l362.666667-362.666667V213.333333h-217.6l-362.666667 362.666667 217.6 217.6zM682.666667 298.666667c25.6 0 42.666667 17.066667 42.666666 42.666666s-17.066667 42.666667-42.666666 42.666667-42.666667-17.066667-42.666667-42.666667 17.066667-42.666667 42.666667-42.666666z"
                                fill="currentColor" p-id="6888"></path>
                        </svg>
                        <a v-for="item in $frontmatter.tags" :key="item" class="post-tag meta-bg"
                            :href="withBase(`/pages/tags.html?tag=${item}`)">
                            {{ item }}
                        </a>
                    </div>
                </div>
                <div class="post-info-right">
                    <span v-if="lastUpdated && $frontmatter.date" class="post-updated"
                        :title="formatDate(lastUpdated, 'YYYY-MM-DD HH:mm:ss')">
                        {{ updateText }}: {{ displayUpdatedTime }}
                    </span>
                    <span v-else class="post-updated">
                        <svg t="1754899564988" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="11970" width="23">
                            <path
                                d="M816.864 192l-304.96 46.72L206.912 192 160 192l0 578.128 20.176 0L488.432 864 496 864l32 0 7.36 0 0-5.76 308.256-88.096 20.176 0L863.792 192 816.864 192zM493.184 832 192 740.288 192 224l12.48 0L496 268.656 496 832 493.184 832zM831.776 740.224l-303.792 86.832L527.984 268.624 819.296 224l12.48 0L831.776 740.224z"
                                p-id="11971" fill="currentColor"></path>
                        </svg>
                        <span :title="updateText + ': ' + $frontmatter.update || '--'">
                            {{ $frontmatter.update?.substring(0, 10) || '--' }}
                        </span>
                    </span>
                </div>
            </div>

            <!-- 文章简介 -->
            <!-- <div class="post-description" v-if="$frontmatter.description && $frontmatter.date">
                <p>{{ $frontmatter.description }}</p>
            </div> -->
        </template>
        <template #doc-footer-before>
            <!-- <Giscus /> -->
            <Twikoo />
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
// import Giscus from './giscus.vue'
import Twikoo from './twikoo.vue'
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
const author = computed(() => theme.value.website.author)

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
    color: var(--vp-c-text-3) !important;
    font-size: 0.8rem;
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
    background: var(--yu-code-background-color);
    padding: 0px 8px;
    border-radius: 6px;
}

.post-avatar {
    display: flex;
    align-items: center;
    gap: 6px;
}

.post-date {
    font-family: var(--date-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 500;
    font-size: 0.8rem;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
}

.post-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.post-tag {
    text-decoration: none;
    font-size: 0.7.5rem;
    transition: opacity 0.2s;
}

.post-tag:hover {
    opacity: 0.8;
}

.post-updated {
    font-family: var(--date-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    white-space: nowrap;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
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

    .post-date {
        padding-left: 0;
    }

    .post-tags {
        gap: 6px;
    }

    .post-updated {
        display: none;
    }
}
</style>
