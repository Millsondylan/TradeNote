<template>
  <div class="live-trades-view">
    <ReactWrapper :component="LiveTradesComponent" />
  </div>
</template>

<script setup>
import ReactWrapper from '../components/ReactWrapper.vue'
import LiveTradesComponent from '../pages/LiveTrades.tsx'

// Set page ID for navigation highlighting
import { pageId } from '../stores/globals'
pageId.value = 'live-trades'
</script>

<style scoped>
.live-trades-view {
  height: 100vh;
  overflow: hidden;
}
</style> 