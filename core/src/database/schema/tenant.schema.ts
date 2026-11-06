import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('OFFLINE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const clientCompaniesTable = pgTable('client_companies', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  corporateName: varchar('corporate_name', { length: 255 }).notNull(),
  tradeName: varchar('trade_name', { length: 255 }).notNull(),
  documentNumber: varchar('document_number', { length: 32 }).notNull(),
  maxConcurrentSessions: integer('max_concurrent_sessions').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  licenseExpiresAt: timestamp('license_expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const requestersTable = pgTable('requesters', {
  id: uuid('id').primaryKey(),
  clientCompanyId: uuid('client_company_id')
    .notNull()
    .references(() => clientCompaniesTable.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  machineHostname: varchar('machine_hostname', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const queuesTable = pgTable('queues', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  priority: integer('priority').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const ticketsTable = pgTable('tickets', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  protocolNumber: varchar('protocol_number', { length: 64 }).notNull().unique(),
  clientCompanyId: uuid('client_company_id')
    .notNull()
    .references(() => clientCompaniesTable.id),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => requestersTable.id),
  queueId: uuid('queue_id')
    .notNull()
    .references(() => queuesTable.id),
  agentId: uuid('agent_id').references(() => usersTable.id),
  status: varchar('status', { length: 32 }).notNull().default('WAITING_QUEUE'),
  activeChannel: varchar('active_channel', { length: 32 }).notNull().default('CHAT_ONLY'),
  enteredQueueAt: timestamp('entered_queue_at', { withTimezone: true }).notNull().defaultNow(),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  queueWaitTimeSec: integer('queue_wait_time_sec'),
  totalDurationSec: integer('total_duration_sec'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
});

export const messagesTable = pgTable('messages', {
  id: uuid('id').primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => ticketsTable.id),
  senderId: uuid('sender_id').notNull(),
  senderType: varchar('sender_type', { length: 32 }).notNull(),
  type: varchar('type', { length: 32 }).notNull().default('TEXT'),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ratingsTable = pgTable('ratings', {
  id: uuid('id').primaryKey(),
  ticketId: uuid('ticket_id')
    .notNull()
    .unique()
    .references(() => ticketsTable.id),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => requestersTable.id),
  agentId: uuid('agent_id').references(() => usersTable.id),
  score: integer('score').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
export type ClientCompanyRow = typeof clientCompaniesTable.$inferSelect;
export type RequesterRow = typeof requestersTable.$inferSelect;
export type QueueRow = typeof queuesTable.$inferSelect;
export type TicketRow = typeof ticketsTable.$inferSelect;
export type MessageRow = typeof messagesTable.$inferSelect;
export type RatingRow = typeof ratingsTable.$inferSelect;

