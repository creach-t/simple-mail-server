#!/bin/sh

# Configuration de Postfix pour le chiffrement TLS
postconf -e "smtpd_tls_security_level = may"
postconf -e "smtp_tls_security_level = may"
postconf -e "smtpd_tls_auth_only = no"
postconf -e "smtp_tls_note_starttls_offer = yes"
postconf -e "smtpd_tls_received_header = yes"
postconf -e "smtp_tls_loglevel = 1"
postconf -e "smtpd_tls_loglevel = 1"

# Configuration pour la conformité et la fiabilité des emails
postconf -e "smtpd_delay_reject = yes"
postconf -e "smtpd_helo_required = yes"
postconf -e "smtp_always_send_ehlo = yes"
postconf -e "disable_vrfy_command = yes"

# Configuration anti-spam
postconf -e "smtpd_recipient_restrictions = permit_mynetworks, reject_unauth_destination"

echo "Configuration de Postfix mise à jour pour améliorer la sécurité."
