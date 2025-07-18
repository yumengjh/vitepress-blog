<template>
    <div class="giscus-wrapper" v-if="showComments">
        <div class="giscus" :key="currentPath"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useData } from 'vitepress';

const route = useRoute();
const { isDark, frontmatter, lang } = useData();
const currentPath = ref(route.path);

// 判断当前页面是否显示评论
const showComments = computed(() => {
    // 当comments明确设置为false时不显示评论，其他情况都显示
    return frontmatter.value.comments !== false;
});

// 根据当前主题计算Giscus主题
const giscusTheme = computed(() => {
    return isDark.value ? 'noborder_dark' : 'light';
});

// 根据当前语言计算Giscus语言
const giscusLang = computed(() => {
    // 根据VitePress的语言设置映射到Giscus支持的语言
    const langMap = {
        'zh-CN': 'zh-CN',
        'zh': 'zh-CN',
        'en-US': 'en',
        'en': 'en',
    };
    return langMap[lang.value] || 'en';
});

// 监听主题变化并更新Giscus
const updateGiscusTheme = () => {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    
    iframe.contentWindow.postMessage({
        giscus: {
            setConfig: {
                theme: giscusTheme.value
            }
        }
    }, 'https://giscus.app');
};

// 初始化Giscus评论区
const initGiscus = () => {
    // 如果不显示评论则直接返回
    if (!showComments.value) return;
    
    // 清理可能存在的旧脚本
    const existingScript = document.querySelector('.giscus-script');
    if (existingScript) {
        existingScript.remove();
    }
    
    // 清理评论容器
    const giscusContainer = document.querySelector('.giscus');
    if (giscusContainer) {
        giscusContainer.innerHTML = '';
    }

    // 创建新的giscus脚本
    const script = document.createElement('script');
    script.className = 'giscus-script';
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "myfishdream/note");
    script.setAttribute("data-repo-id", "R_kgDOOUvf2Q");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOOUvf2c4Co05c");
    script.setAttribute("data-mapping", "url");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", giscusTheme.value);
    script.setAttribute("data-lang", giscusLang.value);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
    
    // 添加到giscus容器
    if (giscusContainer) {
        giscusContainer.appendChild(script);
    }
};

// 监听路由变化
watch(() => route.path, (newPath) => {
    if (newPath !== currentPath.value) {
        currentPath.value = newPath;
        // 等待DOM更新后再初始化Giscus
        setTimeout(() => {
            initGiscus();
        }, 100);
    }
});

// 监听主题变化
watch(() => isDark.value, () => {
    updateGiscusTheme();
});

// 监听语言变化
watch(() => lang.value, () => {
    // 语言变化时重新初始化Giscus
    setTimeout(() => {
        initGiscus();
    }, 100);
});

onMounted(() => {
    initGiscus();
});
</script>

<style>
.giscus-wrapper {
    width: 100%;
    margin-top: 2rem;
}

.giscus {
    width: 100%;
    min-height: 150px;
}
</style>