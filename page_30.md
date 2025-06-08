---
page: true
title: 第 30 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(29,30)
</script>
<Page :posts="posts" :pageCurrent="30" :pagesNum="52" />