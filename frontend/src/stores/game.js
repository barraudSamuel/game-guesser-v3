import { defineStore } from 'pinia'
import {ref} from "vue";
import { socket } from "@/socket";

export const useGameStore = defineStore('game', () => {
    const game = ref({
        status: 'lobby',
        is_cooldown_enabled: true,
        current_question: {},
        users: []
    });

    socket.on('game:user-joined', (payload) => {
        console.log(payload)
        // on regarde si l'utilisateur est pas deja present
        const user = game.value.users.find(el => el.id === payload.id)
        if (!user) {
            game.value.users.push(payload)
        }
    })

    socket.on('game:infos-users', (payload) => {
        game.value.users = payload.users
    })



    socket.on('game:user-leaved', (payload) => {
        const indexOfObject = game.value.users.findIndex(object => {
            return object.id === payload.id;
        });
        game.value.users.splice(indexOfObject,1)
    })

    const current_user = ref(null)

    return { game, current_user }
})