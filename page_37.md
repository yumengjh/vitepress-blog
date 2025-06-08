---
page: true
title: 第 37 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(36,37)
</script>
<Page :posts="posts" :pageCurrent="37" :pagesNum="52" />