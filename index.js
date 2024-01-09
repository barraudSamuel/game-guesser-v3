// serveur.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

class Game {
    constructor(gameId, io) {
        this.id = gameId
        this.io = io
        this.questions = []
        this.currentQuestion = 1
        this.timer = null
        this.timeForQuestion = 30
        this.remainingTimeForQuestion = this.timeForQuestion
        this.users = []
        this.status = 'pending'
    }

    startGame() {
        this.status = 'running'
        this.io.to(this.id).emit('game',{question : this.currentQuestion, status: this.status})
        this.startTimer()
    }

    startTimer() {
        this.timer = setInterval(()=>{
            this.io.to(this.id).emit('game-timer', {remainingTime: this.remainingTimeForQuestion})
            if (this.remainingTimeForQuestion === 0) { // si le timer est fini
                this.stopTimer() // on stop le timer
                if (this.currentQuestion < this.questions.length) { // on passe a la question suivante
                    this.nextQuestion();
                } else { // la partie est finie
                    this.status = 'finished'
                    this.io.to(this.id).emit('game',{status : this.status})
                }

            } else {
                this.remainingTimeForQuestion--;
            }
        })
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    nextQuestion() {
        this.currentQuestion++;
        this.remainingTimeForQuestion = this.timeForQuestion;
        this.io.to(this.id).emit('partie', { question: this.currentQuestion });
        this.startTimer();
    }

    joinGame(data, socket) {
        const newUser = {
            id: data.id,
            display_name: data.display_name,
            pts:0,
            is_game_host: data.is_game_host
        }
        this.users.push(newUser)
        socket.broadcast.to(this.id).emit('game:user-joined',newUser)
        // this.io.to(this.id).emit('game:user-joined',newUser)
    }

    leaveGame(id) {
        const indexOfObject = this.users.findIndex(object => {
            return object.id === id;
          });
        this.users.splice(indexOfObject,1)
        this.io.to(this.id).emit('game:user-leaved',{id: id})
    }
}


function ServeurJeu() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server, {
        cors: {
            origin: "http://localhost:5173",
        }});
    const games = {};

    app.use(express.static('public'));

    io.on('connection', (socket) => {
        socket.on('game:create', (payload) => {
            socket.join(payload.id); // l'utilisateur rejoint la room
            if (!games[payload.id]) { // si la partie existe pas
                games[payload.id] = new Game(payload.id, io);
                games[payload.id].joinGame({id:socket.id, display_name: payload.display_name, is_game_host: true}, socket)
                socket.emit('game:infos-users', {users: games[payload.id].users})
            } else {
                games[payload.id].joinGame({id:socket.id, display_name: payload.display_name, is_game_host: false}, socket)
                socket.emit('game:infos-users', {users: games[payload.id].users})
            }
        });

        socket.on('game:join', (payload) => {
            if (games[payload.id]) {
                socket.join(payload.id);
                games[payload.id].joinGame({id:socket.id, display_name: payload.display_name, is_game_host: false}, socket)
                socket.emit('game:infos-users', {users: games[payload.id].users})
            } else {
                // todo envoyer une erreur via les toast
            }
        })

        socket.on('game:start', (gameId) => {
            // todo tester si c'est bien l'admin qui decide de lancer la partie
            if(!games[gameId]){
                return
            }else {
                games[gameId].startGame()
            }
        })

        socket.on("disconnecting", () => {
            const idGame = [...socket.rooms].find(room => room !== socket.id);
            const game = games[idGame]
            if(idGame && game) {
                game.leaveGame(socket.id) // on supprime le joueur de la partie
                // si il y a plus de joueurs, on supprime la partie + on stop le timer
                if(game.users.length === 0) {
                    game.stopTimer()
                    delete games[idGame]
                }
            }
          });

        socket.on('disconnect', () => {
          
        });
    });

    function demarrer() {
        const port = 3008;
        server.listen(port, () => {
            console.log(`Serveur WebSocket écoutant sur le port ${port}`);
        });
    }

    return {
        demarrer
    };
}

const serveurJeu = ServeurJeu();
serveurJeu.demarrer();
