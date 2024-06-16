# Dockerfile

# Étape de build pour le frontend
FROM node:21 as frontend-build
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend .
RUN npm run build

# Étape de build pour le backend
FROM node:21 as backend-build
WORKDIR /app
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend .

# Copiez les fichiers buildés du frontend dans le backend
COPY --from=frontend-build /app/dist ./frontend/dist

# Exposez le port sur lequel le serveur va écouter
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["node", "index.js"]