import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  exitDate: timestamp("exit_date"),
  entryPrice: numeric("entry_price").notNull(),
  exitPrice: numeric("exit_price"),
  positionSize: numeric("position_size").notNull(),
  direction: text("direction").notNull(), // 'long' or 'short'
  pnl: numeric("pnl"),
  notes: text("notes"),
  riskAmount: numeric("risk_amount"),
  rewardAmount: numeric("reward_amount"),
  status: text("status").notNull().default('open'), // 'open' or 'closed'
});

export const insertTradeSchema = createInsertSchema(trades).omit({ 
  id: true 
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type CreateTradeRequest = InsertTrade;
export type UpdateTradeRequest = Partial<InsertTrade>;

export type TradeResponse = Trade;
export type TradesListResponse = Trade[];

export interface AnalyticsResponse {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  averageRiskReward: number;
  performanceCurve: { date: string; cumulativePnl: number }[];
}
