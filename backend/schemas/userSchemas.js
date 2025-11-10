export const registerSchema = {
  body: {
    type: 'object',
    required: ['userName', 'password', 'email'],
    properties: {
      userName: { type: 'string', minLength: 3 },
      password: { type: 'string', minLength: 8 },
      email: { type: 'string', format: 'email' },
    },
  },
};

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};

export const changePasswordSchema = {
  body: {
    type: 'object',
    required: ['oldPassword', 'newPassword'],
    properties: {
      oldPassword: { type: 'string' },
      newPassword: { type: 'string', minLength: 8 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

export const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false, // Bonne pratique pour rejeter les champs non désirés
  },
  response: {
    // Statut 200 pour le succès (même si l'utilisateur n'existe pas, par sécurité)
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    // Le 404 est techniquement correct, mais 200 est plus sûr pour éviter l'énumération
    404: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

export const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'newPassword'],
    properties: {
      token: {
        type: 'string',
        description: 'Le jeton de réinitialisation de mot de passe unique.',
      },
      newPassword: {
        type: 'string',
        minLength: 8, // Exige au moins 8 caractères pour le nouveau mot de passe
        description: "Le nouveau mot de passe de l'utilisateur.",
      },
    },
  },
};