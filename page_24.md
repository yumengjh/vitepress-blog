---
page: true
title: 第 24 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(23,24)
</script>
<Page :posts="posts" :pageCurrent="24" :pagesNum="52" />