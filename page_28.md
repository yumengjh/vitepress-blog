---
page: true
title: 第 28 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(27,28)
</script>
<Page :posts="posts" :pageCurrent="28" :pagesNum="52" />