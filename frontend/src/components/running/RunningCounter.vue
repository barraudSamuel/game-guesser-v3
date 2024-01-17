<template>
  <div>
    <div class="radial-progress flex justify-center items-center" :style="{'--value': timePercent,'--size':'80px', '--thickness': '4px'}">
      <span class="countdown font-bold text-xl">
        <span :style="`--value:${gameStore.game.remaining_time_for_question};`"></span>
      </span>
      <i class="ri-timer-line"></i>
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
.countdown > *:before {
  transition: all .4s cubic-bezier(1, 0, 0, 1);
}
</style>