const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

// Importer les templates d'emails
const emailTemplates = require('./templates');

// Charger les variables d'environnement
dotenv.config();

const app = express();
// Configuration pour faire confiance au proxy - AJOUTÉ
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4058;
const HTTPS_PORT = process.env.HTTPS_PORT || 4059;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Reste du code identique... 

// Démarrer le serveur HTTP
const httpServer = http.createServer(app);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur de mailing en écoute sur le port ${PORT}`);
});

// Gestion optionnelle du HTTPS avec une approche plus flexible
if (process.env.SSL_PATH) {
  try {
    const sslPath = process.env.SSL_PATH;
    const certFiles = ['privkey.pem', 'cert.pem', 'chain.pem'];
    
    const allCertsExist = certFiles.every(file => 
      fs.existsSync(path.join(sslPath, file))
    );

    if (allCertsExist) {
      const credentials = {
        key: fs.readFileSync(path.join(sslPath, 'privkey.pem'), 'utf8'),
        cert: fs.readFileSync(path.join(sslPath, 'cert.pem'), 'utf8'),
        ca: fs.readFileSync(path.join(sslPath, 'chain.pem'), 'utf8')
      };
      
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`Serveur HTTPS en écoute sur le port ${HTTPS_PORT}`);
      });
    } else {
      console.log('Certificats SSL incomplets. Utilisation du serveur HTTP uniquement.');
    }
  } catch (error) {
    console.error('Erreur lors de la configuration HTTPS:', error);
    console.log('Continuation avec le serveur HTTP uniquement.');
  }
}
