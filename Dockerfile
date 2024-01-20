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

# Définir une variable d'environnement dans le Dockerfile
ENV PORT=3000
ENV APP_URL=http://localhost:3000
ENV NODE_ENV=production

# Exposez le port sur lequel le serveur va écouter
EXPOSE $PORT

# Commande de démarrage de l'application
CMD ["node", "index.js"]