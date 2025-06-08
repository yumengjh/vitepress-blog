---
page: true
title: 第 39 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(38,39)
</script>
<Page :posts="posts" :pageCurrent="39" :pagesNum="52" />