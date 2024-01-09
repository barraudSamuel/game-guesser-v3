import { reactive } from "vue";
import { io } from "socket.io-client";

const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3008";

export const socket = io(URL);

socket.on('connect', () => {
    console.log(socket.id)
})

socket.on('disconnecting', () => {
    console.log(socket.id)
})

/*
socket.on('game-users', (payload) => {
    console.log(payload)
})
socket.onAny((eventName, ...args) => {
    console.log(eventName)
});*/
