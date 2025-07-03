<template>
  <div class="alarms-view">
    <ReactWrapper :component="AlarmsComponent" />
  </div>
</template>

<script setup>
import ReactWrapper from '../components/ReactWrapper.vue'
import AlarmsComponent from '../pages/Alarms.tsx'

// Set page ID for navigation highlighting
import { pageId } from '../stores/globals'
pageId.value = 'alarms'
</script>

<style scoped>
.alarms-view {
  height: 100vh;
  overflow: hidden;
}
</style> 