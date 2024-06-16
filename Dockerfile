# Utilisez une image Node.js en tant qu'image de base
FROM node:21

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json pour installer les dépendances du serveur
COPY package*.json ./

# Installez les dépendances du serveur
RUN npm install

# Copiez le reste des fichiers de l'application dans le conteneur
COPY . .

# Copiez les fichiers de build du frontend
COPY --from=frontend /app/dist ./frontend/dist

# Exposez le port sur lequel le serveur va écouter
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["node", "index.js"]