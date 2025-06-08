---
page: true
title: 第 41 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(40,41)
</script>
<Page :posts="posts" :pageCurrent="41" :pagesNum="52" />