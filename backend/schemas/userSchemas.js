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
    required: ['userName', 'password'],
    properties: {
      userName: { type: 'string' },
      password: { type: 'string' },
    },
  },
};
