<template>
  <div class="relative">
    <div class="absolute top-0 left-0 w-full h-full z-10" />
    <canvas ref="canvas" width="300" height="400" class="canvas"></canvas>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {computed, onMounted, ref, watch} from "vue";

const gameStore = useGameStore()
const canvas = ref(null)
const currentGameQuestionIndex = computed(()=>{
  return gameStore.game.current_question_index
})
const currentGameTimeToAnswer = computed(()=>{
  return gameStore.game.remaining_time_for_question - 3
})

onMounted(()=>{
  loadCanvas()
})

const loadCanvas = () => {
  const ctx = canvas.value.getContext("2d")
  const img = new Image()
  img.onload = function () {
    let hRatio = canvas.value.width / img.width;
    let vRatio = canvas.value.height / img.height;
    let ratio = Math.min(hRatio, vRatio);
    let centerShift_x = (canvas.value.width - img.width * ratio) / 2;
    let centerShift_y = (canvas.value.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
    );
    canvas.value.style.webkitFilter = `blur(${currentGameTimeToAnswer.value}px)`;
  };
  img.src = gameStore.game.current_question.cover_url
}

// question change so the image change
watch(currentGameQuestionIndex,() => {
  loadCanvas()
})

// chrono change so the blur change too
watch(currentGameTimeToAnswer,()=>{
  canvas.value.style.webkitFilter = `blur(${currentGameTimeToAnswer.value}px)`;
})


</script>


<style scoped>

</style>