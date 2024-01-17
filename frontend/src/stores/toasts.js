import { defineStore } from 'pinia'
import {getCurrentInstance, ref} from "vue";
import {socket} from "@/socket.js";


export const useToastsStore = defineStore('toasts', () => {
    const toasts = ref([]);

    const currentInstance = getCurrentInstance();

    const addToast = (payload) => {
        toasts.value.push(payload)
        setTimeout(()=>{
            toasts.value.shift()
        },5000)
    }

    socket.on('toast', (payload)=>{
        if (payload.e) {
            currentInstance.appContext.config.globalProperties.$router.replace({ path: `/` })
        }
        addToast({content: payload.m, isError: !!payload.e})
    })
    return {toasts, addToast}
})