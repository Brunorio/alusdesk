import { boolean, integer, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ConnectionOutput } from '../../domain/value-object/connection.vo';

export const organizationsTable = pgTable('organizations', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  documentNumber: varchar('document_number', { length: 32 }).notNull().unique(),
  maxConcurrentTickets: integer('max_concurrent_tickets').notNull().default(10),
  isActive: boolean('is_active').notNull().default(true),
  connection: jsonb('connection').$type<ConnectionOutput>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('OFFLINE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export type OrganizationRow = typeof organizationsTable.$inferSelect;
export type InsertOrganizationRow = typeof organizationsTable.$inferInsert;
export type UserRow = typeof usersTable.$inferSelect;
export type InsertUserRow = typeof usersTable.$inferInsert;
