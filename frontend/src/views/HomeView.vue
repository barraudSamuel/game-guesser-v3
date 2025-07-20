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
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div class="collapse-title text-xl font-medium">
              FAQ
            </div>
            <div class="collapse-content">
              <p><strong>Combien de joueurs peuvent rejoindre une partie ?</strong></p>
              <p>Chaque partie est limitée à 300 joueurs maximum par room.</p>
            </div>
          </div>
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
  </div>
</template>
