<template>
  <div class="max-w-7xl mx-auto w-full">
    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <RunningPlayground />
      </div>
      <div>
        <Users />
      </div>
    </div>
  </div>
</template>

<script setup >
import RunningPlayground from "@/components/running/RunningPlayground.vue";
import Users from "@/components/users/Users.vue";

</script>

<style scoped>

</style>