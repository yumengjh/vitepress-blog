---
page: true
title: 第 23 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(22,23)
</script>
<Page :posts="posts" :pageCurrent="23" :pagesNum="52" />