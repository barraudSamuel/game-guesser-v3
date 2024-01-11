<script setup>
import {ref} from "vue";
import Lobby from "@/components/lobby/Lobby.vue";
import Running from "@/components/running/Running.vue";
import {useGameStore} from "@/stores/game.js";
import Finished from "@/components/finished/Finished.vue";
const gameStore = useGameStore()
</script>

<template>
  <div>
    <div class="hero min-h-screen">
      <div class="hero-content text-center w-full">
        <template v-if="true">
          <Lobby v-if="gameStore.game.status === 'pending'" />
          <Running v-if="gameStore.game.status === 'running'" />
          <Finished v-if="gameStore.game.status === 'finished'" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>