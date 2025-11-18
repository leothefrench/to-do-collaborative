import bcrypt from 'bcrypt';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/userSchemas.js';
import { sendEmail } from '../utils/emailService.js';
import * as crypto from 'crypto';

export default async function (fastify, option) {
  fastify.route({
    method: 'POST',
    url: '/register',
    schema: registerSchema,
    handler: async (request, reply) => {
      try {
        const { userName, password, email } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await fastify.prisma.user.create({
          data: {
            userName,
            password: hashedPassword,
            email,
          },
        });

        const token = fastify.jwt.sign({ userId: user.id });

        // MODIFICATION IMPORTANTE : Définir le token comme cookie HttpOnly
        reply.setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // false en dev local
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

        reply.status(201).send({
          message: 'User created successfully',
          user: {
            id: user.id,
            email: user.email,
            userName: user.userName,
            plan: user.plan,
          },
        }); // On ne renvoie plus le token directement dans le body
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Error creating user',
        });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: loginSchema,
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;

        const user = await fastify.prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return reply.status(401).send({ message: 'Identifiants invalides' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return reply.status(401).send({ message: 'Identifiants invalides' });
        }

        const token = fastify.jwt.sign({ userId: user.id });

        // MODIFICATION IMPORTANTE : Définir le token comme cookie HttpOnly
        reply.setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // false en dev local
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 jours
        });

        // On renvoie juste les infos de l'utilisateur (sans le token dans le body)
        reply.status(200).send({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            userName: user.userName,
            plan: user.plan,
          },
        });
      } catch (error) {
        request.log.error(error);
        reply.status(500).send({
          message: 'Erreur lors de la connexion',
        });
      }
    },
  });

  // Ajout d'une route pour la déconnexion qui efface le cookie
  fastify.route({
    method: 'POST',
    url: '/logout',
    handler: async (request, reply) => {
      // MODIFICATION IMPORTANTE : Effacer le cookie 'token'
      reply.clearCookie('token', { path: '/' });
      reply.status(200).send({ message: 'Déconnexion réussie' });
    },
  });

  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ message: 'Non autorisé' });
      }
      return {
        id: user.id,
        userName: user.userName,
        email: user.email,
      };
    }
  );

  fastify.route({
    method: 'POST',
    url: '/change-password',
    schema: changePasswordSchema, // SCHÉMA À CRÉER POUR VALIDER oldPassword et newPassword
    preHandler: [fastify.authenticate], // SÉCURITÉ : SEUL L'UTILISATEUR CONNECTÉ PEUT ACCÉDER
    handler: async (request, reply) => {
      try {
        const { oldPassword, newPassword } = request.body; // request.user EST DISPONIBLE GRÂCE À fastify.authenticate
        const userId = request.user.userId; // 1. RÉCUPÉRER L'UTILISATEUR COMPLET (AVEC LE MOT DE PASSE HACHÉ)

        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          // CAS IMPOSSIBLE SI AUTHENTICATE A FONCTIONNÉ, MAIS BONNE PRATIQUE
          return reply.status(404).send({ message: 'Utilisateur non trouvé' });
        } // 2. VÉRIFIER L'ANCIEN MOT DE PASSE

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!passwordMatch) {
          return reply
            .status(401)
            .send({ message: "L'ancien mot de passe est incorrect." });
        } // 3. HASHER LE NOUVEAU MOT DE PASSE

        const hashedNewPassword = await bcrypt.hash(newPassword, 10); // 4. METTRE À JOUR LE MOT DE PASSE DANS PRISMA

        await fastify.prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });

        reply
          .status(200)
          .send({ message: 'Mot de passe mis à jour avec succès.' });
      } catch (error) {
        request.log.error(error);
        reply
          .status(500)
          .send({ message: 'Erreur lors du changement de mot de passe.' });
      }
    },
  });

  fastify.route({
    method: 'DELETE', // ⬅️ Le verbe DELETE
    url: '/account', // ⬅️ La route sera /auth/account
    preHandler: [fastify.authenticate], // ⬅️ SÉCURITÉ : Vérifie la connexion via le JWT/Cookie
    handler: async (request, reply) => {
      try {
        // 1. Récupération de l'ID utilisateur à partir du JWT décodé
        const userId = request.user.userId; // 2. Suppression de l'utilisateur (et de toutes les données liées si configuré en cascade dans Prisma)

        await fastify.prisma.user.delete({
          where: { id: userId },
        }); // 3. Déconnexion : Effacer le cookie côté serveur

        reply.clearCookie('token', { path: '/' }); // 4. Succès : Répondre avec 204 No Content (standard pour DELETE)

        reply.status(204).send();
      } catch (error) {
        request.log.error(error);
        reply
          .status(500)
          .send({ message: 'Erreur lors de la suppression du compte.' });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/forgot-password',
    schema: forgotPasswordSchema,
    handler: async (request, reply) => {
      try {
        const { email } = request.body;

        const user = await fastify.prisma.user.findUnique({
          where: { email },
        });

        // SECURITÉ: On renvoie un succès même si l'utilisateur n'existe pas
        if (!user) {
          request.log.warn(
            `Tentative de mot de passe oublié pour email inconnu: ${email}`
          );
          return reply.status(200).send({
            message:
              'Si cet utilisateur existe, un lien de réinitialisation lui a été envoyé.',
          });
        }

        // --- 1. GÉNÉRATION DU JETON SÉCURISÉ ---
        // Génère un jeton aléatoire long (pas un JWT)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Définit l'expiration (ex: 15 minutes)
        const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // --- 2. STOCKAGE DANS PRISMA ---
        await fastify.prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: resetToken,
            resetTokenExpiresAt: resetTokenExpiresAt,
          },
        });

        // --- 3. PRÉPARATION DU LIEN ET DU CONTENU ---
        // L'URL du frontend doit pointer vers la page de réinitialisation avec le token
        const frontendUrl =
          process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
          user.email
        )}`;

        const subject = 'Réinitialisation de votre mot de passe';
        const htmlContent = `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous. Ce lien expirera dans 15 minutes.</p>
        <a href="${resetLink}">Réinitialiser mon mot de passe</a>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
      `;

        // --- 4. ENVOI DE L'EMAIL VIA MAIJET (emailService) ---
        await sendEmail({
          to: user.email,
          subject: subject,
          text: `Réinitialisez votre mot de passe en cliquant sur ce lien : ${resetLink}`,
          html: htmlContent,
        });

        // --- Réponse finale ---
        reply.status(200).send({
          message:
            'Si cet utilisateur existe, un lien de réinitialisation lui a été envoyé.',
        });
      } catch (error) {
        request.log.error(error, 'Erreur dans forgot-password');
        reply.status(500).send({
          message: 'Erreur serveur lors de la demande de réinitialisation.',
        });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/reset-password',
    schema: resetPasswordSchema,
    handler: async (request, reply) => {
      try {
        const { token, newPassword } = request.body;

        // 1. CHERCHER L'UTILISATEUR PAR JETON ET VÉRIFIER L'EXPIRATION
        const user = await fastify.prisma.user.findUnique({
          where: { resetToken: token },
        });

        if (!user) {
          return reply.status(400).send({
            message: 'Lien de réinitialisation invalide ou déjà utilisé.',
          });
        }

        // Vérifie si le jeton a expiré (le jeton doit expirer dans le futur)
        if (user.resetTokenExpiresAt < new Date()) {
          // Optionnel mais recommandé : Nettoyer le jeton expiré
          await fastify.prisma.user.update({
            where: { id: user.id },
            data: { resetToken: null, resetTokenExpiresAt: null },
          });
          return reply.status(400).send({
            message:
              'Lien de réinitialisation expiré. Veuillez refaire une demande.',
          });
        }

        // 2. HASHER LE NOUVEAU MOT DE PASSE
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 3. METTRE À JOUR LE MOT DE PASSE ET NETTOYER LES CHAMPS DE RÉINITIALISATION
        await fastify.prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedNewPassword,
            resetToken: null, // SÉCURITÉ : Annuler le jeton immédiatement après utilisation
            resetTokenExpiresAt: null, // Nettoyer la date
          },
        });

        // 4. RÉPONSE DE SUCCÈS
        reply.status(200).send({
          message:
            'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
        });
      } catch (error) {
        request.log.error(
          error,
          'Erreur lors de la réinitialisation du mot de passe'
        );
        reply.status(500).send({
          message:
            'Erreur serveur lors de la réinitialisation du mot de passe.',
        });
      }
    },
  });
}
