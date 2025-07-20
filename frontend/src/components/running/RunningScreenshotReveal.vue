<template>
  <div class="w-full mx-auto">
    <div class="card">
      <div class="card-body text-center py-4">
        <h3 class="card-title justify-center mb-2 text-lg">Captures d'écran du jeu</h3>

        <!-- Screenshots reveal -->
        <div v-if="gameStore.game.current_question.screenshots && gameStore.game.current_question.screenshots.length > 0" class="mb-4">
          <div class="grid grid-cols-2 gap-2 mx-auto">
            <div v-for="(screenshot, index) in visibleScreenshots"
                 :key="index"
                 class="screenshot-container">
              <img :src="screenshot"
                   :alt="`Game screenshot ${index + 1}`"
                   class="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-500 ease-in-out">
              <div class="text-xs text-gray-500 mt-1">
                Capture {{ index + 1 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game name reveal (at the end) -->
        <div v-if="revealGameName" class="mb-2">
          <div class="text-sm font-semibold mb-2">Nom du jeu:</div>
          <div class="text-lg font-bold text-primary">
            {{ gameStore.game.current_question.titles[0] }}
          </div>
        </div>

        <!-- Progress indicator -->
        <div class="mt-4">
          <progress class="progress progress-primary w-full h-2"
                    :value="progressPercentage"
                    max="100"></progress>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round(progressPercentage) }}% révélé
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {{ visibleScreenshots.length }} / {{ totalScreenshots }} captures affichées
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

// Track how many screenshots are currently visible
const visibleScreenshotCount = ref(0)
const revealGameName = ref(false)

// Get available screenshots
const availableScreenshots = computed(() => {
  return gameStore.game.current_question.screenshots || []
})

// Get total number of screenshots
const totalScreenshots = computed(() => {
  return availableScreenshots.value.length
})

// Get currently visible screenshots
const visibleScreenshots = computed(() => {
  return availableScreenshots.value.slice(0, visibleScreenshotCount.value)
})

// Calculate progress percentage
const progressPercentage = computed(() => {
  const totalSteps = totalScreenshots.value + 1 // +1 for game name reveal
  const currentStep = visibleScreenshotCount.value + (revealGameName.value ? 1 : 0)
  return totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
})

// Calculate reveal sequence based on available screenshots
const getRevealSequence = () => {
  const totalTime = gameStore.game.time_for_question * 1000 // Convert to milliseconds
  const screenshots = availableScreenshots.value

  if (screenshots.length === 0) {
    return []
  }

  const sequence = []

  // Distribute screenshots evenly across 80% of the time (save 20% for game name)
  const screenshotTimespan = totalTime * 0.8
  const intervalBetweenScreenshots = screenshotTimespan / screenshots.length

  // Add screenshot reveals
  screenshots.forEach((_, index) => {
    sequence.push({
      type: 'screenshot',
      index: index,
      delay: Math.round(intervalBetweenScreenshots * index)
    })
  })

  // Add game name reveal at 90% of total time
  sequence.push({
    type: 'gameName',
    delay: Math.round(totalTime * 0.9)
  })

  return sequence
}

let revealTimeouts = []

const startRevealSequence = () => {
  // Clear any existing timeouts
  clearRevealTimeouts()

  // Reset state
  visibleScreenshotCount.value = 0
  revealGameName.value = false

  // Get reveal sequence based on available screenshots
  const revealSequence = getRevealSequence()

  if (revealSequence.length === 0) {
    return
  }

  // Set up reveal timeouts based on remaining time
  const totalTime = gameStore.game.time_for_question * 1000 // Convert to milliseconds
  const currentTime = gameStore.game.remaining_time_for_question * 1000

  revealSequence.forEach(({ type, index, delay }) => {
    // Only set timeout if we haven't passed the reveal time yet
    if (currentTime > (totalTime - delay)) {
      const timeoutDelay = currentTime - (totalTime - delay)
      const timeout = setTimeout(() => {
        if (type === 'screenshot') {
          visibleScreenshotCount.value = index + 1
        } else if (type === 'gameName') {
          revealGameName.value = true
        }
      }, timeoutDelay)
      revealTimeouts.push(timeout)
    } else {
      // If we've already passed this reveal time, show it immediately
      if (type === 'screenshot') {
        visibleScreenshotCount.value = Math.max(visibleScreenshotCount.value, index + 1)
      } else if (type === 'gameName') {
        revealGameName.value = true
      }
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

  // Get reveal sequence based on available screenshots
  const revealSequence = getRevealSequence()

  revealSequence.forEach(({ type, index, delay }) => {
    if (elapsed * 1000 >= delay) {
      if (type === 'screenshot' && visibleScreenshotCount.value <= index) {
        visibleScreenshotCount.value = index + 1
      } else if (type === 'gameName' && !revealGameName.value) {
        revealGameName.value = true
      }
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
.screenshot-container {
  transition: all 0.5s ease-in-out;
}

.screenshot-container img {
  transition: transform 0.3s ease-in-out;
}

.screenshot-container:hover img {
  transform: scale(1.02);
}
</style>
