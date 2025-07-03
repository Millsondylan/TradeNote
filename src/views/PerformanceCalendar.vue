<template>
  <div class="performance-calendar-view">
    <ReactWrapper component="PerformanceCalendar" />
  </div>
</template>

<script>
import ReactWrapper from '../components/ReactWrapper.vue'

export default {
  name: 'PerformanceCalendarView',
  components: {
    ReactWrapper
  }
}
</script>

<style scoped>
.performance-calendar-view {
  height: 100%;
  width: 100%;
}
</style> 