<template>
  <div class="ai-coach-view">
    <ReactWrapper :component="AICoachComponent" />
  </div>
</template>

<script setup>
import ReactWrapper from '../components/ReactWrapper.vue'
import AICoachComponent from '../pages/AICoach.tsx'

// Set page ID for navigation highlighting
import { pageId } from '../stores/globals'
pageId.value = 'ai-coach'
</script>

<style scoped>
.ai-coach-view {
  height: 100vh;
  overflow: hidden;
}
</style> 