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

const showComments = computed(() => {
    return frontmatter.value.comments !== false;
});

const twikooTheme = computed(() => {
    return isDark.value ? 'dark' : 'light';
});

const twikooLang = computed(() => {
    const langMap = {
        'zh-CN': 'zh-CN',
        'zh': 'zh-CN',
        'en-US': 'en',
        'en': 'en',
    };
    return langMap[lang.value] || 'en';
});

const initTwikoo = async () => {
    if (!showComments.value) return;
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

watch(() => route.path, (newPath) => {
    if (newPath !== currentPath.value) {
        currentPath.value = newPath;
        setTimeout(() => {
            initTwikoo();
        }, 100);
    }
});

watch(() => isDark.value, () => {
    setTimeout(() => {
        initTwikoo();
    }, 100);
});

watch(() => lang.value, () => {
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