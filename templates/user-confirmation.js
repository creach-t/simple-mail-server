/**
 * Template d'email de confirmation pour l'utilisateur
 * @param {Object} data - Les données du formulaire et de configuration
 * @returns {Object} - Options d'email pour le transporteur nodemailer
 */
module.exports = function(data) {
  const { name, message, env } = data;
  
  // Template français par défaut pour un portfolio de développeur
  const defaultFrenchText = `Merci pour votre message !

Je tiens à vous confirmer que j'ai bien reçu votre demande et je vous en remercie.
Je l'examine avec attention et reviendrai vers vous très rapidement avec une réponse personnalisée.

Voici un rappel de votre message :
------------------------
${message}
------------------------

N'hésitez pas à consulter mon portfolio pour découvrir mes derniers projets en attendant ma réponse.`;

  // Template HTML français par défaut pour un portfolio de développeur
  const defaultFrenchHTML = `<p>Merci pour votre message !</p>
<p>Je tiens à vous confirmer que j'ai bien reçu votre demande et je vous en remercie.</p>
<p>Je l'examine avec attention et reviendrai vers vous très rapidement avec une réponse personnalisée.</p>
<p><strong>Voici un rappel de votre message :</strong></p>
<blockquote style="border-left: 3px solid #2563eb; padding-left: 15px; background-color: #f8fafc; padding: 10px 15px;">
  ${message.replace(/\n/g, '<br>')}
</blockquote>
<p>N'hésitez pas à consulter mon portfolio pour découvrir mes derniers projets en attendant ma réponse.</p>
<p>À très bientôt,</p>`;

  // Traduction anglaise
  const englishTranslation = `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 0.9em;">
  <p><em>English version:</em></p>
  <p>Thank you for your message!</p>
  <p>I confirm that I have received your inquiry and I appreciate you reaching out.</p>
  <p>I am reviewing it carefully and will get back to you very soon with a personalized response.</p>
  <p>Feel free to explore my portfolio to discover my latest projects while waiting for my reply.</p>
  <p>Best regards,</p>
</div>`;

  return {
    subject: env.CONFIRMATION_SUBJECT || 'Merci pour votre message !',
    text: `
      Bonjour ${name},
      
      ${env.CONFIRMATION_TEXT || defaultFrenchText}
      
      À très bientôt,
      ${env.SIGNATURE || "Théo Creach"}
    `,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="${env.HEADER_STYLE || 'background-color: #2563eb; padding: 20px; text-align: center; color: white;'}">
          <h2 style="margin: 0;">Confirmation de réception</h2>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <p>Bonjour ${name},</p>
          ${env.CONFIRMATION_HTML || defaultFrenchHTML}
          <p style="margin-top: 20px;">À très bientôt,<br><strong>${env.SIGNATURE || "Théo Creach"}</strong></p>
          
          ${englishTranslation}
        </div>
        
        <div style="${env.FOOTER_STYLE || 'background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 0.8em; color: #6b7280;'}">
          <p>Cet email est une confirmation automatique, merci de ne pas y répondre directement.</p>
        </div>
      </div>
    `
  };
};