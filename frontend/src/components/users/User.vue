<script setup>
import UsersBadge from "@/components/users/UsersBadge.vue";
import {useGameStore} from "@/stores/game.js";

const gameStore = useGameStore()


const props = defineProps({
  user: {
    type: Object
  }
})
</script>

<template>
  <div class="grid grid-cols-6 gap-2 relative mt-1 bg-base-100 p-1 rounded-md group" :class="{'border-info border-2' : gameStore.current_user.id === props.user.id}">
    <div class="col-span-4 flex justify-start items-center">
      <div class="ml-3 text-left truncate">
        <span class="text-left truncate" :title="user.display_name">{{ user.display_name }}</span>
      </div>
      <UsersBadge class="ml-2" :type="'good_answer'" :tooltip="'Réponse trouvée'" />
      <UsersBadge class="" :type="'bad_answer'" :tooltip="'Réponse non trouvée'" />
    </div>
    <div class="col-span-2 flex justify-end items-center">
      <p>{{user.pts ?? 0}} pts</p>
      <UsersBadge v-if="user.is_game_host" :type="'admin'" :tooltip="'admin'" />
    </div>
  </div>
</template>

<style scoped>

</style>