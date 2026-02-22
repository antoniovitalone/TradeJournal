import { db } from "./db";
import {
  trades,
  type Trade,
  type InsertTrade,
  type UpdateTradeRequest,
  type AnalyticsResponse
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTrades(): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: UpdateTradeRequest): Promise<Trade>;
  deleteTrade(id: number): Promise<void>;
  getAnalytics(): Promise<AnalyticsResponse>;
}

export class DatabaseStorage implements IStorage {
  async getTrades(): Promise<Trade[]> {
    return await db.select().from(trades).orderBy(desc(trades.entryDate));
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }

  async updateTrade(id: number, updates: UpdateTradeRequest): Promise<Trade> {
    const [updated] = await db.update(trades)
      .set(updates)
      .where(eq(trades.id, id))
      .returning();
    return updated;
  }

  async deleteTrade(id: number): Promise<void> {
    await db.delete(trades).where(eq(trades.id, id));
  }

  async getAnalytics(): Promise<AnalyticsResponse> {
    const allTrades = await this.getTrades();
    const closedTrades = allTrades.filter(t => t.status === 'closed');
    
    const totalTrades = closedTrades.length;
    let wins = 0;
    let losses = 0;
    let totalPnl = 0;
    let riskRewardSum = 0;
    let riskRewardCount = 0;
    
    // Sort ascending for performance curve
    const sortedClosedTrades = [...closedTrades].sort((a, b) => 
      new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime()
    );

    const performanceCurve: { date: string; cumulativePnl: number }[] = [];
    let currentCumulative = 0;

    for (const t of sortedClosedTrades) {
      const pnl = Number(t.pnl || 0);
      const commissions = Number(t.commissions || 0);
      const netPnl = pnl - commissions;

      if (netPnl > 0) wins++;
      else if (netPnl < 0) losses++;
      
      totalPnl += netPnl;
      
      currentCumulative += netPnl;
      performanceCurve.push({
        date: (t.exitDate || t.entryDate).toISOString(),
        cumulativePnl: currentCumulative
      });

      const risk = Number(t.riskAmount || 0);
      const reward = Number(t.rewardAmount || Math.abs(netPnl));
      if (risk > 0 && netPnl > 0) {
        riskRewardSum += reward / risk;
        riskRewardCount++;
      }
    }

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const averageRiskReward = riskRewardCount > 0 ? riskRewardSum / riskRewardCount : 0;

    return {
      totalTrades,
      wins,
      losses,
      winRate,
      totalPnl,
      averageRiskReward,
      performanceCurve
    };
  }
}

export const storage = new DatabaseStorage();
