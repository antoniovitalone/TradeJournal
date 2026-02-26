import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  numeric
} from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* =======================
   USERS TABLE
======================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

/* =======================
   TRADES TABLE
======================= */

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  ticker: text("ticker").notNull(),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  exitDate: timestamp("exit_date"),

  entryPrice: numeric("entry_price").notNull(),
  exitPrice: numeric("exit_price"),

  positionSize: numeric("position_size").notNull(),
  direction: text("direction").notNull(),

  pnl: numeric("pnl"),
  notes: text("notes"),

  riskAmount: numeric("risk_amount"),
  rewardAmount: numeric("reward_amount"),

  status: text("status").notNull().default("open"),

  tickSize: numeric("tick_size").notNull().default("0.25"),
  tickValue: numeric("tick_value").notNull().default("12.50"),
  commissions: numeric("commissions").default("0"),

  screenshotUrl: text("screenshot_url"),
});

/* =======================
   INSERT SCHEMA
======================= */

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type CreateTradeRequest = InsertTrade;
export type UpdateTradeRequest = Partial<InsertTrade>;

export type TradeResponse = Trade;
export type TradesListResponse = Trade[];

/* =======================
   ANALYTICS RESPONSE
======================= */

export interface AnalyticsResponse {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  averageRiskReward: number;
  performanceCurve: { date: string; cumulativePnl: number }[];
}