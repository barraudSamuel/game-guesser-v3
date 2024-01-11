// serveur.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {questions} = require('./questions')

class Game {
    constructor(gameId, io) {
        this.id = gameId
        this.io = io
        this.questions = []
        this.currentQuestionIndex = 0
        this.timer = null
        this.timeForQuestion = 5
        this.remainingTimeForQuestion = this.timeForQuestion
        this.users = []
        this.status = 'pending'
        this.is_cooldown_enabled = true
    }

    startGame(payload) {
        console.log('start game')
        this.is_cooldown_enabled = payload.is_cooldown_enabled
        this.selectQuestions(5)
        this.status = 'running'
        this.io.to(this.id).emit('game:infos',{
            current_question : {
                ...this.questions[this.currentQuestionIndex],
                question_type: 'blur'
            },
            status: this.status,
            current_question_index: this.currentQuestionIndex,
            total_questions: this.questions.length,
        })
        this.startTimer()
    }

    resetGame() {
        this.status=  'pending'
        this.remainingTimeForQuestion = this.timeForQuestion;
        // todo reset user pts
        // todo reset question
        this.io.to(this.id).emit('game:infos', {status: this.status})
        this.io.to(this.id).emit('game:infos-users', {users: this.users})
    }

    startTimer() {
        this.timer = setInterval(()=>{
            if (this.remainingTimeForQuestion === 0) { // si le timer est fini
                this.stopTimer() // on stop le timer
                if (this.currentQuestionIndex < this.questions.length) { // on passe a la question suivante
                    this.nextQuestion();
                } else { // la partie est finie
                    this.status = 'finished'
                    this.io.to(this.id).emit('game:infos',{status : this.status})
                }

            } else {
                this.io.to(this.id).emit('game:timer', {remaining_time: this.remainingTimeForQuestion})
                this.remainingTimeForQuestion--;
            }
        },1000)
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.remainingTimeForQuestion = this.timeForQuestion;
        this.io.to(this.id).emit('game:next-question', {
                current_question : {
                    ...this.questions[this.currentQuestionIndex],
                    question_type: 'blur'
                },
            current_question_index: this.currentQuestionIndex,
            remaining_time_for_question: this.remainingTimeForQuestion
        });
        this.startTimer();
    }

    selectQuestions(numberOfQuestions) {
        console.log(questions)
            const questionsCopy = [...questions];

        // Tableau résultant
        const newQuestions = [];
        for (let i = 0; i < numberOfQuestions; i++) {
            // Sélection d'un index au hasard dans le tableau restant
            const indexRandom = Math.floor(Math.random() * questionsCopy.length);

            // Ajout de l'élément correspondant à l'index au tableau résultant
            newQuestions.push(questionsCopy[indexRandom]);

            // Suppression de l'élément du tableau de base copié pour éviter la répétition
            questionsCopy.splice(indexRandom, 1);
        }
        this.questions = newQuestions
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

        socket.on('game:start', (payload) => {
            // todo tester si c'est bien l'admin qui decide de lancer la partie
            if(!games[payload.id]){
                return
            }else {
                // todo editer la config de la partie
                games[payload.id].startGame(payload)
            }
        })

        socket.on('game:reset',(payload)=>{
            // todo tester si c'est bien l'admin qui decide de reset la partie
            if(!games[payload.id]){
                return
            }else {
                games[payload.id].resetGame()
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
