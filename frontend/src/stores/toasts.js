import { defineStore } from 'pinia'
import {ref} from "vue";


export const useToastsStore = defineStore('toasts', () => {
    const toasts = ref([]);
    const addToast = (payload) => {
        toasts.value.push(payload)
        setTimeout(()=>{
            toasts.value.shift()
        },4000)
    }

    return {toasts, addToast}
})