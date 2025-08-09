<template>
  <div>
    <div v-for="(article, index) in posts" :key="index" class="post-item">
      <div class="post-header">
        <h2 class="post-title">
          <a :href="withBase(article.regularPath)" @mouseenter="handleTitleHover">
            {{ article.frontMatter.title }}
          </a>
          <span class="sticky-icon" v-if="article.frontMatter.sticky">
            <svg t="1754660972034" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="8443" width="24" height="24">
              <path
                d="M730.112 815.701333H292.778667a34.133333 34.133333 0 0 1-34.133334-29.781333l-20.992-162.133333v-1.621334a566.357333 566.357333 0 0 1 156.074667-437.504l93.098667-96.853333a34.133333 34.133333 0 0 1 49.237333 0l93.098667 96.853333A566.357333 566.357333 0 0 1 785.066667 621.824v1.621333l-20.992 162.133334a34.133333 34.133333 0 0 1-33.962667 30.122666z m-407.296-68.266666H699.733333l17.066667-131.925334a497.749333 497.749333 0 0 0-136.533333-383.488l-68.266667-71.338666-68.266667 71.338666a497.749333 497.749333 0 0 0-137.984 383.488z"
                p-id="8444"></path>
              <path
                d="M511.402667 647.765333a154.624 154.624 0 1 1 154.709333-154.624 154.794667 154.794667 0 0 1-154.709333 154.624z m0-240.981333a86.357333 86.357333 0 1 0 86.442666 86.357333 86.442667 86.442667 0 0 0-86.442666-86.357333zM511.402667 938.666667a34.133333 34.133333 0 0 1-34.133334-34.133334V712.277333a34.133333 34.133333 0 0 1 68.266667 0V904.533333a34.133333 34.133333 0 0 1-34.133333 34.133334zM198.997333 946.688a34.133333 34.133333 0 0 1-33.450666-27.392C135.082667 768 257.792 679.509333 262.997333 675.84a34.133333 34.133333 0 1 1 39.509334 55.637333c-4.010667 2.901333-91.562667 67.669333-70.058667 174.336a34.133333 34.133333 0 0 1-26.709333 40.192 30.634667 30.634667 0 0 1-6.741334 0.682667zM825.002667 946.688a30.634667 30.634667 0 0 1-6.741334-0.682667 34.133333 34.133333 0 0 1-26.709333-40.192c21.76-107.946667-69.034667-173.653333-69.973333-174.250666a34.133333 34.133333 0 1 1 39.424-55.722667c5.205333 3.669333 128 92.416 97.450666 243.456a34.133333 34.133333 0 0 1-33.450666 27.392z"
                p-id="8445"></path>
            </svg>
          </span>
        </h2>
        <div class="post-meta">
          <time>{{ article.frontMatter.date }}</time>
          <div v-if="article.frontMatter.tags" class="post-tags">
            <a v-for="tag in article.frontMatter.tags" :key="tag" class="post-tag"
              :href="withBase(`/pages/tags?tag=${tag}`)" :title="`${tag} → `">
              <!-- <span style="margin-right: -5px;">#</span> -->
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
          <!-- <svg style="transform: scaleX(-1)" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M6 14h2q0-1.475 1.075-2.488T11.65 10.5q.9 0 1.675.413T14.6 12H13v2h5V9h-2v1.55q-.8-.95-1.912-1.5T11.65 8.5q-2.375 0-4.012 1.6T6 14m6 8q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8" />
          </svg> -->
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
import { ref, onMounted, computed } from 'vue'
let sentence = ref('Come on!');

const getSentence = () => {
  const defaultSentence = 'Come on!';
  fetch('https://api.yumeng.icu/v1/quote')
    .then(response => {
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.data[0]) {
        sentence.value = data.data[0].quote;
      } else {
        throw new Error('返回数据格式错误');
      }
    })
    .catch(error => {
      console.error('获取句子失败:', error);
      sentence.value = defaultSentence;
    });
}

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

onMounted(() => {
  // getSentence(); 
})
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
  /* font-weight: bold; */
  position: relative;
}

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
  /* font-weight: bold; */
  position: relative;
  background-image: linear-gradient(var(--vp-c-text-1));
  background-size: 0 2px;
  background-repeat: no-repeat;
  background-position: var(--hover-origin, 0%) bottom;
  transition: background-size 0.6s;
}

.post-title a:hover {
  background-size: 100% 2px;
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
  /* font-weight: bold; */
  border-radius: 9999px;
  /* background-color: var(--vp-c-bg-soft); */
  border: 1px solid var(--vp-c-divider);
  /* font-size: 0.8rem; */
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
