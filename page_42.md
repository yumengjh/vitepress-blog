---
page: true
title: 第 42 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(41,42)
</script>
<Page :posts="posts" :pageCurrent="42" :pagesNum="52" />