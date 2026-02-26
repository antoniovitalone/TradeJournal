import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Trade } from "@shared/schema";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/format";

interface TradeReviewDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeReviewDialog({
  trade,
  open,
  onOpenChange,
}: TradeReviewDialogProps) {
  if (!trade) return null;

  const pnl = trade.pnl ? Number(trade.pnl) : 0;
  const isWin = pnl > 0;
  const isLoss = pnl < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card border-border/50 glass-panel max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-wide">
            {trade.ticker} — Trade Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-6">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-6 border-b border-border/50 pb-6">
            <div>
              <p className="text-muted-foreground text-sm">Direction</p>
              <p className="text-lg font-semibold capitalize">
                {trade.direction}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Contracts</p>
              <p className="text-lg font-semibold">
                {trade.positionSize}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">P&L</p>
              <p
                className={`text-lg font-bold ${
                  isWin
                    ? "text-success"
                    : isLoss
                    ? "text-destructive"
                    : ""
                }`}
              >
                {formatCurrency(pnl)}
              </p>
            </div>
          </div>

          {/* Prices + Dates */}
          <div className="grid grid-cols-2 gap-6 border-b border-border/50 pb-6">
            <div>
              <p className="text-muted-foreground text-sm">Entry Price</p>
              <p className="font-semibold">{trade.entryPrice}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Exit Price</p>
              <p className="font-semibold">
                {trade.exitPrice || "-"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Entry Date</p>
              <p>
                {trade.entryDate
                  ? format(new Date(trade.entryDate), "PPpp")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Exit Date</p>
              <p>
                {trade.exitDate
                  ? format(new Date(trade.exitDate), "PPpp")
                  : "-"}
              </p>
            </div>
          </div>

          {/* Screenshot */}
          {trade.screenshotUrl && (
            <div className="border-b border-border/50 pb-6">
              <p className="text-muted-foreground text-sm mb-3">
                Chart Screenshot
              </p>
              <div className="rounded-xl overflow-hidden border border-border/50">
                <img
                  src={trade.screenshotUrl}
                  alt="Trade Screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div>
              <p className="text-muted-foreground text-sm mb-3">
                Trade Notes
              </p>
              <div className="bg-background/40 p-4 rounded-xl border border-border/50 whitespace-pre-wrap">
                {trade.notes}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}