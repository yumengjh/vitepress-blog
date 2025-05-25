---
page: true
title: Page 8
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(35,40)
</script>
<Page :posts="posts" :pageCurrent="8" :pagesNum="10" />