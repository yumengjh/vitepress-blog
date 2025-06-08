---
page: true
title: 第 27 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(26,27)
</script>
<Page :posts="posts" :pageCurrent="27" :pagesNum="52" />