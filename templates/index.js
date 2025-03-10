/**
 * Module pour charger et exporter tous les templates d'emails
 */

const adminNotification = require('./admin-notification');
const userConfirmation = require('./user-confirmation');

module.exports = {
  adminNotification,
  userConfirmation
};