<script setup>
import LobbyForm from "@/components/lobby/LobbyForm.vue";
import Users from "@/components/users/Users.vue";
import {useGameStore} from "@/stores/game.js";
const gameStore = useGameStore()

</script>

<template>
  <div class="max-w-7xl w-full">
    <!--if user is the creator of the game-->
    <template v-if="gameStore.current_user.is_game_host">
      <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <LobbyForm />
        </div>
        <div>
          <Users />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="max-w-xl mx-auto w-full">
        <Users />
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>