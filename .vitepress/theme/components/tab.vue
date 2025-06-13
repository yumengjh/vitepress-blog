<template>
    <div class="wrap"
        :class="{ hasaside: frontmatter.aside, hassidebar: frontmatter.sidebar || theme?.sidebar?.length }">
        <div class="tools" v-for="(section, index) in sections" :key="index">
            <h2 class="h2" :id="section.title" tabindex="-1" @click="toggleSection(index)">
                {{ section.title }}
                <a class="header-anchor" :href="`#${section.title}`" aria-hidden="true"></a>
                <span class="collapse-icon" :class="{ 'is-collapsed': !expandedSections[index] }">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </h2>
            <div class="section-content" :class="{ 'is-collapsed': !expandedSections[index] }">
                <div v-if="loadingSections[index]" class="loading">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                </div>
                <ul v-else class="ul">
                    <li class="li" v-for="(cell, key) in section.items">
                        <div class="h3">
                            <div class="icon">
                                <!-- SVG 图标 -->
                                <svg v-if="isSvg(cell?.icon)" class="svg-icon" v-html="cell.icon"></svg>
                                <!-- 网络图片 -->
                                <img v-else alt="" class="img" :src="cell?.icon || getFavicon(cell?.link)"
                                    @error="handleImageError($event, cell)" />
                            </div>
                            <a class="a" target="_blank" :href="cell?.link">
                                <span class="title">{{ cell.title }}</span>
                                <span v-if="cell.badge" :class="['badge', cell.badgeType || 'default']">{{ cell.badge
                                    }}</span>
                                <span class="bg"></span>
                            </a>
                        </div>

                        <p class="desc" v-if="cell.desc">{{ cell.desc }}</p>
                        <p class="link">
                            <svg class="svg" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
                                    fill="currentColor"></path>
                            </svg><span class="span">{{ cell.linktxt }}</span>
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script lang="js" setup>
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'

const { theme, frontmatter } = useData();

// 工具分类列表
const sections = ref([])
const expandedSections = ref({})
const loadingSections = ref({})

// 判断是否为 SVG
const isSvg = (icon) => {
    if (!icon) return false
    return icon.trim().startsWith('<svg')
}

// 从 localStorage 获取折叠状态
const getStoredExpandedState = (sectionId) => {
    const stored = localStorage.getItem(`section-${sectionId}-expanded`)
    return stored !== null ? JSON.parse(stored) : null
}

// 保存折叠状态到 localStorage
const saveExpandedState = (sectionId, isExpanded) => {
    localStorage.setItem(`section-${sectionId}-expanded`, JSON.stringify(isExpanded))
}

// 动态导入工具数据
const loadSection = async (index) => {
    if (loadingSections.value[index]) return
    
    loadingSections.value[index] = true
    try {
        const modules = import.meta.glob('../../data/*.json')
        const module = await modules[`../../data/${sections.value[index].id}.json`]()
        sections.value[index] = {
            ...sections.value[index],
            ...module.default
        }
    } catch (error) {
        console.error(`Failed to load section ${sections.value[index].id}:`, error)
    } finally {
        loadingSections.value[index] = false
    }
}

