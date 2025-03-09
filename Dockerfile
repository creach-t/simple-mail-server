FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le reste des fichiers
COPY . .

# Exposer le port défini dans les variables d'environnement
EXPOSE 4058

# Commande de démarrage
CMD ["node", "server.js"]