# Serveur de Mailing Simple

Un serveur Node.js complet pour gérer l'envoi d'emails à partir d'un formulaire de contact, avec confirmation automatique à l'expéditeur.

## Fonctionnalités

- API REST pour l'envoi d'emails
- Envoi automatique d'un email de confirmation à l'expéditeur
- Support pour SMTP local (Postfix) ou services externes (SendGrid, etc.)
- Protection contre les abus avec rate limiting
- Configuration facile via variables d'environnement
- **Port par défaut : 4058**

## Prérequis

- Node.js (v14 ou supérieur)
- NPM ou Yarn
- Un serveur SMTP (Postfix) configuré localement ou un compte chez un fournisseur de services SMTP

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
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_cle_api
```

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

### Sur un VPS ou serveur dédié

1. Transférez les fichiers sur votre serveur
2. Installez les dépendances : `npm install --production`
3. Créez et configurez le fichier `.env`
4. Démarrez avec PM2 pour le maintenir actif :
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mail-server"
   pm2 save
   pm2 startup
   ```

### Avec Docker (recommandé)

1. Assurez-vous que Docker et Docker Compose sont installés sur votre serveur
2. Clonez ce dépôt sur votre serveur
3. Créez et configurez le fichier `.env`
4. Lancez le service avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

### Sur un service PaaS (Heroku, Railway, etc.)

Suivez la documentation du service pour déployer une application Node.js et configurez les variables d'environnement via l'interface du service.

## Test du serveur

Pour vérifier que votre serveur fonctionne correctement, vous pouvez envoyer une requête test :

```bash
curl -X POST http://localhost:4058/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"votre@email.com","subject":"Test","message":"Test message"}'
```

## Sécurité

- Ce serveur inclut une protection contre les abus (5 requêtes max par 15 minutes)
- Validez toujours les entrées côté client ET côté serveur
- Envisagez d'ajouter un CAPTCHA pour une sécurité supplémentaire

## Licence

MIT