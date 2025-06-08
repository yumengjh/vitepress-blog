---
page: true
title: 第 40 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(39,40)
</script>
<Page :posts="posts" :pageCurrent="40" :pagesNum="52" />