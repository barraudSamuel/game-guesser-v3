import { defineStore } from 'pinia'
import {computed, ref} from "vue";
import { socket } from "@/socket";

export const useGameStore = defineStore('game', () => {
    const game = ref({
        status: 'pending',
        is_cooldown_enabled: true,
        current_question: {
            cover_url: 'https://www.cite-telecoms.com/voy_content/uploads/2018/03/as11-40-5873_medium-610x613.jpg',
            ost_url: '',
            title: '',
            question_type: 'blur'
        },
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
            return Math.round((game.value.remaining_time_for_question - 1) / game.value.current_question.titles[0].split(' ').join('').split('').length * 1000)
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

    socket.on('game:infos', (payload) => {
        game.value.status = payload.status
        game.value.current_question = payload.current_question
        game.value.current_question_index = payload.current_question_index + 1
        game.value.total_questions = payload.total_questions
    })

    socket.on('game:next-question', (payload)=> {
        console.log('next questions')
        game.value.remaining_time_for_question = payload.remaining_time_for_question
        game.value.current_question = payload.current_question
        game.value.current_question_index = payload.current_question_index + 1
    })

    socket.on('game:timer', (payload) => {
        console.log(`timer ${payload.remaining_time}`)
        game.value.remaining_time_for_question = payload.remaining_time
    })


    return { game, current_user, game_volume, lettersTitleRate }
})