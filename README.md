# Serveur de Mailing Simple

Un serveur Node.js complet pour gérer l'envoi d'emails à partir d'un formulaire de contact, avec confirmation automatique à l'expéditeur.

## Fonctionnalités

- API REST pour l'envoi d'emails
- Envoi automatique d'un email de confirmation à l'expéditeur
- Support pour SMTP local (Postfix) ou services externes (SendGrid, etc.)
- **Postfix intégré directement dans le conteneur Docker**
- **Chiffrement TLS pour la sécurité des emails**
- **Support DKIM pour l'authentification des emails**
- Protection contre les abus avec rate limiting
- Configuration facile via variables d'environnement
- **Port par défaut : 4058**

## Prérequis

- Node.js (v14 ou supérieur)
- NPM ou Yarn
- Docker et Docker Compose (pour l'installation avec Docker)

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/creach-t/simple-mail-server.git
   cd simple-mail-server
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à partir de l'exemple :
   ```bash
   cp .env.example .env
   ```

4. Modifiez le fichier `.env` avec vos propres paramètres

## Configuration

Modifiez le fichier `.env` pour configurer votre serveur :

```
# Adresse email qui recevra les messages du formulaire
TO_EMAIL=votre.email@example.com

# Email et nom affichés comme expéditeur
FROM_EMAIL=contact@votredomaine.com
FROM_NAME=Votre Nom ou Entreprise

# Origines autorisées pour les requêtes CORS
ALLOWED_ORIGINS=https://votre-site.com,http://localhost:3000
```

### Utilisation avec un service SMTP externe

Si vous préférez utiliser un service comme SendGrid, Mailgun, etc., configurez les variables SMTP :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=votre_cle_api
```

### Configuration DKIM (pour améliorer la délivrabilité)

Pour configurer DKIM, qui améliore considérablement la délivrabilité et l'authenticité de vos emails :

1. Générez une paire de clés DKIM :
   ```bash
   openssl genrsa -out private.key 2048
   openssl rsa -in private.key -pubout -out public.key
   ```

2. Configurez votre DNS en ajoutant un enregistrement TXT :
   ```
   mail._domainkey.votredomaine.com. IN TXT "v=DKIM1; k=rsa; p=VOTRE_CLE_PUBLIQUE"
   ```
   (Remplacez VOTRE_CLE_PUBLIQUE par le contenu de public.key, sans les en-têtes et en supprimant les sauts de ligne)

3. Dans votre fichier `.env`, ajoutez :
   ```
   DKIM_DOMAIN=votredomaine.com
   DKIM_SELECTOR=mail
   DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nContenu de votre clé privée ici\n-----END PRIVATE KEY-----
   ```
   Note : Pour le DKIM_PRIVATE_KEY, utilisez la clé avec des \n pour les sauts de ligne.

## Démarrage

Pour démarrer le serveur :

```bash
npm start
```

Pour le développement (avec redémarrage automatique) :

```bash
npm run dev
```

## Utilisation avec le formulaire React

Voici comment modifier votre composant React pour utiliser ce serveur :

```jsx
// Dans votre composant ContactModal.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setStatus({
    submitting: true,
    success: false,
    error: false,
    message: ""
  });
  
  try {
    const response = await fetch('https://votre-serveur.com:4058/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setStatus({
        submitting: false,
        success: true,
        error: false,
        message: "Votre message a été envoyé avec succès!"
      });
      resetForm();
    } else {
      throw new Error(data.message || "Une erreur s'est produite");
    }
  } catch (error) {
    setStatus({
      submitting: false,
      success: false,
      error: true,
      message: error.message || "Une erreur s'est produite lors de l'envoi"
    });
  }
};
```

## Déploiement

### Avec Docker (recommandé)

1. Assurez-vous que Docker et Docker Compose sont installés sur votre serveur
2. Clonez ce dépôt sur votre serveur
3. Créez et configurez le fichier `.env`
4. Lancez le service avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

Le serveur est entièrement autonome, avec Postfix installé directement dans le conteneur Docker et configuré pour le chiffrement TLS. Vous n'avez pas besoin d'installer séparément un serveur de messagerie sur votre machine hôte.

### Sur un VPS ou serveur dédié (sans Docker)

1. Transférez les fichiers sur votre serveur
2. Installez les dépendances : `npm install --production`
3. Créez et configurez le fichier `.env`
4. Installez Postfix : `sudo apt install postfix` ou équivalent
5. Configurez Postfix pour TLS :
   ```bash
   sudo postconf -e "smtpd_tls_security_level = may"
   sudo postconf -e "smtp_tls_security_level = may"
   ```
6. Démarrez avec PM2 pour le maintenir actif :
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mail-server"
   pm2 save
   pm2 startup
   ```

## Test du serveur

Pour vérifier que votre serveur fonctionne correctement, vous pouvez envoyer une requête test :

```bash
curl -X POST http://localhost:4058/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"votre@email.com","subject":"Test","message":"Test message"}'
```

## Résolution des problèmes courants

### Erreur de proxy

Si vous obtenez une erreur concernant `X-Forwarded-For` et `trust proxy`, c'est normal lorsque vous exécutez le serveur derrière un proxy (comme Nginx). Cette version du serveur est déjà configurée pour corriger ce problème.

### Erreur de connexion SMTP

Si vous rencontrez des erreurs de connexion SMTP, vérifiez :
- Si vous utilisez le serveur Postfix intégré, assurez-vous que le port 25 n'est pas bloqué
- Si vous utilisez un service SMTP externe, vérifiez vos identifiants et la configuration dans le fichier `.env`

### Problèmes de délivrabilité des emails

Si vos emails arrivent dans les spams ou ne sont pas délivrés :
1. Vérifiez que votre domaine a un enregistrement SPF correct
2. Configurez DKIM comme expliqué ci-dessus
3. Assurez-vous que l'adresse d'expéditeur correspond bien à votre domaine

## Sécurité

- Ce serveur inclut une protection contre les abus (5 requêtes max par 15 minutes)
- Le chiffrement TLS est activé par défaut pour les connexions SMTP
- Support DKIM pour l'authentification des emails
- Validez toujours les entrées côté client ET côté serveur
- Envisagez d'ajouter un CAPTCHA pour une sécurité supplémentaire

## Licence

MIT