/**
 * Template d'email de confirmation pour l'utilisateur
 * @param {Object} data - Les données du formulaire et de configuration
 * @returns {Object} - Options d'email pour le transporteur nodemailer
 */
module.exports = function(data) {
  const { name, message, env } = data;
  
  // Template français rédigé à la première personne
  const defaultFrenchText = `Merci pour votre message !

Je vous confirme que j'ai bien reçu votre message et je vous en remercie.
Je vais l'examiner personnellement et je reviendrai vers vous dans les plus brefs délais.

Voici un rappel de votre message :
------------------------
${message}
------------------------

En attendant ma réponse, je vous invite à découvrir mes derniers projets sur mon portfolio.

Cordialement,`;

  // Template HTML français rédigé à la première personne
  const defaultFrenchHTML = `<p>Merci pour votre message !</p>
<p>Je vous confirme que j'ai bien reçu votre message et je vous en remercie.</p>
<p>Je vais l'examiner personnellement et je reviendrai vers vous dans les plus brefs délais.</p>
<p><strong>Voici un rappel de votre message :</strong></p>
<blockquote style="border-left: 3px solid #2563eb; padding-left: 15px; background-color: #f8fafc; padding: 10px 15px;">
  ${message.replace(/\n/g, '<br>')}
</blockquote>
<p>En attendant ma réponse, je vous invite à découvrir mes derniers projets sur mon portfolio.</p>
<p>Cordialement,</p>`;

  // Traduction anglaise à la première personne
  const englishTranslation = `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 0.9em;">
  <p><em>English version:</em></p>
  <p>Thank you for your message!</p>
  <p>I confirm that I have received your inquiry and I appreciate you reaching out to me.</p>
  <p>I will personally review it and get back to you as soon as possible with a response.</p>
  <p>While waiting for my reply, I invite you to explore my latest projects on my portfolio.</p>
  <p>Best regards,</p>
</div>`;

  return {
    subject: env.CONFIRMATION_SUBJECT || 'Merci pour votre message !',
    text: `
      Bonjour ${name},
      
      ${env.CONFIRMATION_TEXT || defaultFrenchText}
      ${env.SIGNATURE || "Théo Creach"}
    `,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="${env.HEADER_STYLE || 'background-color: #2563eb; padding: 20px; text-align: center; color: white;'}">
          <h2 style="margin: 0;">Confirmation de réception</h2>
        </div>
        
        <div style="padding: 20px; background-color: white; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bonjour ${name},</p>
          ${env.CONFIRMATION_HTML || defaultFrenchHTML}
          <p style="margin-top: 20px;">Cordialement,<br><strong>${env.SIGNATURE}</strong></p>
          
          ${englishTranslation}
        </div>
        
        <div style="${env.FOOTER_STYLE || 'background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 0.8em; color: #6b7280; border: 1px solid #e5e7eb; border-top: none;'}">
          <p>Cet email est une confirmation automatique, merci de ne pas y répondre directement.</p>
        </div>
      </div>
    `
  };
};