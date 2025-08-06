<template>
    <div class="twikoo-wrapper vp-raw" v-if="showComments" >
        <div id="tcomment" :key="currentPath"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick } from 'vue';
import { useRoute, useData } from 'vitepress';

const route = useRoute();
const { isDark, frontmatter, lang } = useData();
const currentPath = ref(route.path);

// 判断当前页面是否显示评论
const showComments = computed(() => {
    // 当comments明确设置为false时不显示评论，其他情况都显示
    return frontmatter.value.comments !== false;
});

// 根据当前主题计算Twikoo主题
const twikooTheme = computed(() => {
    return isDark.value ? 'dark' : 'light';
});

// 根据当前语言计算Twikoo语言
const twikooLang = computed(() => {
    // 根据VitePress的语言设置映射到Twikoo支持的语言
    const langMap = {
        'zh-CN': 'zh-CN',
        'zh': 'zh-CN',
        'en-US': 'en',
        'en': 'en',
    };
    return langMap[lang.value] || 'en';
});

// 初始化Twikoo评论区
const initTwikoo = async () => {
    // 如果不显示评论则直接返回
    if (!showComments.value) return;
    
    // 为什么这里需要判断 window 是否存在？
    // twikoo 库在运行时尝试访问 navigator 对象
    // vitepress 会在 ssr 时运行 twikoo 代码，导致 navigator 未定义
    // 所以需要在浏览器环境下才加载 twikoo, 避免 ssr 时报错
    if (typeof window !== 'undefined') {
        const twikoo = await import('twikoo');
        twikoo.init({
            envId: import.meta.env.VITE_TWIKOO_ENV_ID,
            el: '#tcomment',
            theme: twikooTheme.value,
            lang: twikooLang.value,
        });
    }
};

// 监听路由变化
watch(() => route.path, (newPath) => {
    if (newPath !== currentPath.value) {
        currentPath.value = newPath;
        // 等待DOM更新后再初始化Twikoo
        setTimeout(() => {
            initTwikoo();
        }, 100);
    }
});

// 监听主题变化
watch(() => isDark.value, () => {
    // 主题变化时重新初始化twikoo
    setTimeout(() => {
        initTwikoo();
    }, 100);
});

// 监听语言变化
watch(() => lang.value, () => {
    // 语言变化时重新初始化twikoo
    setTimeout(() => {
        initTwikoo();
    }, 100);
});

onMounted(async () => {
    await nextTick();
    initTwikoo();
});
</script>

<style>
.twikoo-wrapper {
    width: 100%;
    margin-top: 2rem;
}

#tcomment {
    width: 100%;
    min-height: 150px;
}
</style>