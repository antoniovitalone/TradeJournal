import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.trades.list.path, async (req, res) => {
    const trades = await storage.getTrades();
    res.json(trades);
  });

  app.get(api.trades.get.path, async (req, res) => {
    const trade = await storage.getTrade(Number(req.params.id));
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  });

  app.post(api.trades.create.path, async (req, res) => {
    try {
      const bodySchema = api.trades.create.input.extend({
        entryPrice: z.coerce.string(),
        exitPrice: z.coerce.string().optional().nullable(),
        positionSize: z.coerce.string(),
        pnl: z.coerce.string().optional().nullable(),
        riskAmount: z.coerce.string().optional().nullable(),
        rewardAmount: z.coerce.string().optional().nullable(),
        entryDate: z.coerce.date().optional(),
        exitDate: z.coerce.date().optional().nullable(),
        tickSize: z.coerce.string().optional(),
        tickValue: z.coerce.string().optional(),
        commissions: z.coerce.string().optional(),
      });
      const input = bodySchema.parse(req.body);
      const trade = await storage.createTrade(input as any);
      res.status(201).json(trade);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.trades.update.path, async (req, res) => {
    try {
      const bodySchema = api.trades.update.input.extend({
        entryPrice: z.coerce.string().optional(),
        exitPrice: z.coerce.string().optional().nullable(),
        positionSize: z.coerce.string().optional(),
        pnl: z.coerce.string().optional().nullable(),
        riskAmount: z.coerce.string().optional().nullable(),
        rewardAmount: z.coerce.string().optional().nullable(),
        entryDate: z.coerce.date().optional(),
        exitDate: z.coerce.date().optional().nullable(),
        tickSize: z.coerce.string().optional(),
        tickValue: z.coerce.string().optional(),
        commissions: z.coerce.string().optional(),
      });
      const input = bodySchema.parse(req.body);
      const trade = await storage.updateTrade(Number(req.params.id), input as any);
      res.json(trade);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.trades.delete.path, async (req, res) => {
    await storage.deleteTrade(Number(req.params.id));
    res.status(204).end();
  });

  app.get(api.analytics.get.path, async (req, res) => {
    const analytics = await storage.getAnalytics();
    res.json(analytics);
  });

  // Seed data
  async function seedDatabase() {
    const existing = await storage.getTrades();
    if (existing.length === 0) {
      const now = new Date();
      await storage.createTrade({
        ticker: "AAPL",
        entryDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        exitDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        entryPrice: "150.00",
        exitPrice: "155.00",
        positionSize: "100",
        direction: "long",
        pnl: "500.00",
        notes: "Earnings beat expectations.",
        riskAmount: "200.00",
        rewardAmount: "500.00",
        status: "closed"
      });
      await storage.createTrade({
        ticker: "TSLA",
        entryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        exitDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        entryPrice: "200.00",
        exitPrice: "190.00",
        positionSize: "50",
        direction: "long",
        pnl: "-500.00",
        notes: "Stopped out.",
        riskAmount: "500.00",
        rewardAmount: "1000.00",
        status: "closed"
      });
      await storage.createTrade({
        ticker: "MSFT",
        entryDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        entryPrice: "310.00",
        positionSize: "20",
        direction: "short",
        notes: "Testing resistance.",
        riskAmount: "300.00",
        status: "open"
      });
    }
  }

  seedDatabase().catch(console.error);

  return httpServer;
}
