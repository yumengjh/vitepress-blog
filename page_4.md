---
page: true
title: 第 4 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(45,60)
</script>
<Page :posts="posts" :pageCurrent="4" :pagesNum="6" />