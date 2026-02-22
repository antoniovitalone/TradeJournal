import { z } from 'zod';
import { insertTradeSchema, trades } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  trades: {
    list: {
      method: 'GET' as const,
      path: '/api/trades' as const,
      responses: {
        200: z.array(z.custom<typeof trades.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trades/:id' as const,
      responses: {
        200: z.custom<typeof trades.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trades' as const,
      input: insertTradeSchema,
      responses: {
        201: z.custom<typeof trades.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/trades/:id' as const,
      input: insertTradeSchema.partial(),
      responses: {
        200: z.custom<typeof trades.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/trades/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.object({
          totalTrades: z.number(),
          wins: z.number(),
          losses: z.number(),
          winRate: z.number(),
          totalPnl: z.number(),
          averageRiskReward: z.number(),
          performanceCurve: z.array(z.object({
            date: z.string(),
            cumulativePnl: z.number(),
          }))
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TradeInput = z.infer<typeof api.trades.create.input>;
export type TradeResponse = z.infer<typeof api.trades.create.responses[201]>;
export type TradeUpdateInput = z.infer<typeof api.trades.update.input>;
export type TradesListResponse = z.infer<typeof api.trades.list.responses[200]>;
export type AnalyticsResponse = z.infer<typeof api.analytics.get.responses[200]>;
