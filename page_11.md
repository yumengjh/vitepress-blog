---
page: true
title: 第 11 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(30,33)
</script>
<Page :posts="posts" :pageCurrent="11" :pagesNum="18" />