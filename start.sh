#!/bin/sh

# Démarrer Postfix
postfix start

# Appliquer les configurations de sécurité pour Postfix
echo "Configuration de Postfix pour le chiffrement TLS..."
chmod +x /app/postfix-config.sh
/app/postfix-config.sh

# Attendre que Postfix soit prêt
echo "Démarrage de Postfix..."
sleep 2

# Démarrer l'application Node.js
echo "Démarrage du serveur Node.js..."
node server.js