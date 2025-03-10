FROM node:18-alpine

# Installer Postfix et ses dépendances
RUN apk add --no-cache postfix && \
    postconf -e 'inet_interfaces = loopback-only' && \
    postconf -e 'mydestination = localhost.localdomain, localhost'

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

# Script de démarrage pour lancer Postfix et Node.js
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]