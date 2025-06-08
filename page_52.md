---
page: true
title: 第 52 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(51,52)
</script>
<Page :posts="posts" :pageCurrent="52" :pagesNum="52" />