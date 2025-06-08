---
page: true
title: 第 2 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(3,6)
</script>
<Page :posts="posts" :pageCurrent="2" :pagesNum="18" />