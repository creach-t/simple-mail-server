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

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4058;
const HTTPS_PORT = process.env.HTTPS_PORT || 4059;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Limiteur de taux pour éviter les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes max par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

// Appliquer le limiteur à la route de contact
app.use('/api/contact', limiter);

// Configuration du transporteur d'email
const createTransporter = () => {
  // Si des variables d'environnement pour un service SMTP externe sont fournies, les utiliser
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
  } 
  
  // Sinon, utiliser Postfix local
  return nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Route pour vérifier si le serveur est en marche
app.get('/', (req, res) => {
  res.send('Serveur de mailing opérationnel');
});

// Route pour l'envoi d'emails
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validation des champs
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tous les champs requis doivent être remplis' 
    });
  }
  
  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Adresse email invalide' 
    });
  }
  
  try {
    const transporter = createTransporter();
    
    // Email au propriétaire du site
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Formulaire de contact'}" <${process.env.FROM_EMAIL || 'contact@example.com'}>`,
      to: process.env.TO_EMAIL || 'votre.email@example.com',
      subject: `Nouveau message: ${subject || 'Sans objet'}`,
      text: `
        Nom: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    
    // Email de confirmation à l'expéditeur
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Votre Site'}" <${process.env.FROM_EMAIL || 'contact@example.com'}>`,
      to: email,
      subject: process.env.CONFIRMATION_SUBJECT || 'Confirmation de votre message',
      text: `
        Bonjour ${name},
        
        ${process.env.CONFIRMATION_TEXT || `Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.
        Notre équipe vous répondra dans les plus brefs délais.
        
        Voici un rappel de votre message :
        ------------------------
        ${message}
        ------------------------`}
        
        Cordialement,
        ${process.env.SIGNATURE || "L'équipe de votre site"}
      `,
      html: `
        <p>Bonjour ${name},</p>
        <p>${process.env.CONFIRMATION_HTML || `Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p><strong>Voici un rappel de votre message :</strong></p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 10px;">
          ${message.replace(/\n/g, '<br>')}
        </blockquote>`}
        <p>Cordialement,<br>${process.env.SIGNATURE || "L'équipe de votre site"}</p>
      `
    });
    
    res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Démarrer le serveur HTTP
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Serveur HTTP en écoute sur le port ${PORT}`);
});

// Démarrer le serveur HTTPS si les certificats sont disponibles
try {
  // Chemin vers les certificats SSL
  const sslPath = process.env.SSL_PATH || '/etc/letsencrypt/live/your-domain';
  
  // Vérifier si les certificats existent
  if (fs.existsSync(path.join(sslPath, 'privkey.pem')) && 
      fs.existsSync(path.join(sslPath, 'cert.pem')) && 
      fs.existsSync(path.join(sslPath, 'chain.pem'))) {
    
    const credentials = {
      key: fs.readFileSync(path.join(sslPath, 'privkey.pem'), 'utf8'),
      cert: fs.readFileSync(path.join(sslPath, 'cert.pem'), 'utf8'),
      ca: fs.readFileSync(path.join(sslPath, 'chain.pem'), 'utf8')
    };
    
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`Serveur HTTPS en écoute sur le port ${HTTPS_PORT}`);
    });
  } else {
    console.log('Certificats SSL non trouvés. Le serveur fonctionne uniquement en HTTP.');
    console.log(`Pour générer des certificats SSL, utilisez Let's Encrypt (certbot).`);
  }
} catch (error) {
  console.error('Erreur lors du démarrage du serveur HTTPS:', error);
  console.log('Le serveur fonctionne uniquement en HTTP.');
}