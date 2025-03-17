/**
 * Template d'email de notification pour l'administrateur du site
 * @param {Object} data - Les données du formulaire
 * @returns {Object} - Options d'email pour le transporteur nodemailer
 */
module.exports = function(data) {
  const { name, email, subject, message } = data;
  
  return {
    subject: `Nouveau message: ${subject || 'Sans objet'}`,
    text: `
      Nom: ${name}
      Email: ${email}
      
      Message:
      ${message}
    `,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Nouveau message de contact</h2>
        </div>
        
        <div style="padding: 20px; background-color: white; border: 1px solid #e5e7eb; border-top: none;">
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${subject || 'Sans objet'}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 0.8em; color: #6b7280; border: 1px solid #e5e7eb; border-top: none;">
          <p>Ce message a été envoyé depuis votre formulaire de contact.</p>
        </div>
      </div>
    `
  };
};