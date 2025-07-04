<template>
  <div class="login-view">
    <ReactWrapper component="Auth" />
  </div>
</template>

<script>
import ReactWrapper from '../components/ReactWrapper.vue'

export default {
  name: 'LoginView',
  components: {
    ReactWrapper
  }
}
</script>

<style scoped>
.login-view {
  height: 100%;
  width: 100%;
}
</style>
