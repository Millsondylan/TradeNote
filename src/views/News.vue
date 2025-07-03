<template>
  <div class="news-view">
    <ReactWrapper component="News" />
  </div>
</template>

<script>
import ReactWrapper from '../components/ReactWrapper.vue'

export default {
  name: 'NewsView',
  components: {
    ReactWrapper
  }
}
</script>

<style scoped>
.news-view {
  height: 100%;
  width: 100%;
}
</style> 