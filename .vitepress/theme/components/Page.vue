<template>
  <div>
    <div v-for="(article, index) in posts" :key="index" class="post-item">
      <div class="post-header">
        <h2 class="post-title">
          <a :href="withBase(article.regularPath)">
            {{ article.frontMatter.title }}
          </a>
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
          :href="pageCurrent > 2 ? withBase(`/page_${pageCurrent - 1}.html`) : withBase('/index.html')">
          <!-- <svg style="transform: scaleX(-1)" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M6 14h2q0-1.475 1.075-2.488T11.65 10.5q.9 0 1.675.413T14.6 12H13v2h5V9h-2v1.55q-.8-.95-1.912-1.5T11.65 8.5q-2.375 0-4.012 1.6T6 14m6 8q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8" />
          </svg> -->
          {{ theme.website.turnPagePrevText }}
        </a>
        <span v-else></span>
        <a v-if="pageCurrent < pagesNum" class="page-btn" :class="{ disabled: pageCurrent >= pagesNum }"
          :href="withBase(`/page_${pageCurrent + 1}.html`)">
          {{ theme.website.turnPageNextText }}
        </a>
      </template>
    </div>
  </div>
</template>

<script setup>
import { withBase, useData } from 'vitepress'
import { ref, onMounted } from 'vue'
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
        sentence.value = data.data[0].quote ;
      } else {
        throw new Error('返回数据格式错误');
      }
    })
    .catch(error => {
      console.error('获取句子失败:', error);
      sentence.value = defaultSentence;
    });
}
const { theme } = useData()
const props = defineProps({
  posts: Array,
  pageCurrent: Number,
  pagesNum: Number
})
onMounted(() => {
  // getSentence(); 
})
</script>

<style scoped>
.post-item {
  padding: 1.5rem 0;
  /* border-bottom: 1px solid var(--vp-c-divider); */
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

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
  /* font-weight: bold; */
  position: relative;
}

.post-title a::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background: var(--vp-c-text-2);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.6s;
}

.post-title a:hover {
  color: var(--vp-c-text-2);
}

.post-title a:hover::after {
  transform: scaleX(1);
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
