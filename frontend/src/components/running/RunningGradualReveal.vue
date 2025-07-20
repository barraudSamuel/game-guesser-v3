<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="card">
      <div class="card-body text-center py-4">
        <h3 class="card-title justify-center mb-2 text-lg">Informations sur le jeu</h3>

        <div class="flex gap-2 justify-center items-center">
          <!-- Year reveal (first) -->
          <div v-if="revealedInfo.year" class="mb-2">
            <div class="badge badge-primary badge-sm">
              <strong class="mr-1">Année de sortie: </strong> {{ gameStore.game.current_question.year }}
            </div>
          </div>

          <!-- Developer reveal -->
          <div v-if="revealedInfo.developer" class="mb-2">
            <div class="badge badge-secondary badge-sm">
              <strong class="mr-1">Développeur: </strong> {{ gameStore.game.current_question.developer }}
            </div>
          </div>
        </div>

        <!-- Consoles reveal -->
        <div v-if="revealedInfo.consoles" class="mb-2">
          <div class="text-xs font-semibold mb-1">Plateformes:</div>
          <div class="flex flex-wrap gap-1 justify-center">
            <span v-for="console in gameStore.game.current_question.consoles" :key="console"
                  class="badge badge-accent badge-xs">
              {{ console }}
            </span>
          </div>
        </div>

        <!-- Categories reveal -->
        <div v-if="revealedInfo.categories" class="mb-2">
          <div class="text-xs font-semibold mb-1">Genres:</div>
          <div class="flex flex-wrap gap-1 justify-center">
            <span v-for="category in gameStore.game.current_question.categories" :key="category"
                  class="badge badge-info badge-xs">
              {{ category }}
            </span>
          </div>
        </div>

        <!-- Themes reveal -->
        <div v-if="revealedInfo.themes" class="mb-2">
          <div class="text-xs font-semibold mb-1">Thèmes:</div>
          <div class="flex flex-wrap gap-1 justify-center">
            <span v-for="theme in gameStore.game.current_question.themes" :key="theme"
                  class="badge badge-warning badge-xs">
              {{ theme }}
            </span>
          </div>
        </div>

        <!-- Screenshots reveal -->
        <div v-if="revealedInfo.screenshots && gameStore.game.current_question.screenshots && gameStore.game.current_question.screenshots.length > 0" class="mb-2">
          <div class="text-xs font-semibold mb-1">Captures d'écran:</div>
          <div class="grid grid-cols-2 gap-1 mx-auto">
            <img v-for="(screenshot, index) in gameStore.game.current_question.screenshots.slice(0, 2)"
                 :key="index"
                 :src="screenshot"
                 alt="Game screenshot"
                 class="w-full h-32 object-cover rounded shadow-sm">
          </div>
        </div>

        <!-- Cover reveal (last) -->
        <div v-if="revealedInfo.cover" class="mb-2">
          <div class="text-xs font-semibold mb-1">Pochette du jeu:</div>
          <img :src="gameStore.game.current_question.cover_url"
               alt="Game cover"
               class="w-32 h-44 object-cover mx-auto rounded-lg shadow-md">
        </div>

        <!-- Progress indicator -->
        <div class="mt-2">
          <progress class="progress progress-primary w-full h-2"
                    :value="progressPercentage"
                    max="100"></progress>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round(progressPercentage) }}% révélé
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from "@/stores/game"

const gameStore = useGameStore()

// Track what information has been revealed
const revealedInfo = ref({
  year: false,
  developer: false,
  consoles: false,
  categories: false,
  themes: false,
  screenshots: false,
  cover: false
})

// Calculate progress percentage
const progressPercentage = computed(() => {
  const totalSteps = 7
  const revealedSteps = Object.values(revealedInfo.value).filter(Boolean).length
  return (revealedSteps / totalSteps) * 100
})

// Reveal sequence timing (percentage-based, scales with timer duration)
const revealSequencePercentages = [
  { key: 'year', percentage: 0 },      // Reveal immediately at 0% (second 0)
  { key: 'developer', percentage: 10 }, // Reveal at 10% of timer duration
  { key: 'consoles', percentage: 30 },  // Reveal at 30% of timer duration
  { key: 'categories', percentage: 40 }, // Reveal at 40% of timer duration
  { key: 'themes', percentage: 50 },    // Reveal at 50% of timer duration
  { key: 'screenshots', percentage: 60 }, // Reveal at 77% of timer duration
  { key: 'cover', percentage: 90 }      // Reveal at 87% of timer duration (near the end)
]

// Calculate actual delays based on timer duration
const getScaledRevealSequence = () => {
  const totalTime = gameStore.game.time_for_question * 1000 // Convert to milliseconds
  return revealSequencePercentages.map(({ key, percentage }) => ({
    key,
    delay: Math.round((percentage / 100) * totalTime)
  }))
}

let revealTimeouts = []

const startRevealSequence = () => {
  // Clear any existing timeouts
  clearRevealTimeouts()

  // Reset revealed info
  revealedInfo.value = {
    year: false,
    developer: false,
    consoles: false,
    categories: false,
    themes: false,
    screenshots: false,
    cover: false
  }

  // Get scaled reveal sequence based on current timer duration
  const scaledRevealSequence = getScaledRevealSequence()

  // Set up reveal timeouts based on remaining time
  const totalTime = gameStore.game.time_for_question * 1000 // Convert to milliseconds
  const currentTime = gameStore.game.remaining_time_for_question * 1000

  scaledRevealSequence.forEach(({ key, delay }) => {
    // Only set timeout if we haven't passed the reveal time yet
    if (currentTime > (totalTime - delay)) {
      const timeoutDelay = currentTime - (totalTime - delay)
      const timeout = setTimeout(() => {
        revealedInfo.value[key] = true
      }, timeoutDelay)
      revealTimeouts.push(timeout)
    } else {
      // If we've already passed this reveal time, show it immediately
      revealedInfo.value[key] = true
    }
  })
}

const clearRevealTimeouts = () => {
  revealTimeouts.forEach(timeout => clearTimeout(timeout))
  revealTimeouts = []
}

// Watch for game state changes to restart the sequence
watch(() => gameStore.game.current_question_index, () => {
  startRevealSequence()
})

watch(() => gameStore.game.remaining_time_for_question, (newTime) => {
  // Update reveals based on remaining time
  const totalTime = gameStore.game.time_for_question
  const elapsed = totalTime - newTime

  // Get scaled reveal sequence based on current timer duration
  const scaledRevealSequence = getScaledRevealSequence()

  scaledRevealSequence.forEach(({ key, delay }) => {
    if (elapsed * 1000 >= delay && !revealedInfo.value[key]) {
      revealedInfo.value[key] = true
    }
  })
})

onMounted(() => {
  startRevealSequence()
})

onUnmounted(() => {
  clearRevealTimeouts()
})
</script>

<style scoped>
.badge {
  white-space: normal;
  height: auto;
  padding: 0.5rem;
}
</style>
