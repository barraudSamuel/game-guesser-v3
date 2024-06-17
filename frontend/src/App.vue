<script setup>
import { RouterView } from 'vue-router'
import Toasts from "@/components/toasts/Toasts.vue";
import {onMounted, ref} from "vue";
import { onClickOutside } from '@vueuse/core'


const dropDownOpen = ref(false)
const dropDownBtn = ref(null)

const baseThemes = ref(["light", "dark",])

const othersThemes = ref([
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
])
const currentTheme = ref('light')

const changeTheme = (newTheme) => {
  currentTheme.value = newTheme
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('theme', currentTheme.value)
}

onMounted(() => {
  currentTheme.value = localStorage.getItem('theme') ?? 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
})

onClickOutside(dropDownBtn, () => {
  dropDownOpen.value = false
})
</script>

<template>
  <div class="relative">
    <details ref="dropDownBtn" :open="dropDownOpen" class="dropdown absolute top-1 left-1">
      <summary @click.prevent="dropDownOpen = !dropDownOpen" class="m-1 btn"><i class="ri-paint-brush-fill ri-xl"></i></summary>
      <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        <li v-for="(theme, index) in baseThemes" :key="index"><a :class="{'active':theme===currentTheme}" @click="changeTheme(theme)">{{ theme }}</a></li>
        <li>
          <details>
            <summary>autres themes</summary>
            <ul>
              <li v-for="(theme, index) in othersThemes" :key="index"><a :class="{'active':theme===currentTheme}" @click="changeTheme(theme)">{{ theme }}</a></li>
            </ul>
          </details>
        </li>
      </ul>
    </details>
    <div class="customBg fixed w-screen h-screen -z-10 top-0 left-0" />
    <div>
      <RouterView />
    </div>
    <Toasts />
  </div>
</template>
<style scoped>
.customBg{
  opacity: 0.06;
  background-image: url("@/assets/images/main-bg.jpg");
  background-size: cover;
  background-position: center center;
}
</style>
