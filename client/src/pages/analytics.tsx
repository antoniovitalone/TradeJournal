import { useAnalytics } from "@/hooks/use-trades";
import { Activity } from "lucide-react";

export default function Analytics() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-xl font-bold text-muted-foreground">Compiling metrics...</h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-destructive">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-full overflow-y-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your performance metrics.</p>
      </div>

      <div className="glass-panel p-12 rounded-2xl border border-border/50 flex flex-col items-center justify-center text-center space-y-6">
        <Activity className="w-24 h-24 text-primary/20" />
        <h2 className="text-2xl font-bold">More metrics coming soon</h2>
        <p className="text-muted-foreground max-w-md">
          We're building out heatmaps, drawdown analysis, and day-of-week performance charts. Check the Dashboard for high-level stats.
        </p>
      </div>
    </div>
  );
}
