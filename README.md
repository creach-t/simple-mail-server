# Serveur de Mailing Simple

Un serveur Node.js complet pour gérer l'envoi d'emails à partir d'un formulaire de contact, avec confirmation automatique à l'expéditeur.

## Fonctionnalités

- API REST pour l'envoi d'emails
- Envoi automatique d'un email de confirmation à l'expéditeur
- Support pour SMTP local (Postfix) ou services externes (SendGrid, etc.)
- Protection contre les abus avec rate limiting
- Configuration facile via variables d'environnement
- **Port par défaut : 4058**