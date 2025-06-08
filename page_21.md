---
page: true
title: 第 21 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(20,21)
</script>
<Page :posts="posts" :pageCurrent="21" :pagesNum="52" />