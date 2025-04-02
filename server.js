const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const http = require('http');
const path = require('path');

// Importer les templates d'emails
const emailTemplates = require('./templates');

// Charger les variables d'environnement
dotenv.config();

const app = express();
// Configuration pour faire confiance au proxy - AJOUTÉ
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4058;

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
  
  // Configuration DKIM si disponible
  const dkimConfig = process.env.DKIM_PRIVATE_KEY && {
    domainName: process.env.DKIM_DOMAIN || process.env.FROM_EMAIL.split('@')[1],
    keySelector: process.env.DKIM_SELECTOR || 'mail',
    privateKey: process.env.DKIM_PRIVATE_KEY.replace(/\\n/g, '\n')
  };
  
  // Sinon, utiliser Postfix local avec options de sécurité
  return nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    dkim: dkimConfig
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
    
    // Options communes pour tous les emails
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 15)}@${process.env.FROM_EMAIL ? process.env.FROM_EMAIL.split('@')[1] : 'example.com'}>`;
    const commonOptions = {
      messageId,
      headers: {
        'X-Mailer': 'Simple Mail Server',
        'List-Unsubscribe': `<mailto:${process.env.FROM_EMAIL || 'contact@example.com'}?subject=unsubscribe>`,
        'X-Priority': '3', // Normal
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      }
    };
    
    // Email au propriétaire du site - Utiliser le template adminNotification
    const adminEmailOptions = emailTemplates.adminNotification({ name, email, subject, message });
    await transporter.sendMail({
      ...commonOptions,
      ...adminEmailOptions,
      from: `"${process.env.FROM_NAME || 'Formulaire de contact'}" <${process.env.FROM_EMAIL || 'contact@example.com'}>`,
      to: process.env.TO_EMAIL || 'votre.email@example.com',
    });
    
    // Email de confirmation à l'expéditeur - Utiliser le template userConfirmation
    const userEmailOptions = emailTemplates.userConfirmation({ 
      name, 
      message, 
      env: process.env 
    });
    await transporter.sendMail({
      ...commonOptions,
      ...userEmailOptions,
      from: `"${process.env.FROM_NAME || 'Votre Site'}" <${process.env.FROM_EMAIL || 'contact@example.com'}>`,
      to: email,
      replyTo: process.env.FROM_EMAIL || 'contact@example.com',
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
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur de mailing en écoute sur le port ${PORT}`);
});
