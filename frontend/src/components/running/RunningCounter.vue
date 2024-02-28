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
import {computed, onMounted, onUnmounted, watch} from "vue";

const gameStore = useGameStore()
let interval = null;

const timePercent = computed(() => {
  return gameStore.game.remaining_time_for_question*100/gameStore.game.time_for_question;
});

const currentGameQuestionIndex = computed(()=>{
  return gameStore.game.current_question_index
})

watch(currentGameQuestionIndex,() => {
  clockTimer()
})

onMounted(()=> {
  clockTimer()
})

onUnmounted(()=> {
  clearInterval(interval)
})

const clockTimer = (()=> {
  gameStore.game.remaining_time_for_question = gameStore.game.time_for_question
  clearInterval(interval)
  interval = setInterval(()=>{
    gameStore.game.remaining_time_for_question = gameStore.game.remaining_time_for_question - 1
  },1000)
})

</script>

<style scoped>
.countdown > *:before {
  transition: all .4s cubic-bezier(1, 0, 0, 1);
}
</style>