const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  if (client === 'postgres') {
    return {
      connection: {
        client: 'postgres',
        connection: env('DATABASE_URL')
          ? {
              connectionString: env('DATABASE_URL'),
              ssl: env.bool('DATABASE_SSL', false),
            }
          : {
              host: env('DATABASE_HOST', '127.0.0.1'),
              port: env.int('DATABASE_PORT', 5432),
              database: env('DATABASE_NAME', 'ecommerce_cms'),
              user: env('DATABASE_USERNAME', 'postgres'),
              password: env('DATABASE_PASSWORD', 'postgres'),
              ssl: env.bool('DATABASE_SSL', false),
            },
        pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
      },
    };
  }

  // Default SQLite for zero-configuration, immediate local execution
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };
};
