import { createServerOnlyFn } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const createDatabase = createServerOnlyFn(() => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return drizzle(pool, { schema });
});
export const db = createDatabase();