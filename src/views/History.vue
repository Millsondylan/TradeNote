<template>
  <div class="history-view">
    <ReactWrapper :component="HistoryComponent" />
  </div>
</template>

<script setup>
import ReactWrapper from '../components/ReactWrapper.vue'
import HistoryComponent from '../pages/History.tsx'

// Set page ID for navigation highlighting
import { pageId } from '../stores/globals'
pageId.value = 'history'
</script>

<style scoped>
.history-view {
  height: 100vh;
  overflow: hidden;
}
</style> 