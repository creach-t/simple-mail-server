FROM node:18-alpine

# Installer Postfix et ses dépendances
RUN apk add --no-cache postfix openssl ca-certificates && \
    postconf -e 'inet_interfaces = loopback-only' && \
    postconf -e 'mydestination = localhost.localdomain, localhost' && \
    # Générer un certificat auto-signé pour TLS
    mkdir -p /etc/postfix/certs && \
    openssl req -new -x509 -nodes -out /etc/postfix/certs/cert.pem \
    -keyout /etc/postfix/certs/key.pem -days 3650 \
    -subj "/C=FR/ST=State/L=City/O=Organization/CN=localhost" && \
    chmod 600 /etc/postfix/certs/* && \
    # Configurer TLS dans Postfix
    postconf -e "smtpd_tls_cert_file = /etc/postfix/certs/cert.pem" && \
    postconf -e "smtpd_tls_key_file = /etc/postfix/certs/key.pem" && \
    postconf -e "smtpd_tls_security_level = may" && \
    postconf -e "smtp_tls_security_level = may"

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