module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'adminJwtSecretKeyMin32CharsDefault123'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'apiTokenSaltMin32CharsDefault123456'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transferTokenSaltMin32CharsDefault12'),
    },
  },
  flags: {
    nps: false,
    promoteEE: false,
  },
});
