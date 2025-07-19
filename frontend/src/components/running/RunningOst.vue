<template>
  <div>
    <div class="flex justify-center mt-5">
      <!-- YouTube Player (Hidden - Audio Only) -->
      <div v-if="isYouTubeUrl" id="youtube-player" class="youtube-audio-only"></div>
      <!-- Regular Audio Player -->
      <audio v-else ref="audioElement" autoplay controls :src="gameStore.game.current_question.ost_url" />
    </div>

    <!-- Sound Visualization Indicator -->
    <div class="flex justify-center mt-1">
      <div class="sound-visualizer" :class="{ 'playing': isPlaying }">
        <div class="sound-bar" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
      </div>
      <div class="ml-3 text-sm text-gray-600 flex items-center" v-if="isPlaying">
        🎵 Son en cours de lecture
      </div>
      <div class="ml-3 text-sm text-gray-400 flex items-center" v-else>
        🔇 Aucun son
      </div>
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
const isPlaying = ref(false)
let youtubePlayer = null
let isYouTubeAPIReady = false

const currentGameQuestionIndex = computed(()=>{
  return gameStore.game.current_question_index
})

const gameVolume = computed(()=>{
  return gameStore.game_volume
})

// YouTube URL detection and video ID extraction
const isYouTubeUrl = computed(() => {
  const url = gameStore.game.current_question.ost_url
  return !!(url && (url.includes('youtube.com/watch') || url.includes('youtu.be/')))
})

const getYouTubeVideoId = (url) => {
  if (!url) return null

  // Handle youtube.com/watch?v=VIDEO_ID format
  const match1 = url.match(/[?&]v=([^&]+)/)
  if (match1) return match1[1]

  // Handle youtu.be/VIDEO_ID format
  const match2 = url.match(/youtu\.be\/([^?]+)/)
  if (match2) return match2[1]

  return null
}

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

// YouTube API and Player Management
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Create the script tag
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    // Set up the global callback
    window.onYouTubeIframeAPIReady = () => {
      isYouTubeAPIReady = true;
      resolve();
    };

    document.head.appendChild(script);
  });
};

const createYouTubePlayer = async () => {
  if (!isYouTubeUrl.value) return;

  const videoId = getYouTubeVideoId(gameStore.game.current_question.ost_url);
  if (!videoId) return;

  try {
    await loadYouTubeAPI();

    // Destroy existing player if it exists
    if (youtubePlayer) {
      youtubePlayer.destroy();
    }

    youtubePlayer = new window.YT.Player('youtube-player', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 0
      },
      events: {
        onReady: (event) => {
          // Set initial volume
          event.target.setVolume(gameStore.game_volume);
        },
        onStateChange: (event) => {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          const playerState = event.data;
          isPlaying.value = playerState === 1; // 1 = playing
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          isPlaying.value = false;
        }
      }
    });
  } catch (error) {
    console.error('Error creating YouTube player:', error);
  }
};

const destroyYouTubePlayer = () => {
  if (youtubePlayer) {
    youtubePlayer.destroy();
    youtubePlayer = null;
  }
  isPlaying.value = false;
};

// HTML5 Audio Event Handlers
const audioPlayHandler = () => { isPlaying.value = true; };
const audioPauseHandler = () => { isPlaying.value = false; };
const audioEndedHandler = () => { isPlaying.value = false; };
const audioErrorHandler = () => { isPlaying.value = false; };

const setupAudioEventListeners = () => {
  if (audioElement.value) {
    audioElement.value.addEventListener('play', audioPlayHandler);
    audioElement.value.addEventListener('pause', audioPauseHandler);
    audioElement.value.addEventListener('ended', audioEndedHandler);
    audioElement.value.addEventListener('error', audioErrorHandler);
  }
};

const removeAudioEventListeners = () => {
  if (audioElement.value) {
    audioElement.value.removeEventListener('play', audioPlayHandler);
    audioElement.value.removeEventListener('pause', audioPauseHandler);
    audioElement.value.removeEventListener('ended', audioEndedHandler);
    audioElement.value.removeEventListener('error', audioErrorHandler);
  }
};

onMounted(async ()=>{
  setTitleInterval(gameStore.lettersTitleRate)

  // Initialize the appropriate player
  if (isYouTubeUrl.value) {
    await createYouTubePlayer()
  } else {
    setVolume(gameStore.game_volume)
    // Set up audio event listeners after a small delay to ensure element is ready
    setTimeout(() => {
      setupAudioEventListeners()
    }, 100)
  }
})

const setTitleInterval = (interval) => {
  clearInterval(intervalId.value)
  intervalId.value = setInterval(()=>{
    placeLetter()
  },interval)
}

const setVolume = (volume) => {
  if (isYouTubeUrl.value && youtubePlayer && youtubePlayer.setVolume) {
    youtubePlayer.setVolume(volume)
  } else if (audioElement.value) {
    audioElement.value.volume = volume / 100
  }
}

const beforeLeave = (()=>{
  clearInterval(intervalId.value)
  destroyYouTubePlayer()
  removeAudioEventListeners()
  isPlaying.value = false
})
onUnmounted(()=>{
  beforeLeave()
})


watch(currentGameQuestionIndex, async () => {
  titleLettersCopy.value = titleLetters.value
  setTitleInterval(gameStore.lettersTitleRate)

  // Clean up previous player state
  destroyYouTubePlayer()
  removeAudioEventListeners()
  isPlaying.value = false

  // Create new player based on current URL type
  if (isYouTubeUrl.value) {
    await createYouTubePlayer()
  } else {
    // For regular audio, set volume and event listeners after a small delay to ensure element is ready
    setTimeout(() => {
      setVolume(gameStore.game_volume)
      setupAudioEventListeners()
    }, 100)
  }
})

watch(gameVolume, (volume) => {
  setVolume(volume)
})

</script>

<style scoped lang="scss">
.activeTranslate {
  transform: translateY(0) !important;
}

.youtube-audio-only {
  display: none !important;
}

// Sound Visualizer Styles
.sound-visualizer {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 30px;
}

.sound-bar {
  width: 4px;
  height: 8px;
  background-color: #9ca3af; // gray-400
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sound-visualizer.playing .sound-bar {
  background-color: #3b82f6; // blue-500
  animation: soundWave 1.2s ease-in-out infinite;
}

.sound-visualizer.playing .sound-bar:nth-child(1) { animation-delay: 0s; }
.sound-visualizer.playing .sound-bar:nth-child(2) { animation-delay: 0.1s; }
.sound-visualizer.playing .sound-bar:nth-child(3) { animation-delay: 0.2s; }
.sound-visualizer.playing .sound-bar:nth-child(4) { animation-delay: 0.3s; }
.sound-visualizer.playing .sound-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes soundWave {
  0%, 100% {
    height: 8px;
    background-color: #3b82f6;
  }
  50% {
    height: 24px;
    background-color: #1d4ed8; // blue-700
  }
}
</style>
