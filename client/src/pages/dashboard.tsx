import { useAnalytics } from "@/hooks/use-trades";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";
import { Activity, Target, TrendingUp, TrendingDown, Layers, Crosshair } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  glowType = "default" 
}: { 
  title: string, 
  value: string, 
  icon: React.ElementType, 
  trend?: "up" | "down" | "neutral",
  glowType?: "success" | "danger" | "primary" | "default" 
}) {
  
  const valueClass = 
    glowType === "success" ? "text-success text-glow-success" :
    glowType === "danger" ? "text-destructive text-glow-danger" :
    glowType === "primary" ? "text-primary text-glow-primary" :
    "text-foreground";

  return (
    <div className="hover-lift glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-3 text-muted-foreground mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className={`text-4xl font-bold font-numbers tracking-tight mt-auto ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-card/50" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl bg-card/50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">Failed to load analytics</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const isProfitable = data.totalPnl >= 0;

  // Enhance chart data with formatted strings for tooltip
  const chartData = data.performanceCurve.map(point => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow-primary">Terminal Overview</h1>
          <p className="text-muted-foreground mt-1">High-level metrics of your trading performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Net P&L" 
          value={formatCurrency(data.totalPnl)} 
          icon={isProfitable ? TrendingUp : TrendingDown}
          glowType={isProfitable ? "success" : "danger"}
        />
        <StatCard 
          title="Win Rate" 
          value={formatPercent(data.winRate)} 
          icon={Target}
          glowType="primary"
        />
        <StatCard 
          title="Avg Risk/Reward" 
          value={formatRatio(data.averageRiskReward)} 
          icon={Crosshair}
        />
        <StatCard 
          title="Total Trades" 
          value={data.totalTrades.toString()} 
          icon={Layers}
        />
        <StatCard 
          title="Total Wins" 
          value={data.wins.toString()} 
          icon={TrendingUp}
          glowType="success"
        />
        <StatCard 
          title="Total Losses" 
          value={data.losses.toString()} 
          icon={TrendingDown}
          glowType="danger"
        />
      </div>

      <div className="glass-panel p-6 rounded-2xl mt-8 border border-border/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-glow-primary">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xl tracking-tight">Cumulative P&L Curve</h3>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfitable ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isProfitable ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  tickFormatter={(value) => `$${value}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'var(--font-mono)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="cumulativePnl" 
                  stroke={isProfitable ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPnl)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center flex-col text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
            <Activity className="w-12 h-12 mb-4 opacity-50" />
            <p>Log your first trade to generate a performance curve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
