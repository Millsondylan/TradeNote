<template>
  <div class="watchlist-view">
    <ReactWrapper :component="WatchlistComponent" />
  </div>
</template>

<script setup>
import ReactWrapper from '../components/ReactWrapper.vue'
import WatchlistComponent from '../pages/Watchlist.tsx'

// Set page ID for navigation highlighting
import { pageId } from '../stores/globals'
pageId.value = 'watchlist'
</script>

<style scoped>
.watchlist-view {
  height: 100vh;
  overflow: hidden;
}
</style> 