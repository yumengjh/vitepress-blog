---
page: true
title: 第 13 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(36,39)
</script>
<Page :posts="posts" :pageCurrent="13" :pagesNum="18" />