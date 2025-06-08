---
page: true
title: 第 19 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(18,19)
</script>
<Page :posts="posts" :pageCurrent="19" :pagesNum="52" />