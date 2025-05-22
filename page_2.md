---
page: true
title: Page 2
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(19,38)
</script>
<Page :posts="posts" :pageCurrent="2" :pagesNum="3" />