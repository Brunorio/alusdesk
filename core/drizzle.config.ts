import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema/*.schema.ts',
  out: './migrations',
  strict: true,
  verbose: true,
});

