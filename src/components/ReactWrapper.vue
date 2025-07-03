<template>
  <div ref="reactContainer" class="react-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  component: {
    type: Function,
    required: true
  },
  props: {
    type: Object,
    default: () => ({})
  }
})

const reactContainer = ref(null)
let reactRoot = null

onMounted(async () => {
  try {
    // Dynamically import React and ReactDOM
    const React = await import('react')
    const ReactDOM = await import('react-dom/client')
    
    // Create React root and render component
    reactRoot = ReactDOM.createRoot(reactContainer.value)
    reactRoot.render(React.createElement(props.component, props.props))
  } catch (error) {
    console.error('Error mounting React component:', error)
  }
})

onUnmounted(() => {
  if (reactRoot) {
    reactRoot.unmount()
  }
})
</script>

<style scoped>
.react-wrapper {
  width: 100%;
  height: 100%;
}
</style> 