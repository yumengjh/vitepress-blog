---
page: true
title: 第 26 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(25,26)
</script>
<Page :posts="posts" :pageCurrent="26" :pagesNum="52" />