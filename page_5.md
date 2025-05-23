---
page: true
title: Page 5
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(20,25)
</script>
<Page :posts="posts" :pageCurrent="5" :pagesNum="9" />