---
page: true
title: 第 25 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(24,25)
</script>
<Page :posts="posts" :pageCurrent="25" :pagesNum="52" />