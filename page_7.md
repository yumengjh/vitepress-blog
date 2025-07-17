---
page: true
title: 第 7 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(30,35)
</script>
<Page :posts="posts" :pageCurrent="7" :pagesNum="16" />