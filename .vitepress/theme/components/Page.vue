<template>
  <div>
    <div class="head">
      <h2 class="title">Blogs</h2>
      <div @click="getSentence" class="sentence">{{ sentence }}</div>
    </div>
    <div v-for="(article, index) in posts" :key="index" class="post-row">
      <a class="post-title-link" :href="withBase(article.regularPath)" :title="article.frontMatter.description">{{
        article.frontMatter.title }}</a>
      <span class="post-date">{{ article.frontMatter.date }}</span>
    </div>
    <div class="pagination" :class="{ 'pagination-center': pageCurrent === 1, 'pagination-between': pageCurrent > 1 }">
      <template v-if="theme.website.showPrevNextBtn">
        <a v-if="pageCurrent > 1" class="page-btn" :class="{ disabled: pageCurrent <= 1 }"
          :href="pageCurrent > 2 ? withBase(`/page_${pageCurrent - 1}.html`) : withBase('/index.html')">
          ← Previous Page
        </a>
        <span v-else></span>
        <a v-if="pageCurrent < pagesNum" class="page-btn" :class="{ disabled: pageCurrent >= pagesNum }"
          :href="withBase(`/page_${pageCurrent + 1}.html`)">
          → Next Page
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
  fetch('https://blog.yumeng.icu/api/sentence')
    .then(response => {
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.sentence) {
        sentence.value = data.sentence;
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
  getSentence();
})
</script>

<style scoped>
.head {
  margin-bottom: 10px !important;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .title {
    font-weight: bold !important;
  }

  h2 {
    border-bottom: none !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
}

.post-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 1.05rem;
}

.post-title-link {
  color: var(--yu-theme-title);
  text-decoration: none;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
}

.post-title-link:hover {
  color: var(--vp-c-text-2);
}

.post-date {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  white-space: nowrap;
  margin-left: 2em;
}

.pagination {
  margin-top: 2em;
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
  .post-row {
    font-size: 0.95rem;
    padding: 4px 0;
  }

  .post-title-link {
    font-size: 0.95rem;
  }

  .post-date {
    font-size: 0.85rem;
    margin-left: 1em;
  }

  .head {
    font-size: 0.8rem;
  }

  .sentence {
    display: none;
  }
}
</style>
