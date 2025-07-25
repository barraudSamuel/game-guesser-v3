// serveur.js
const express = require('express');
const http = require('http');
require('dotenv').config()
const path = require('path')
const socketIO = require('socket.io');
const {videoGames} = require('./video-games-igdb')
const TelegramService = require("./telegramService");

const telegramService  = new TelegramService()

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
        this.maxUsers = 300
        this.question_types = []
    }

    startGame(payload) {
        this.question_types = payload.question_types.filter(el => el.is_enabled).map(el => el.type)
        this.selectQuestions(payload.number_questions, payload.filters)
        this.status = 'running'
        this.timeForQuestion = payload.time_to_answer
        this.remainingTimeForQuestion = payload.time_to_answer
        const question = this.questions[this.currentQuestionIndex]
        this.io.to(this.id).emit('game:started',{
            cq : {
                t: question.titles,
                ost: question.ost_url,
                cover: question.cover_url,
                year: question.year,
                developer: question.developer,
                categories: question.categories,
                consoles: question.consoles,
                screenshots: question.screenshots,
                themes: question.themes,
                qt: this.selectRandomQuestionTypes()
            },
            st: this.status,
            cqi: this.currentQuestionIndex,
            tq: this.questions.length,
            rtfq: this.remainingTimeForQuestion
        })
        this.startTimer()
    }

    selectRandomQuestionTypes () {
        return this.question_types[Math.floor(Math.random()*this.question_types.length)]
    }

    resetGame() {
        this.stopTimer()
        this.status=  'pending'
        this.questions = []
        this.currentQuestionIndex = 0
        this.timer = null
        this.timeForQuestion = 30
        this.remainingTimeForQuestion = this.timeForQuestion
        this.users.forEach((user, index) => {
            this.users[index].pts = 0
        })
        this.resetUsersHasAnsweredCurrentQuestion()
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
                // this.io.to(this.id).emit('game:timer', {remaining_time: this.remainingTimeForQuestion})
                this.remainingTimeForQuestion--;
            }
        },1000)
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    resetUsersHasAnsweredCurrentQuestion () {
        this.users.forEach((user, index) => {
            this.users[index].has_answered_current_question = false
        })
    }
    nextQuestion() {
        this.resetUsersHasAnsweredCurrentQuestion()
        this.currentQuestionIndex++;
        this.remainingTimeForQuestion = this.timeForQuestion;
        const question = this.questions[this.currentQuestionIndex]
        this.io.to(this.id).emit('game:next-question', {
            cq : {
                t: question.titles,
                ost: question.ost_url,
                cover: question.cover_url,
                year: question.year,
                developer: question.developer,
                categories: question.categories,
                consoles: question.consoles,
                screenshots: question.screenshots,
                themes: question.themes,
                qt: this.selectRandomQuestionTypes()
            },
            cqi: this.currentQuestionIndex,
            tq: this.questions.length,
            rtfq: this.remainingTimeForQuestion
        });
        this.startTimer();
    }

    selectQuestions(numberOfQuestions, filters = {}) {
        // Appliquer les filtres
        let filteredGames = [...videoGames];

        // Filtrer par année
        if (filters.year_min) {
            filteredGames = filteredGames.filter(game => game.year >= filters.year_min);
        }
        if (filters.year_max) {
            filteredGames = filteredGames.filter(game => game.year <= filters.year_max);
        }

        // Filtrer par consoles
        if (filters.consoles && filters.consoles.length > 0) {
            filteredGames = filteredGames.filter(game =>
                game.consoles && game.consoles.some(console =>
                    filters.consoles.includes(console)
                )
            );
        }

        // Vérifier qu'il y a assez de jeux après filtrage
        if (filteredGames.length === 0) {
            console.warn('Aucun jeu trouvé avec les filtres appliqués, utilisation de tous les jeux');
            filteredGames = [...videoGames];
        }

        // Si on demande plus de questions qu'il n'y a de jeux disponibles
        const actualNumberOfQuestions = Math.min(numberOfQuestions, filteredGames.length);

        // Tableau résultant
        const newQuestions = [];
        for (let i = 0; i < actualNumberOfQuestions; i++) {
            // Sélection d'un index au hasard dans le tableau restant
            const indexRandom = Math.floor(Math.random() * filteredGames.length);

            // Ajout de l'élément correspondant à l'index au tableau résultant
            newQuestions.push(filteredGames[indexRandom]);

            // Suppression de l'élément du tableau de base copié pour éviter la répétition
            filteredGames.splice(indexRandom, 1);
        }
        this.questions = newQuestions
    }

    joinGame(data, socket) {
        const newUser = {
            id: data.id,
            display_name: data.display_name,
            pts:0,
            is_game_host: data.is_game_host,
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

    answerQuestion(id) {
        const usersWhoAnswered = this.users.filter(el => el.has_answered_current_question === true).length
        const user = this.users.find(el => el.id === id)
        if (!user.has_answered_current_question){
            user.pts = user.pts + this.users.length - usersWhoAnswered
            user.has_answered_current_question =  true
            this.io.to(this.id).emit('game:user-answered', {
                id: user.id,
                pts: user.pts
            })
            // tous les joueurs ont repondu donc on passe a la question suivante
            if (this.users.filter(el => el.has_answered_current_question === true).length === this.users.length) {
                if (this.currentQuestionIndex + 1 < this.questions.length) {
                    this.stopTimer()
                    this.nextQuestion()
                } else {
                    this.stopTimer()
                    this.status = 'finished'
                    this.io.to(this.id).emit('game:finished',{st : this.status})
                }
            }
        }
    }
}


function ServeurJeu() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server, {
        cors: {
            origin: process.env.APP_URL,
        }});
    const games = {};

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('frontend/dist'))
        app.get('*', (req, res, next) => {
            res.sendFile('index.html', {'root': path.join(__dirname, './frontend/dist')})
        })
    }

    io.on('connection', (socket) => {
        socket.on('game:create', (payload) => {
            socket.join(payload.id); // l'utilisateur rejoint la room
            if (!games[payload.id]) { // si la partie existe pas
                games[payload.id] = new Game(payload.id, io);
                games[payload.id].joinGame({id:socket.id, display_name: payload.display_name, is_game_host: true}, socket)
                socket.emit('game:infos-users', {users: games[payload.id].users})
                telegramService.sendNotification(process.env.TELEGRAM_CHAT_ID, 'Nouvelle partie', `Une nouvelle partie a été créée par ${payload.display_name}`)
            } else {
                games[payload.id].joinGame({id:socket.id, display_name: payload.display_name, is_game_host: false}, socket)
                socket.emit('game:infos-users', {users: games[payload.id].users})
            }
        });

        socket.on('game:join', (payload) => {
            if (games[payload.id]) {
                const game = games[payload.id]
                // on regarde si l'utilisateur est pas deja present
                const user = game.users.find(el => el.id === socket.id)
                if (game.users.length < game.maxUsers && game.status === 'pending' && !user) {
                    socket.join(payload.id);
                    game.joinGame({id:socket.id, display_name: payload.display_name, is_game_host: false}, socket)
                    socket.emit('game:infos-users', {users: game.users})
                } else {
                    socket.emit('toast',{m: 'game-full-started',e:true})
                }
            } else {
                socket.emit('toast',{m: 'game-not-found',e:true})
            }
        })

        socket.on('game:start', (payload) => {
            if(!games[payload.id]){
                socket.emit('toast',{m: 'game-not-found',e:true})
            }else {
                const game = games[payload.id]
                const user = game.users.find(el => el.id === socket.id)
                if (user.is_game_host) {
                    game.startGame(payload)
                }
            }
        })

        socket.on('game:reset',(payload)=>{
            if(!games[payload.id]){
                socket.emit('toast',{m: 'game-not-found',e:true})
            }else {
                const game = games[payload.id]
                const user = game.users.find(el => el.id === socket.id)
                if (user.is_game_host) {
                    game.resetGame()
                }
            }
        })

        socket.on('game:send-answer', (payload) => {
            if (!games[payload.id]) {
                socket.emit('toast',{m: 'game-not-found',e:true})
            } else {
                games[payload.id].answerQuestion(socket.id)
            }
        })

        socket.on('game:leave', () => {
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
            socket.leaveAll()
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
        const port = process.env.PORT;
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
