<script setup>
import {ref} from "vue";
import Lobby from "@/components/lobby/Lobby.vue";

const gameStatus = ref('lobby')
</script>

<template>
  <div>
    <div class="hero min-h-screen">
      <div class="hero-content text-center w-full">
        <template v-if="true">
          <Lobby v-if="gameStatus === 'lobby'" />
<!--          <running v-if="gameStatus === 'running'" />
          <finished v-if="gameStatus === 'finished'" />-->
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>