// 切换折叠状态
const toggleSection = async (index) => {
    const sectionId = sections.value[index].id
    expandedSections.value[index] = !expandedSections.value[index]
    saveExpandedState(sectionId, expandedSections.value[index])
    
    if (expandedSections.value[index]) {
        await loadSection(index)
    }
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

// 初始化
onMounted(async () => {
    // 初始化工具分类
    sections.value = [
        { id: 'recent', title: '最近访问' },
        { id: 'common', title: '常用库' },
        { id: 'blog', title: '博客' },
        { id: 'design', title: '设计' },
        { id: 'tools', title: '工具' },
        { id: 'dev', title: '开发' },
        { id: 'ai', title: '大厂AI' },
        { id: 'official', title: '常用官网' },
        { id: 'diversion', title: '娱乐' }
    ]

    // 设置初始折叠状态
    sections.value.forEach((section, index) => {
        // 优先使用存储的状态，其次使用默认值
        const storedState = getStoredExpandedState(section.id)
        expandedSections.value[index] = storedState !== null ? storedState : section.defaultExpanded || false
        loadingSections.value[index] = false
    })

    // 加载默认展开的部分
    for (let i = 0; i < sections.value.length; i++) {
        if (expandedSections.value[i]) {
            await loadSection(i)
        }
    }
})
</script>

<style scoped>
a {
    text-decoration: none;
}

.tools {
    font-family: 'PingFang SC', 'Microsoft Yahei', sans-serif;
    padding-bottom: 1rem;
    .h2 {
        margin: 24px 0 8px;
        padding: 24px 32px 0 0;
        border: none;
        letter-spacing: -0.02em;
        line-height: 26px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        position: relative;

        &:hover {
            color: var(--vp-c-brand);
        }
    }

    .collapse-icon {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: transform 0.3s ease;

        svg {
            width: 20px;
            height: 20px;
            color: var(--vp-c-text-2);
            transition: color 0.3s ease;
        }

        &:hover svg {
            color: var(--vp-c-brand);
        }

        &.is-collapsed {
            transform: rotate(-90deg) translateX(50%);
        }
    }

    .ul {
        margin: 20px 0 0;
        padding: 0;
        display: grid;
        gap: 1.2rem;

        .li {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            flex-shrink: 1;
            flex-grow: 1;
            border-radius: 8px;
            border: .5px solid var(--vp-c-gray-soft);
            background: var(--vp-c-bg-elv);
            transition: box-shadow 0.3s cubic-bezier(.4, 0, .2, 1);
            overflow: hidden;
            padding: 16px;
            box-shadow: var(--vp-shadow-1);

            &:hover {
                box-shadow: var(--vp-shadow-3);
                background-color: var(--vp-c-bg-elv);

                .link {
                    color: var(--vp-c-brand);
                }
            }

            .h3 {
                display: flex;
                flex-direction: row;
                margin: 0;
                padding: 0;
                border: none;
                font-size: 1rem;
                line-height: 1.75rem;
                font-weight: 600;

                .icon {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 8px;

                    .img {
                        width: 33px;
                        height: 33px;
                    }

                    .svg-icon {
                        width: 33px;
                        height: 33px;
                        fill: var(--vp-c-text-1);
                    }
                }

                .a {
                    color: var(--vp-c-text-1);
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .badge {
                        font-size: 12px;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-weight: 500;
                        line-height: 14px;
                        white-space: nowrap;

                        &.hot {
                            background-color: rgba(234, 67, 53, 0.1);
                            color: #ea4335;
                        }

                        &.new {
                            background-color: rgba(28, 135, 25, 0.1);
                            color: #1c8719;
                        }

                        &.beta {
                            background-color: rgba(234, 179, 8, 0.1);
                            color: #eab308;
                        }

                        &.default {
                            background-color: var(--vp-c-bg-alt);
                            color: var(--vp-c-text-2);
                        }
                    }

                    .title {
                        position: relative;
                        z-index: 10;
                        font-size: 1rem;
                        line-height: 1.75rem;
                        font-weight: 600;
                    }
                }
            }

            .desc {
                position: relative;
                z-index: 10;
                margin: 0.5rem 0 0;
                font-size: .8rem;
                line-height: 1.5rem;
                opacity: .8;
            }

            .link {
                position: relative;
                z-index: 10;
                margin: 10px 0 0;
                display: flex;
                font-size: .875rem;
                line-height: 1.5rem;
                font-weight: 500;
                opacity: .8;
                transition: .15s;

                .svg {
                    width: 1.5rem;
                    height: 1.5rem;
                }

                .span {
                    margin-left: 0.5rem;
                }
            }
        }
    }
}

.section-content {
    max-height: 2000px;
    opacity: 1;
    transition: all 0.3s ease;
    overflow: hidden;

    &.is-collapsed {
        max-height: 0;
        opacity: 0;
        margin: 0;
    }
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--vp-c-text-2);
}

.loading-spinner {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    border: 2px solid var(--vp-c-text-2);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 响应式布局 */
@media (min-width: 550px) {
    .tools .ul {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 768px) {
    .wrap:not(.hasaside):not(.hassidebar) .tools .ul,
    .wrap.hassidebar:not(.hasaside) .tools .ul {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 960px) {
    .wrap:not(.hassidebar):not(.hasaside) .tools .ul {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
