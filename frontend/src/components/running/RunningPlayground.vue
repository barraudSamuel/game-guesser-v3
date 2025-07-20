<template>
  <div class="card w-full bg-base-300 shadow-xl">
    <div class="card-body relative">
      <RunningVolume class="absolute right-3 top-2" />
      <div class="flex flex-col items-center justify-start">
        <h2 class="font-bold text-3xl">{{ gameStore.game.current_question_index }} / {{ gameStore.game.total_questions }}</h2>
        <RunningCover v-if="gameStore.game.current_question.question_type === 'blur'" class="mt-5" />
        <RunningOst v-if="gameStore.game.current_question.question_type === 'ost'" class="mt-5" />
        <RunningGradualReveal v-if="gameStore.game.current_question.question_type === 'gradual'" class="mt-5" />
        <RunningScreenshotReveal v-if="gameStore.game.current_question.question_type === 'screenshots'" class="mt-5" />
        <RunningForm class="w-full lg:w-96 mt-5" />
        <RunningCounter class="mt-5" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import RunningVolume from "@/components/running/RunningVolume.vue";
import RunningCover from "@/components/running/RunningCover.vue";
import RunningOst from "@/components/running/RunningOst.vue";
import RunningGradualReveal from "@/components/running/RunningGradualReveal.vue";
import RunningScreenshotReveal from "@/components/running/RunningScreenshotReveal.vue";
import RunningForm from "@/components/running/RunningForm.vue";
import RunningCounter from "@/components/running/RunningCounter.vue";

const gameStore = useGameStore()
</script>

<style scoped>

</style>
