<template>
  <div class="alert" :class="`alert-${props.toast.type}`">
    <div>
      <span>{{ props.toast.content }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  toast: {
    type: Object
  }
})
</script>

<style scoped>

</style>