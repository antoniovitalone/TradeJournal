import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  entryDate: z.string(),
  exitDate: z.string().optional().nullable(),
  entryPrice: z.coerce.string().min(1),
  exitPrice: z.coerce.string().optional().nullable(),
  positionSize: z.coerce.string().min(1),
  tickSize: z.coerce.string().default("0.25"),
  tickValue: z.coerce.string().default("12.50"),
  pnl: z.coerce.string().optional().nullable(),
  riskAmount: z.coerce.string().optional().nullable(),
  rewardAmount: z.coerce.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

  const [file, setFile] = useState<File | null>(null);

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
      tickSize: "0.25",
      tickValue: "12.50",
      pnl: "",
      riskAmount: "",
      rewardAmount: "",
      notes: "",
    },
  });

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
          tickSize: trade.tickSize?.toString() || "0.25",
          tickValue: trade.tickValue?.toString() || "12.50",
          pnl: trade.pnl?.toString() || "",
          riskAmount: trade.riskAmount?.toString() || "",
          rewardAmount: trade.rewardAmount?.toString() || "",
          notes: trade.notes || "",
        });
      } else {
        form.reset();
        setFile(null);
      }
    }
  }, [trade, open, form]);

  const onSubmit = (values: FormValues) => {
    let calculatedPnl = values.pnl;

    if (values.exitPrice && values.entryPrice) {
      const priceDiff =
        values.direction === "long"
          ? Number(values.exitPrice) - Number(values.entryPrice)
          : Number(values.entryPrice) - Number(values.exitPrice);

      const ticks = priceDiff / Number(values.tickSize);
      calculatedPnl = (
        ticks *
        Number(values.tickValue) *
        Number(values.positionSize)
      ).toFixed(2);
    }

    const data = {
      ...values,
      entryDate: new Date(values.entryDate).toISOString(),
      exitDate: values.exitDate ? new Date(values.exitDate).toISOString() : null,
      pnl: calculatedPnl || null,
      riskAmount: values.riskAmount || null,
      rewardAmount: values.rewardAmount || null,
      notes: values.notes || null,
    };

    if (isEditing && trade) {
      updateMutation.mutate(
        { id: trade.id, data: data as any },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data as any, {
        onSuccess: () => onOpenChange(false),
      });
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

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract</FormLabel>
                    <FormControl>
                      <Input {...field} className="uppercase font-numbers" />
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
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
              <FormField name="entryPrice" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )}/>
              <FormField name="exitPrice" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Price</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} value={field.value || ""} /></FormControl>
                </FormItem>
              )}/>
            </div>

            {/* Tick Logic */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
              <FormField name="positionSize" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Contracts</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )}/>
              <FormField name="tickSize" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tick Size</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )}/>
              <FormField name="tickValue" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tick Value ($)</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                </FormItem>
              )}/>
            </div>
{/* Risk / Target / Actual PnL */}
<div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4">

  <FormField
    control={form.control}
    name="riskAmount"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Risk ($)</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="any"
            placeholder="500"
            {...field}
            value={field.value || ""}
          />
        </FormControl>
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="rewardAmount"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Target Profit ($)</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="any"
            placeholder="1500"
            {...field}
            value={field.value || ""}
          />
        </FormControl>
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="pnl"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Actual P&L ($)</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="any"
            placeholder="Auto-calculated if exit entered"
            {...field}
            value={field.value || ""}
          />
        </FormControl>
      </FormItem>
    )}
  />

</div>
            {/* Screenshot Upload */}
            <div className="border-t border-border/50 pt-4">
              <FormLabel>Upload Screenshot</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Notes</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none h-24" {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Trade"}
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}