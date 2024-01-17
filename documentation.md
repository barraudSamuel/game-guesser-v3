Liste des events : 

envois client :
- `game:create`
> est trigger quand l'utiliateur est sur la page d'accueil et creer une partie apres avoir rentré son pseudo
> 
> il contient : `{id: String, display_name: String}`
- `game:start`
>est trigger quand l'utilisateur qui est admin de la partie decide de lancer la partie depuis le lobby
>
> il contient :  `{id: String, num_questions: Num, time_to_answer: Num, question_types: Array }`
- `game:join`
> est trigger quand un utilisateur est invité et rejoint la partie apres avoir rentré son pseudo
>
> il contient : `{id: String, display_name: String}`
- `game:send-answer`
> est trigger quand un utilisateur rentre une reponse a une question
>
> il contient : `{id: String, answer: String}`
- `game:reset`
>est trigger quand l'admin de la partie fait un retour au lobby quand la partie est finie
> 
> il contient : `{id: String}`

envois serveur: 
- `game:infos-users`
> est trigger quand on rejoint une partie et quand on reset une partie
> 
> renvoit la liste de tous les joueurs
- `game:starded`
> est trigger quand la partie passe en  running
>
> renvoit le statut de la partie
- `game:user-leaved`
> est trigger quand un utilisateur quitte la partie ou est deconnecté
>
> il contient l'id de l'utilisateur: `{id: String}`
- `game:user-joined`
> est trigger quand un utilisateur rejoint une partie
>
> il contient les informations de l'utilisateur :  `{id:String, display_name: String, pts: Number, is_game_host: Boolean}`
- `game:next-question`
>est trigger quand on passe a la question suivante
>
> il contient les infos de la question en cours, l'index encours et le temps restant pour repondre : `{current_question:Object, current_question_index: Numberm, remaining_time_for_question: Number}`
- `game:timer`
>est trigger toutes les secondes 
> 
> il contient : `{remaining_time: Number}`

- `game:finished`
> est trigger quand la partie se finit
> 
> il contient: `{st: 'finished'}`

- `game:user-answered`
> est trigger quand un utilisateur a repondu
> il contient  `{id: String}`

event de base server :
- `disconnecting` 
- `connection`



-----------
faire fonctionner les ost   

ajouter des themes

rendre dynamique le nombre max d'utilisateurs ?

quand on est sur la page accueil se deconnecter de tt les events