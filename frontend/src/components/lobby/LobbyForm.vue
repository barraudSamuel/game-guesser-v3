<script setup>
import {ref} from "vue";
import {useClipboard} from '@vueuse/core'
import {useRoute} from "vue-router";
import {socket} from "@/socket.js";
import {useToastsStore} from "@/stores/toasts.js";

const route = useRoute()

const toastStore = useToastsStore()

const isLoading = ref(false)

const questionTypesDescription = ref({
  ost: {
    description: 'Sorte de Scrabble évolutif la durée de l\'extrait est de 30 secondes les lettres se découvrent lentement jusqu\'à la fin du compteur celui qui répond le plus tôt marque plus de points',
    title: 'Devine l\'ost'
  },
  blur: {
    description: 'Une pochette de jeu vidéo apparait, elle est très foutée et devient de plus en plus nette celui qui répond le plus tôt marque plus de points',
    title: 'Cover floutée'
  },
  zoom: 'Une pochette de jeu vidéo apparait elle est très zomée et dézoom de lus en plus, celui qui répond le plus tôt marque plus de points'
})

const gameRef = ref({
  number_questions: 20,
  time_to_answer: 30,
  is_cooldown_enabled: true,
  question_types: [
    /*{
      type: 'ost',
      is_enabled: true
    },*/
    {
      type: 'blur',
      is_enabled: true
    }
  ]
})

const startGame = async() => {
  if (gameRef.value.question_types.filter(el => el.is_enabled).length) {
    socket.emit('game:start', {
      id: route.params.id,
      ...gameRef.value
    })
  } else {
    toastStore.addToast({content: 'Il faut au moins un type de questions !'})
  }
}

const invitationLink = ref(`${window.location.origin}?code=${route.params.id}`)
const { text, copy, copied, isSupported } = useClipboard({ invitationLink })
</script>

<template>
  <div class="card w-full bg-base-300 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Paramètres de votre partie :</h2>
      <form @submit.prevent="startGame" >
        <div class="form-control">
          <label class="label">
            <span class="label-text">Nombre de questions ({{ gameRef.number_questions }})</span>
          </label>
          <input v-model="gameRef.number_questions" type="range" min="1" max="50" class="range range-xs" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Temps pour répondre ({{ gameRef.time_to_answer }}s)</span>
          </label>
          <input v-model="gameRef.time_to_answer" type="range" min="1" max="50" class="range range-xs" />
        </div>
        <div class="mt-4">
          <h3 class="text-left font-semibold">Type de questions :</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 mt-2">
            <div v-for="(type, index) in gameRef.question_types" :key="index" class="form-control flex flex-row justify-start items-center">
              <label class="label mr-2">
                <span class="label-text tooltip" :data-tip="questionTypesDescription[type.type]?.description">{{ questionTypesDescription[type.type]?.title }}</span>
              </label>
              <input v-model="type.is_enabled" type="checkbox" checked="checked" class="checkbox" />
            </div>
          </div>
        </div>
        <div class="mt-4 hidden">
          <h3 class="text-left font-semibold">Autres paramètres :</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 mt-2">
            <div class="form-control flex flex-row justify-start items-center">
              <label class="label mr-2">
                <span class="label-text tooltip tooltip-right" :data-tip="'Ajoutez un délai de 2 secondes pour l\'utilisateur qui a fait 2 mauvaises réponses.'">Délais</span>
              </label>
              <input v-model="gameRef.is_cooldown_enabled" type="checkbox" checked="checked" class="checkbox" />
            </div>
          </div>
        </div>
        <div class="form-control mt-6">
          <button v-if="isSupported" @click='copy(invitationLink)' type="button" class="btn btn-outline gap-2">
            <template v-if="!copied">
              Copier le lien de partage
              <i class="ri-clipboard-line font-thin text-2xl"></i>
            </template>
            <template v-else>
              Lien copié !
              <i class="ri-check-line font-thin text-2xl"></i>
            </template>
          </button>
          <p v-else>
            Votre navigateur ne prend pas en charge le presse-papiers. Pour partager la partie, copiez ce lien : {{invitationLink}}
          </p>
          <button :class="{'loading' : isLoading}" :disabled="isLoading" type="submit" class="btn btn-primary mt-2">Lancer la partie</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>
