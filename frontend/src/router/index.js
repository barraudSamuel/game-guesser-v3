import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from "@/views/GameView.vue";
import {useGameStore} from "@/stores/game.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/:id',
      name: 'game',
      component: GameView
    }
  ]
})

router.beforeEach(async (to, from) => {
  const gameStore = useGameStore()
  if (!gameStore.current_user && to.name !== 'home') {
    return { name: 'home' }
  }
})

export default router
