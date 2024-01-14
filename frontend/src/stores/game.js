import { defineStore } from 'pinia'
import {computed, ref} from "vue";
import { socket } from "@/socket";

export const useGameStore = defineStore('game', () => {
    const game = ref({
        status: 'pending',
        current_question: {},
        current_question_index: 1,
        total_questions: 0,
        remaining_time_for_question: 30,
        time_for_question: 30,
        users: []
    });

    const current_user = ref(null)

    const game_volume = ref(50)

    const lettersTitleRate = computed (() => {
        if (game.value && game.value.current_question ) {
            return Math.round((game.value.remaining_time_for_question - 1) / game.value.current_question.title.split(' ').join('').split('').length * 1000)
        }
        return 0
    })



    //=====SOCKET=====

    socket.on('game:user-joined', (payload) => {
        console.log(payload)
        // on regarde si l'utilisateur est pas deja present
        const user = game.value.users.find(el => el.id === payload.id)
        if (!user) {
            game.value.users.push(payload)
        }
    })

    socket.on('game:user-leaved', (payload) => {
        const indexOfObject = game.value.users.findIndex(object => {
            return object.id === payload.id;
        });
        game.value.users.splice(indexOfObject,1)
    })

    socket.on('game:infos-users', (payload) => {
        game.value.users = payload.users
    })

    socket.on('game:started', (payload) => {
        game.value.status = payload.st
        game.value.current_question.title = payload?.cq?.t
        game.value.current_question.ost_url = payload?.cq?.ost
        game.value.current_question.cover_url = payload?.cq?.cover
        game.value.current_question.question_type = payload?.cq?.qt
        game.value.current_question_index = payload.cqi + 1
        game.value.total_questions = payload.tq
        game.value.remaining_time_for_question = payload.rtfq
    })

    socket.on('game:next-question', (payload)=> {
        console.log('next questions')
        game.value.current_question.title = payload?.cq?.t
        game.value.current_question.ost_url = payload?.cq?.ost
        game.value.current_question.cover_url = payload?.cq?.cover
        game.value.current_question.question_type = payload?.cq?.qt
        game.value.current_question_index = payload.cqi + 1
        game.value.remaining_time_for_question = payload.rtfq
    })

    socket.on('game:finished',(payload) => {
        game.value.status = payload.st
    })

    socket.on('game:timer', (payload) => {
        console.log(`timer ${payload.remaining_time}`)
        game.value.remaining_time_for_question = payload.remaining_time
    })

    socket.on('game:reset',(payload)=>{
        game.value.status = 'pending'
        game.value.current_question = {}
        game.value.current_question_index = 1
        game.value.total_questions = 0
        game.value.remaining_time_for_question = 30
        game.value.time_for_question = 30
        game.value.users.forEach((user, index) => {
            game.value.users[index].pts = 0
        })
    })


    return { game, current_user, game_volume, lettersTitleRate }
})