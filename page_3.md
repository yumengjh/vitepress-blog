---
page: true
title: 第 3 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(28,42)
</script>
<Page :posts="posts" :pageCurrent="3" :pagesNum="3" />