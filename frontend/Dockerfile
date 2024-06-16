# Utilisez une image Node.js en tant qu'image de base pour le frontend
FROM node:21 as build-stage

# Définissez le répertoire de travail pour le frontend
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json pour installer les dépendances du frontend
COPY package*.json ./

# Installez les dépendances du frontend
RUN npm install

# Copiez le reste des fichiers du frontend
COPY . .

# Construisez les fichiers de production du frontend
RUN npm run build

# Utilisez une image légère basée sur Nginx pour servir les fichiers de production
FROM nginx:alpine

# Copiez les fichiers de build du frontend dans le répertoire d'Nginx pour les servir
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exposez le port sur lequel Nginx va écouter
EXPOSE 80

# Aucune commande spécifique nécessaire, Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]