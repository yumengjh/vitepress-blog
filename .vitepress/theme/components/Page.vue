<template>
  <div>
    <div v-for="(article, index) in posts" :key="index" class="post-item">
      <div class="post-header">
        <h2 class="post-title">
          <a :href="withBase(article.regularPath)" @mouseenter="handleTitleHover">
            {{ article.frontMatter.title }}
          </a>
          <span class="sticky-icon" v-if="article.frontMatter.sticky">
          </span>
        </h2>
        <div class="post-meta">
          <time>{{ article.frontMatter.date }}</time>
          <div v-if="article.frontMatter.tags" class="post-tags">
            <a v-for="tag in article.frontMatter.tags" :key="tag" class="post-tag" :href="getTagUrl(tag)"
              :title="`${tag} → `">
              {{ tag }}
            </a>
          </div>
        </div>
      </div>
      <div class="post-excerpt" v-if="article.frontMatter.description">
        {{ article.frontMatter.description }}
      </div>
    </div>

    <div class="pagination" :class="{ 'pagination-center': pageCurrent === 1, 'pagination-between': pageCurrent > 1 }">
      <template v-if="theme.website.showPrevNextBtn">
        <a v-if="pageCurrent > 1" class="page-btn" :class="{ disabled: pageCurrent <= 1 }"
          :href="getPageUrl(pageCurrent - 1)">
          {{ theme.website.turnPagePrevText }}
        </a>
        <span v-else></span>
        <a v-if="pageCurrent < pagesNum" class="page-btn" :class="{ disabled: pageCurrent >= pagesNum }"
          :href="getPageUrl(pageCurrent + 1)">
          {{ theme.website.turnPageNextText }}
        </a>
      </template>
    </div>
  </div>
</template>

<script setup>
import { withBase, useData, useRoute } from 'vitepress'
import { computed } from 'vue'

// 处理标题链接的悬浮效果
const handleTitleHover = (event) => {
  const link = event.currentTarget;
  const rect = link.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const percentage = (mouseX / rect.width) * 100;

  // 设置 CSS 变量来控制背景位置
  link.style.setProperty('--hover-origin', `${percentage}%`);
}

const { theme } = useData()
const route = useRoute()
const props = defineProps({
  posts: Array,
  pageCurrent: Number,
  pagesNum: Number
})

// 检测当前页面的语言路径
const getCurrentLangPath = computed(() => {
  const path = route.path
  // 匹配 /{lang}/ 格式的路径，如 /en/, /ja/, /ko/ 等
  const langMatch = path.match(/^\/([a-z]{2})\//)
  return langMatch ? langMatch[1] : null
})

// 生成分页链接
const getPageUrl = (pageNum) => {
  const langPath = getCurrentLangPath.value

  if (pageNum === 1) {
    // 首页：如果有语言路径则返回 /{lang}/，否则返回 /
    return langPath ? withBase(`/${langPath}/`) : withBase('/')
  } else {
    // 分页：如果有语言路径则返回 /{lang}/page_{num}.html，否则返回 /page_{num}.html
    const prefix = langPath ? `/${langPath}` : ''
    return withBase(`${prefix}/page_${pageNum}.html`)
  }
}

// 生成标签链接
const getTagUrl = (tag) => {
  const langPath = getCurrentLangPath.value

  if (langPath) {
    // 如果有语言路径，则跳转到对应语言的标签页面
    return withBase(`/${langPath}/pages/tags?tag=${tag}`)
  } else {
    // 如果没有语言路径（中文），则跳转到中文标签页面
    return withBase(`/pages/tags?tag=${tag}`)
  }
}

</script>

<style scoped>
.post-item {
  --vp-c-text-1: #000;
}

.dark .post-item {
  --vp-c-text-1: #dfdfd6;
}

.post-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-item:first-child {
  padding-top: 0;
}

.post-header {
  margin-bottom: 1rem;
}

.post-title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.4;
  border: none;
}

.sticky-icon {
  fill: var(--vp-c-text-1);
  position: absolute;
  margin-left: 0.3rem;
}

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
}

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
  background-image: linear-gradient(var(--yu-common-color-1));
  background-size: 0 2px;
  background-repeat: no-repeat;
  background-position: var(--hover-origin, 0%) bottom;
  transition: background-size 0.6s;
}

.post-title a:hover {
  background-size: 100% 30px;
}

.post-meta {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
}

.post-tag {
  padding: 0rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: all 0.2s ease;
}

.post-tag:hover {
  color: var(--vp-c-text-2);
}

.post-excerpt {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 0.5rem;
}

.pagination {
  margin-top: 3em;
  display: flex;
  align-items: center;
}

.pagination-center {
  justify-content: flex-start;
}

.pagination-between {
  justify-content: space-between;
}

.page-btn {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 1rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover {
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.2rem;
  }

  .post-meta {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .post-excerpt {
    font-size: 0.9rem;
  }

  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .post-tag {
    font-size: 0.75rem;
    padding: 0rem 0.4rem;
  }
}
</style>
