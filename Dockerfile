FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le reste des fichiers
COPY . .

# Exposer les ports HTTP et HTTPS
EXPOSE 4058
EXPOSE 4059

# Commande de démarrage
CMD ["node", "server.js"]