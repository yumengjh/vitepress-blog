---
page: true
title: 第 47 页
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(46,47)
</script>
<Page :posts="posts" :pageCurrent="47" :pagesNum="52" />