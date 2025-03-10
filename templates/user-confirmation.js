/**
 * Template d'email de confirmation pour l'utilisateur
 * @param {Object} data - Les données du formulaire et de configuration
 * @returns {Object} - Options d'email pour le transporteur nodemailer
 */
module.exports = function(data) {
  const { name, message, env } = data;
  
  return {
    subject: env.CONFIRMATION_SUBJECT || 'Confirmation de votre message',
    text: `
      Bonjour ${name},
      
      ${env.CONFIRMATION_TEXT || `Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.
      Notre équipe vous répondra dans les plus brefs délais.
      
      Voici un rappel de votre message :
      ------------------------
      ${message}
      ------------------------`}
      
      Cordialement,
      ${env.SIGNATURE || "L'équipe de votre site"}
    `,
    html: `
      <p>Bonjour ${name},</p>
      <p>${env.CONFIRMATION_HTML || `Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
      <p>Notre équipe vous répondra dans les plus brefs délais.</p>
      <p><strong>Voici un rappel de votre message :</strong></p>
      <blockquote style="border-left: 2px solid #ccc; padding-left: 10px;">
        ${message.replace(/\n/g, '<br>')}
      </blockquote>`}
      <p>Cordialement,<br>${env.SIGNATURE || "L'équipe de votre site"}</p>
    `
  };
};