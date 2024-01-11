<template>
  <div>
    <form @submit.prevent="submitAnswer" class="flex justify-center items-center">
      <div class="form-control w-full">
        <div class="input-group input-group-lg" :class="{'bad-answer':isAnswerBad}">
          <input ref="inputAnswer" type="text" placeholder="Réponse" v-model="answer" class="input w-full input-lg" :disabled="gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.uuid) || nbBadAnswer>=2 ||  isLoading">
          <button type="submit" class="btn btn-square btn-lg btn-primary" :class="{'!btn-success opacity-60 cursor-not-allowed':gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.uuid)}" :disabled="gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.uuid) || nbBadAnswer>=2 || isLoading">
            <i v-if="nbBadAnswer>=2" class="ri-hourglass-fill text-2xl"></i>
            <i v-if="!gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.uuid) && nbBadAnswer<2" class="ri-send-plane-2-line text-2xl"></i>
            <i v-if="gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.uuid)" class="ri-checkbox-circle-line text-2xl text-white"></i>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {computed, ref, watch} from "vue";
import {isGoodAnswer} from "@/utils/questions";
import { onKeyStroke } from '@vueuse/core'

const gameStore = useGameStore()

const answer = ref('')
const answerOld = ref('')
const nbBadAnswer = ref(0);
const setTimeOutId = ref(null)
const inputAnswer = ref(null)
const isAnswerBad = ref(false)
const isLoading = ref(false)
const audioGood = new Audio('../assets/sounds/good.mp3');
const audioBad = new Audio('../assets/sounds/bad.mp3');
const currentGameQuestionIndex = computed(()=>{
  return gameStore.game.current_questionIndex
})

watch(currentGameQuestionIndex,() => {
  answer.value = ''
  nbBadAnswer.value = 0
  clearTimeout(setTimeOutId.value)
  // wait for the form to be re-enabled
  setTimeout(()=>{
    inputAnswer.value.focus()
  },100)
})

watch(nbBadAnswer, (value)=>{
  if(value >= 2) {
    setTimeOutId.value = setTimeout(()=>{
      nbBadAnswer.value = 0
      setTimeout(()=>{
        inputAnswer.value.focus()
      },50)
    },2000)
  }
})

const submitAnswer = async() => {
  isLoading.value = true
  if (gameStore.isUserAnsweredCurrentQuestion(gameStore.current_user.value.uuid)){
    isLoading.value = false
    return
  }
  if (gameStore.game.current_question.titles.some(title => isGoodAnswer(title,answer.value))) {
    playSound('good')
    await gameStore.submitAnswer(gameStore.current_user.value.uuid)
    nbBadAnswer.value = 0
    isLoading.value = false
    return true
  } else {
    answerOld.value = answer.value
    answer.value = ''
    if (gameStore.game.is_cooldown_enabled) {
      nbBadAnswer.value = nbBadAnswer.value + 1
    }
    isAnswerBad.value = true
    playSound('bad')
   setTimeout(()=>{
     isAnswerBad.value = false
   },250)
    isLoading.value = false
    return false
  }
}

onKeyStroke('ArrowUp', (e) => {
  answer.value = answerOld.value
  e.preventDefault()
})

const playSound = (type) => {
  const audio = type === 'good' ? audioGood : audioBad
  audio.volume = .3
  audio.play();
}
</script>

<style scoped lang="scss">
.bad-answer {
  animation: horizontal-shaking 0.25s;
}

@keyframes horizontal-shaking {
  0% { transform: translateX(0) }
  25% { transform: translateX(5px) }
  50% { transform: translateX(-5px) }
  75% { transform: translateX(5px) }
  100% { transform: translateX(0) }
}
</style>