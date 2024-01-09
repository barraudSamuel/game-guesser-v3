<script setup>
import { RouterView } from 'vue-router'
import Toasts from "@/components/toasts/Toasts.vue";

</script>

<template>
  <div class="relative">
    <div class="customBg fixed w-screen h-screen -z-10 top-0 left-0" />
    <Header/>
    <div>
      <RouterView />
    </div>
    <Toasts />
  </div>
</template>
<style scoped>
.customBg{
  opacity: 0.06;
  background-image: url("@/assets/images/main-bg.jpg");
  background-size: cover;
  background-position: center center;
}
</style>
