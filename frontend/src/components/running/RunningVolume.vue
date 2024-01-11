<template>
  <div>
    <div class="relative flex items-center gap-2">
      <i class="ri-volume-up-line ri-lg"></i>
      <div class="lg:absolute z-10 lg:-rotate-90 w-[130px] lg:origin-top-left lg:top-[160px]">
        <input v-model="volume" @input="updateVolume" type="range" min="0" max="100" class="range range-xs range-primary w-[130px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useGameStore} from "@/stores/game";
const gameStore = useGameStore()

const volume = ref(gameStore.gameVolume)
const updateVolume = (e) => {
  gameStore.gameVolume = parseInt(e.target.value)
}
</script>

<style scoped>

</style>