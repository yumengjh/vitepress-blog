---
page: true
title: 魚の夢
aside: false
lastUpdated: false
comments: false
---
<script setup>
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.ja.slice(0,100)
</script>
<Page :posts="posts" :pageCurrent="1" :pagesNum="1" />