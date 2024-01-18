<script setup>

import User from "@/components/users/User.vue";
import {useGameStore} from "@/stores/game.js";
import {orderUserByScore} from "@/utils/users.js";

const gameStore = useGameStore()

</script>

<template>
  <div class="card w-full bg-base-300 shadow-xl">
    <div class="card-body relative">
      <div class="tooltip tooltip-left absolute right-3 top-2" data-tip="Les points sont calculés en fonction du nombre de joueurs dans la partie. Plus vous répondez en premier, plus vous gagnez de points.">
        <i class="ri-information-line text-2xl"></i>
      </div>
      <h2 class="card-title">Liste des joueurs : ({{ gameStore.game.users.length }}/300)</h2>
      <div class="grid grid-cols-1 gap-2">
        <User v-for="user in gameStore.game.users.sort(orderUserByScore)" :key="user.id" :user="user" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>