import pg from 'pg';

export const pool = new pg.Pool({
  host: process.env.DB_HOST || '/var/run/postgresql',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'betpro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
});

export const query = (text, params) => pool.query(text, params);
