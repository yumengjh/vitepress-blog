---
page: true
title: 第 43 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(42,43)
</script>
<Page :posts="posts" :pageCurrent="43" :pagesNum="52" />