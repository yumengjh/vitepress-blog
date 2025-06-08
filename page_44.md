---
page: true
title: 第 44 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(43,44)
</script>
<Page :posts="posts" :pageCurrent="44" :pagesNum="52" />