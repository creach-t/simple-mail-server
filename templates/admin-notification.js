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
      <h3>Nouveau message de contact</h3>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };
};