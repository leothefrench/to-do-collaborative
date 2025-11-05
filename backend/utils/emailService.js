import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true si port 465 (SSL), false si port 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envoie un e-mail en utilisant le transporteur Nodemailer.
 * @param {string} to - Destinataire de l'e-mail.
 * @param {string} subject - Sujet de l'e-mail.
 * @param {string} text - Contenu en texte brut.
 * @param {string} html - Contenu en HTML.
 */
export async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Utilise l'adresse de l'envoyeur définie
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message envoyé: %s', info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);

    throw new Error(`Échec de l'envoi de l'e-mail: ${error.message}`);
  }
}
