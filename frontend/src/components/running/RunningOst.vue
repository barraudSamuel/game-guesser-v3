<template>
  <div>
    <div class="flex justify-center mt-5">
      <audio ref="audioElement" autoplay controls :src="gameStore.game.current_question.ost_url" />
    </div>
    <div class="mt-8">
      <div class="flex justify-center items-center flex-wrap gap-y-2 gap-x-12 select-none">
        <div class="flex justify-center items-center gap-1 flex-wrap" v-for="(letters,index) in titleLettersCopy" :key="index">
          <div v-for="(letter,index) in letters" :key="index" class="border-2 border-primary p-1 rounded-md h-10 w-10 overflow-hidden flex justify-center items-center">
            <span class="-translate-y-8 capitalize lg:text-2xl font-bold" :class="{'activeTranslate duration-500 transition-transform':letter.is_displayed}">
              {{letter.letter}}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";

const gameStore = useGameStore()
const intervalId = ref(null)
const audioElement = ref(null)

const currentGameQuestionIndex = computed(()=>{
  return gameStore.game.current_question_index
})

const gameVolume = computed(()=>{
  return gameStore.game_volume
})

const titleLetters = computed(()=>{
  const words = gameStore.game.current_question.titles[0].split(' ')
  return words.map((word) => {
    return Array.from(word).map((letter) => {
      return {
        letter: letter,
        is_displayed: false
      }
    })
  });
})
const titleLettersCopy = ref(titleLetters.value)

const placeLetter = () => {
  const nonDisplayedLetters = [];

  // Construire un tableau de lettres non affichées
  titleLettersCopy.value.forEach((word) => {
    word.forEach((letter) => {
      if (!letter.is_displayed) {
        nonDisplayedLetters.push(letter);
      }
    });
  });

  if (nonDisplayedLetters.length > 0) {
    const randomIndex = Math.floor(Math.random() * nonDisplayedLetters.length);
    const selectedLetter = nonDisplayedLetters[randomIndex];

    selectedLetter.is_displayed = true;
  }
};

onMounted(()=>{
  setTitleInterval(gameStore.lettersTitleRate)
  setVolume(gameStore.game_volume)
})

const setTitleInterval = (interval) => {
  clearInterval(intervalId.value)
  intervalId.value = setInterval(()=>{
    placeLetter()
  },interval)
}

const setVolume = (volume) => {
  audioElement.value.volume = volume / 100
}

const beforeLeave = (()=>{
  clearInterval(intervalId.value)
})
onUnmounted(()=>{
  beforeLeave()
})


watch(currentGameQuestionIndex,() => {
  titleLettersCopy.value = titleLetters.value
  setTitleInterval(gameStore.lettersTitleRate)
})

watch(gameVolume, (volume) => {
  setVolume(volume)
})

</script>

<style scoped lang="scss">
.activeTranslate {
  transform: translateY(0) !important;
}
</style>