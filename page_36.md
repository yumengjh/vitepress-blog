---
page: true
title: 第 36 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(35,36)
</script>
<Page :posts="posts" :pageCurrent="36" :pagesNum="52" />