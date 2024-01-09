<template>
  <div class="toast toast-start">
    <Toast v-for="(toast,index) in toastStore.toasts" :key="index" :toast="toast" />
  </div>
</template>

<script setup>
import Toast from '@/components/toasts/toast.vue'
import { useToastsStore } from '@/stores/toasts'
const toastStore = useToastsStore();
</script>

<style scoped>

</style>