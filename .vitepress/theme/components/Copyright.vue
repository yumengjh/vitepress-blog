<template>
    <div class="site-footer">
        MIT Licensed | Copyright © 2024-2025 <a class="vitepress title" style="font-size: 1rem!important;" :href="website">{{ webTitle }}</a><br />
        Powered by <a class="vitepress" target="_blank" href="//vitepress.vuejs.org/">VitePress - 1.6.3</a>
        Theme by <a class="vitepress" target="_blank" href="https://github.com/yumengjh/vitepress-blog">Vitepress-Theme</a>
        <br /> 
    </div>
</template>
<script setup>
import { useData } from 'vitepress'

const { site, theme } = useData()
const website = theme.value.website.copyrightLink
const webTitle = site.value.title
</script>

<style>
.site-footer {
    color: #888;
    text-align: center;
    font-size: 0.75rem;
    width: 100%;
    margin-top: -60px;
    overflow: auto;
}
.vitepress {
    color: var(--vp-c-text-1);
    font-weight: 700;
}
</style>
