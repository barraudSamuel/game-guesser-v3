<script setup>
import {socket} from "@/socket.js";
import { nanoid } from 'nanoid'
import {ref} from "vue";
import { useRouter, useRoute } from 'vue-router'
import {useGameStore} from "@/stores/game.js";

const gameStore = useGameStore()

const router = useRouter()
const route = useRoute()

const display_name = ref('')
const roomId = ref(route.query.code);
const createGame = () => {
  const id = nanoid(10)
  //emit event
  socket.emit('game:create', {
    id: id,
    display_name: display_name.value
  })
  gameStore.current_user = {
    display_name: display_name.value,
    is_game_host: true,
    id: socket.id
  };

  router.replace({ path: `/${id}` })
}

const joinGame = () => {
  socket.emit('game:join', {
    id: roomId.value,
    display_name: display_name.value
  })
  gameStore.current_user = {
    display_name: display_name.value,
    is_game_host: false,
    id: socket.id
  };
  router.replace({ path: `/${roomId.value}` })
}

</script>

<template>
  <div>
    <div class="hero min-h-screen">
      <div class="hero-content w-full flex-col lg:flex-row-reverse gap-8">
        <div class="text-center lg:text-left">
          <h1 class="text-5xl font-bold">game guesser</h1>
          <p class="py-6">game guesser est un jeu de quizz sur les jeux videos, venez defier vos amis</p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div class="card-body">
            <h1 class="text-3xl text-center font-bold mb-4">jouer <i class="ri-fire-fill"></i></h1>
            <form @submit.prevent="roomId ? joinGame() : createGame()">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">pseudo</span>
                </label>
                <input type="text" required v-model="display_name" placeholder="mon pseudo" class="input input-bordered" />
              </div>
              <div v-if="roomId" class="form-control">
                <label class="label">
                  <span class="label-text">code de la partie</span>
                </label>
                <input disabled type="text" required v-model="roomId" placeholder="mon pseudo" class="input input-bordered" />
              </div>
              <div class="form-control mt-6">
                <button v-if="!roomId" type="submit" class="btn btn-primary">créer une partie</button>
                <button v-else type="submit" class="btn btn-primary">rejoindre la partie</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-base-100 p-4 flex justify-center">
      <div class="max-w-3xl py-8">
        <h2 class="text-2xl font-bold mb-4">Questions fréquentes</h2>

        <div class="collapse collapse-arrow bg-base-200 mb-2">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            Comment jouer à Game Guesser ?
          </div>
          <div class="collapse-content">
            <p>Game Guesser est un jeu de quiz sur les jeux vidéo. Créez une partie ou rejoignez celle d'un ami avec un code. Devinez les jeux à partir d'indices visuels ou sonores !</p>
          </div>
        </div>

        <div class="collapse collapse-arrow bg-base-200 mb-2">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            Combien de joueurs peuvent participer ?
          </div>
          <div class="collapse-content">
            <p>Vous pouvez jouer seul ou avec vos amis. Les salons sont limités à 300 joueurs.</p>
          </div>
        </div>

        <div class="collapse collapse-arrow bg-base-200 mb-2">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            Quels types de jeux sont inclus ?
          </div>
          <div class="collapse-content">
            <p>Notre base de données contient une large variété de jeux vidéo de toutes les époques et plateformes, des classiques rétro aux dernières sorties.</p>
          </div>
        </div>

        <div class="collapse collapse-arrow bg-base-200 mb-2">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            Le jeu est-il gratuit ?
          </div>
          <div class="collapse-content">
            <p>Oui, Game Guesser est entièrement gratuit ! Amusez-vous à tester vos connaissances en jeux vidéo sans aucun coût.</p>
          </div>
        </div>

        <div class="collapse collapse-arrow bg-base-200 mb-2">
          <input type="radio" name="faq-accordion" />
          <div class="collapse-title text-lg font-medium">
            Puis-je jouer sur mobile ?
          </div>
          <div class="collapse-content">
            <p>Absolument ! Game Guesser est optimisé pour fonctionner sur tous les appareils : ordinateurs, tablettes et smartphones.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
