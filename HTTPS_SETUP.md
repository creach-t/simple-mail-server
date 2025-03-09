# Guide d'installation HTTPS pour le serveur de mailing

Ce guide vous aidera à configurer HTTPS sur votre serveur de mailing pour résoudre le problème de "contenu mixte" (mixed content).

## Pourquoi HTTPS est nécessaire ?

Si votre site web est servi en HTTPS (comme c'est le cas pour la plupart des sites modernes), les navigateurs bloquent les requêtes HTTP non sécurisées depuis ce site. C'est ce qu'on appelle le "contenu mixte".

## Option 1 : Configurer Let's Encrypt (Recommandé)

Let's Encrypt est une autorité de certification gratuite qui vous permet d'obtenir facilement des certificats SSL valides.

### Étape 1 : Installer Certbot

```bash
# Sur Ubuntu/Debian
sudo apt update
sudo apt install certbot

# Sur CentOS/RHEL
sudo yum install certbot
```

### Étape 2 : Obtenir un certificat SSL

```bash
# Remplacez votre-domaine.com par le domaine pointant vers votre serveur
sudo certbot certonly --standalone -d api.votre-domaine.com
```

Si vous n'avez pas de sous-domaine dédié, vous pouvez utiliser votre adresse IP, mais ce n'est pas recommandé pour la production.

### Étape 3 : Configurer le serveur avec les certificats

Les certificats seront générés dans le dossier `/etc/letsencrypt/live/api.votre-domaine.com/`. Mettez à jour votre fichier .env :

```
SSL_PATH=/etc/letsencrypt/live/api.votre-domaine.com
```

### Étape 4 : Redémarrer le serveur

```bash
docker compose down
docker compose up -d
```

## Option 2 : Utiliser des certificats auto-signés (Pour développement uniquement)

Pour un environnement de développement, vous pouvez créer des certificats auto-signés :

```bash
# Créer un répertoire pour les certificats
mkdir -p certs

# Générer un certificat auto-signé
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/privkey.pem -out certs/cert.pem

# Créer un fichier chain.pem (pour la compatibilité)
cp certs/cert.pem certs/chain.pem
```

Puis, mettez à jour votre fichier .env :
```
SSL_PATH=./certs
```

## Option 3 : Utiliser un proxy inverse (Nginx/Apache)

Si vous avez déjà Nginx ou Apache configuré sur votre serveur, vous pouvez les utiliser comme proxy inverse HTTPS :

### Exemple avec Nginx :

```nginx
server {
    listen 443 ssl;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/api.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4058;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Mise à jour du composant React

Une fois que vous avez configuré HTTPS, modifiez l'URL dans votre composant React pour utiliser https :

```javascript
const response = await fetch('https://api.votre-domaine.com:4059/api/contact', {...});
// ou si vous utilisez un proxy inverse standard
const response = await fetch('https://api.votre-domaine.com/api/contact', {...});
```

## Renouvellement automatique des certificats Let's Encrypt

Les certificats Let's Encrypt expirent après 90 jours. Pour les renouveler automatiquement :

```bash
# Ajouter une tâche cron pour le renouvellement automatique
sudo crontab -e
```

Ajoutez cette ligne :
```
0 3 * * * certbot renew --quiet && docker restart mail-server
```

Cela vérifiera et renouvellera les certificats à 3h du matin chaque jour (si nécessaire) et redémarrera le conteneur Docker.

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur : `docker logs mail-server`
2. Assurez-vous que les ports 4058 et 4059 sont ouverts dans votre pare-feu
3. Vérifiez que les certificats sont correctement montés dans le conteneur Docker