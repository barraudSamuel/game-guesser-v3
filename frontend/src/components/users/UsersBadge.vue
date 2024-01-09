<script setup>
const props = defineProps({
  type:{
    type: String
  },
  tooltip: {
    type: String
  }
})
</script>

<template>
  <div class="avatar tooltip" :data-tip="props.tooltip">
    <div class="bg-warning w-8 mask mask-hexagon" v-show="props.type === 'admin'">
      <div class="flex items-center justify-center h-full">
        <i class="ri-admin-line text-xl text-white"></i>
      </div>
    </div>
    <div class="bg-success w-4 mask rounded-full" v-show="props.type === 'good_answer'">
      <div class="flex items-center justify-center h-full">
        <i class="ri-check-fill text-sm text-white"></i>
      </div>
    </div>
    <div class="bg-error w-4 mask rounded-full" v-show="props.type === 'bad_answer'">
      <div class="flex items-center justify-center h-full">
        <i class="ri-check-fill text-sm text-white"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>