<template>
  <div class="hero">
    <div class="hero-content text-center w-full">
      <div class="card w-full bg-base-300 shadow-xl">
        <div class="card-body">
          <div class="flex justify-center items-center">
            <div class="tooltip" data-tip="Retour au lobby">
              <button v-if="gameStore.current_user.is_game_host" @click="resetGame()" class="btn btn-square btn-primary">
                <i class="ri-arrow-left-circle-line text-2xl font-thin"></i>
              </button>
            </div>
            <p class="text-center text-lg font-bold flex justify-center items-center">
              Classement
              <i class="ri-bar-chart-2-line text-xl font-thin ml-2"></i>
            </p>
          </div>
          <div class="overflow-x-auto w-full mt-3">
            <table class="table table-compact w-full">
              <!-- head -->
              <thead>
              <tr>
                <th>Pseudo</th>
                <th>Points</th>
              </tr>
              </thead>
              <tbody>
              <!-- row 1 -->
              <tr v-for="(user,index) in gameStore.game.users.sort(orderUserByScore)" :key="index">
                <td>
                  <div class="flex items-center space-x-3">
                    <div>
                      <div class="font-bold">{{user.display_name}}</div>
                    </div>
                    <UsersBadge v-if="user.is_game_host" :type="'admin'" :tooltip="'admin'" />
                  </div>
                </td>
                <td>
                  <strong>{{user.pts ?? 0}}</strong> pts
                </td>
              </tr>
              </tbody>
              <!-- foot -->
              <tfoot>
              <tr>
                <th>Pseudo</th>
                <th>Points</th>
              </tr>
              </tfoot>

            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useGameStore} from "@/stores/game";
import {useRoute, useRouter} from "vue-router";
import UsersBadge from "@/components/users/UsersBadge.vue";
const router = useRouter()
const route = useRoute()
import {socket} from "@/socket.js";
import {orderUserByScore} from "@/utils/users.js";

const gameStore = useGameStore()

const resetGame = () => {
  socket.emit('game:reset',{
    id: route.params.id
  })
}
</script>

<style scoped>

</style>