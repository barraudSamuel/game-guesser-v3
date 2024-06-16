# Dockerfile

# Étape de build pour le frontend
FROM node:21 as frontend-build
WORKDIR /app
COPY ./frontend/package*.json ./frontend/
RUN npm install --prefix ./frontend
COPY ./frontend ./frontend
RUN npm run build --prefix ./frontend

# Étape de build pour le backend
FROM node:21
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Copiez les fichiers buildés du frontend dans le backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Exposez le port sur lequel le serveur va écouter
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["node", "index.js"]
