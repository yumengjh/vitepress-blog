---
page: true
title: Page 6
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(25,30)
</script>
<Page :posts="posts" :pageCurrent="6" :pagesNum="10" />