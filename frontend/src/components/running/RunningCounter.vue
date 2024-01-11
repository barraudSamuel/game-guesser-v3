<template>
  <div>
    <div class="radial-progress" :style="{'--value': timePercent,'--size':'80px', '--thickness': '4px'}">
      <span class="font-bold text-xl">{{ gameStore.game.remaining_time_for_question }}<i class="ri-timer-line"></i></span>
    </div>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {computed} from "vue";

const gameStore = useGameStore()

const timePercent = computed(() => {
  return gameStore.game.remaining_time_for_question*100/gameStore.game.time_for_question;
});

</script>

<style scoped>

</style>