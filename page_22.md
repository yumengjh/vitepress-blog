---
page: true
title: 第 22 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(21,22)
</script>
<Page :posts="posts" :pageCurrent="22" :pagesNum="52" />