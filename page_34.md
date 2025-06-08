---
page: true
title: 第 34 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(33,34)
</script>
<Page :posts="posts" :pageCurrent="34" :pagesNum="52" />