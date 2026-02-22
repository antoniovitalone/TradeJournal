import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TradeInput, type TradeUpdateInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTrades() {
  return useQuery({
    queryKey: [api.trades.list.path],
    queryFn: async () => {
      const res = await fetch(api.trades.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      const data = await res.json();
      return api.trades.list.responses[200].parse(data);
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      return api.analytics.get.responses[200].parse(data);
    },
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TradeInput) => {
      const res = await fetch(api.trades.create.path, {
        method: api.trades.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.trades.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create trade");
      }
      return api.trades.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trades.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({ title: "Trade logged successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to log trade", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TradeUpdateInput }) => {
      const url = buildUrl(api.trades.update.path, { id });
      const res = await fetch(url, {
        method: api.trades.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to update trade");
      }
      return api.trades.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trades.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({ title: "Trade updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update trade", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.trades.delete.path, { id });
      const res = await fetch(url, {
        method: api.trades.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete trade");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trades.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.get.path] });
      toast({ title: "Trade deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete trade", description: error.message, variant: "destructive" });
    }
  });
}
