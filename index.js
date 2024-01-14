// serveur.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {questions} = require('./questions')

// names:
// cq => current_question
// qt => question_type
// st => status
// cqi => current_question_index
// tq => total_questions
// rtfq => remaining_time_for_question

class Game {
    constructor(gameId, io) {
        this.id = gameId
        this.io = io
        this.questions = []
        this.currentQuestionIndex = 0
        this.timer = null
        this.timeForQuestion = 30
        this.remainingTimeForQuestion = this.timeForQuestion
        this.users = []
        this.status = 'pending'
    }

    startGame(payload) {
        this.selectQuestions(payload.number_questions)
        this.status = 'running'
        this.timeForQuestion = payload.time_to_answer
        this.remainingTimeForQuestion = payload.time_to_answer
        const question = this.questions[this.currentQuestionIndex]
        this.io.to(this.id).emit('game:infos',{
            cq : {
                t: question.titles[0],
                ost: question.ost_url,
                cover: question.cover_url,
                qt: 'blur'
            },
            st: this.status,
            cqi: this.currentQuestionIndex,
            tq: this.questions.length,
            rtfq: this.timeForQuestion
        })
        this.startTimer()
    }

    resetGame() {
        this.status=  'pending'
        this.questions = []
        this.currentQuestionIndex = 0
        this.timer = null
        this.timeForQuestion = 30
        this.remainingTimeForQuestion = this.timeForQuestion
        this.users.forEach((user, index) => {
            this.users[index].pts = 0
        })
        this.io.to(this.id).emit('game:reset')
    }

    startTimer() {
        this.remainingTimeForQuestion--;
        this.timer = setInterval(()=>{
            if (this.remainingTimeForQuestion === 0) { // si le timer est fini
                this.stopTimer() // on stop le timer
                if (this.currentQuestionIndex + 1 < this.questions.length) { // on passe a la question suivante
                    this.nextQuestion();
                } else { // la partie est finie
                    this.status = 'finished'
                    this.io.to(this.id).emit('game:finished',{st : this.status})
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
        const question = this.questions[this.currentQuestionIndex]
        this.io.to(this.id).emit('game:next-question', {
            cq : {
                t: question.titles[0],
                ost: question.ost_url,
                cover: question.cover_url,
                qt: 'blur'
            },
            cqi: this.currentQuestionIndex,
            tq: this.questions.length,
            rtfq: this.remainingTimeForQuestion
        });
        this.startTimer();
    }

    selectQuestions(numberOfQuestions) {
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
            if(!games[payload.id]){
                return
            }else {
                const game = games[payload.id]
                const user = game.users.find(el => el.id === socket.id)
                if (user.is_game_host) {
                    game.startGame(payload)
                }
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
