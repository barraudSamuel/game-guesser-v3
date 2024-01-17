<template>
  <div class="alert" :class="{'bg-error':toast.isError}">
    <div>
      <span>{{ content }}</span>
    </div>
  </div>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
  toast: {
    type: Object
  }
})

const content = computed(() => {
  if (props.toast.content === 'game-full-started') return 'Partie pleine ou en cours'
  if (props.toast.content === 'game-not-found') return 'Partie introuvable'
  else {
    return props.toast.content
  }
})
</script>

<style scoped>

</style>