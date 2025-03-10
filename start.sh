#!/bin/sh

# Démarrer Postfix
postfix start

# Attendre que Postfix soit prêt
echo "Démarrage de Postfix..."
sleep 2

# Démarrer l'application Node.js
echo "Démarrage du serveur Node.js..."
node server.js