import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  /* =========================
     GET ALL TRADES (USER)
  ========================= */
  app.get(api.trades.list.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const trades = await storage.getTrades(req.session.userId);
    res.json(trades);
  });

  /* =========================
     GET SINGLE TRADE
  ========================= */
  app.get(api.trades.get.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const trade = await storage.getTrade(
      Number(req.params.id),
      req.session.userId
    );

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json(trade);
  });

  /* =========================
     CREATE TRADE
  ========================= */
  app.post(api.trades.create.path, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

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

      const trade = await storage.createTrade({
        ...input,
        userId: req.session.userId,
      } as any);

      res.status(201).json(trade);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  /* =========================
     UPDATE TRADE
  ========================= */
  app.put(api.trades.update.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

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

      const trade = await storage.updateTrade(
        Number(req.params.id),
        input as any,
        req.session.userId
      );

      res.json(trade);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  /* =========================
     DELETE TRADE
  ========================= */
  app.delete(api.trades.delete.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    await storage.deleteTrade(
      Number(req.params.id),
      req.session.userId
    );

    res.status(204).end();
  });

  /* =========================
     ANALYTICS
  ========================= */
  app.get(api.analytics.get.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const analytics = await storage.getAnalytics(req.session.userId);
    res.json(analytics);
  });

  return httpServer;
}