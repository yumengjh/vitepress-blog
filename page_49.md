---
page: true
title: 第 49 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(48,49)
</script>
<Page :posts="posts" :pageCurrent="49" :pagesNum="52" />