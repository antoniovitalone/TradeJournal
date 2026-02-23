import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTrade, useUpdateTrade } from "@/hooks/use-trades";
import { type Trade } from "@shared/schema";
import { format } from "date-fns";

const formSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").toUpperCase(),
  direction: z.enum(["long", "short"]),
  status: z.enum(["open", "closed"]),
  entryDate: z.string().min(1, "Entry date is required"),
  exitDate: z.string().optional().nullable(),
  entryPrice: z.coerce.string().min(1, "Entry price is required"),
  exitPrice: z.coerce.string().optional().nullable(),
  positionSize: z.coerce.string().min(1, "Contracts is required"),
  pnl: z.coerce.string().optional().nullable(),
  riskAmount: z.coerce.string().optional().nullable(),
  rewardAmount: z.coerce.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tickSize: z.coerce.string().default("0.25"),
  tickValue: z.coerce.string().default("12.50"),
  commissions: z.coerce.string().default("0"),
  screenshotUrl: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface TradeDialogProps {
  trade?: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDialog({ trade, open, onOpenChange }: TradeDialogProps) {
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();
  
  const isEditing = !!trade;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
      direction: "long",
      status: "open",
      entryDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      exitDate: "",
      entryPrice: "",
      exitPrice: "",
      positionSize: "",
      pnl: "",
      riskAmount: "",
      rewardAmount: "",
      notes: "",
      tickSize: "0.25",
      tickValue: "12.50",
      commissions: "0",
    },
  });

  // Reset form when trade changes
  useEffect(() => {
    if (open) {
      if (trade) {
        form.reset({
          ticker: trade.ticker,
          direction: trade.direction as "long" | "short",
          status: trade.status as "open" | "closed",
          entryDate: trade.entryDate ? format(new Date(trade.entryDate), "yyyy-MM-dd'T'HH:mm") : "",
          exitDate: trade.exitDate ? format(new Date(trade.exitDate), "yyyy-MM-dd'T'HH:mm") : "",
          entryPrice: trade.entryPrice?.toString() || "",
          exitPrice: trade.exitPrice?.toString() || "",
          positionSize: trade.positionSize?.toString() || "",
          pnl: trade.pnl?.toString() || "",
          riskAmount: trade.riskAmount?.toString() || "",
          rewardAmount: trade.rewardAmount?.toString() || "",
          notes: trade.notes || "",
          tickSize: trade.tickSize?.toString() || "0.25",
          tickValue: trade.tickValue?.toString() || "12.50",
          commissions: trade.commissions?.toString() || "0",
          screenshotUrl: trade.screenshotUrl || "",
        });
      } else {
        form.reset({
          ticker: "",
          direction: "long",
          status: "open",
          entryDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          exitDate: "",
          entryPrice: "",
          exitPrice: "",
          positionSize: "",
          pnl: "",
          riskAmount: "",
          rewardAmount: "",
          notes: "",
          tickSize: "0.25",
          tickValue: "12.50",
          commissions: "0",
          screenshotUrl: "",
        });
      }
    }
  }, [trade, open, form]);

  const onSubmit = (values: FormValues) => {
    // Clean up empty strings to null for optional fields
    const data = {
      ...values,
      exitDate: values.exitDate ? new Date(values.exitDate).toISOString() : null,
      entryDate: new Date(values.entryDate).toISOString(),
      exitPrice: values.exitPrice || null,
      pnl: values.pnl || null,
      riskAmount: values.riskAmount || null,
      rewardAmount: values.rewardAmount || null,
      notes: values.notes || null,
      tickSize: values.tickSize || "0.25",
      tickValue: values.tickValue || "12.50",
      commissions: values.commissions || "0",
    };

    if (isEditing && trade) {
      updateMutation.mutate(
        { id: trade.id, data: data as any },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data as any, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 glass-panel max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? `Edit Trade - ${trade?.ticker}` : "Log New Trade"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker</FormLabel>
                    <FormControl>
                      <Input placeholder="AAPL" className="uppercase font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/50 pt-4">
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="font-numbers" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="150.00" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="155.00" className="font-numbers" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/50 pt-4">
              <FormField
                control={form.control}
                name="positionSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contracts</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="1" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tickSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tick Size</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="0.25" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tickValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tick Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="12.50" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/50 pt-4">
              <FormField
                control={form.control}
                name="riskAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="500" className="font-numbers" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewardAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Reward ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="1500" className="font-numbers" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commissions ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="4.00" className="font-numbers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-border/50 pt-4">
              <FormField
                control={form.control}
                name="pnl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual P&L ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 1250 or -500" className="font-numbers" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="screenshotUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Screenshot URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Paste image URL (e.g. from TradingView or Lightshot)" 
                      className="bg-background/50 border-border/50"
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border/50">
                      <img src={field.value} alt="Trade Screenshot Preview" className="w-full h-auto max-h-48 object-cover" />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What was the setup? How did you manage it?" 
                      className="resize-none h-24" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold">
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Trade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
