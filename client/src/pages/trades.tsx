import { useState } from "react";
import { useTrades, useDeleteTrade } from "@/hooks/use-trades";
import { TradeDialog } from "@/components/trade-dialog";
import { type Trade } from "@shared/schema";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/format";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreHorizontal, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Trades() {
  const { data: trades, isLoading } = useTrades();
  const deleteMutation = useDeleteTrade();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<number | null>(null);
  
  const [search, setSearch] = useState("");

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTrade(null);
    setIsDialogOpen(true);
  };

  const confirmDelete = (id: number) => {
    setTradeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (tradeToDelete) {
      deleteMutation.mutate(tradeToDelete);
      setDeleteConfirmOpen(false);
    }
  };

  const filteredTrades = trades?.filter(trade => 
    trade.ticker.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Trade Ledger</h1>
          <p className="text-muted-foreground mt-1">Detailed history of all your market executions.</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all px-6 py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Trade
        </Button>
      </div>

      <div className="glass-panel rounded-2xl border border-border/50 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-border/50 flex gap-4 bg-card/80">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ticker..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 rounded-xl"
            />
          </div>
        </div>
        
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-background/80 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px]">Ticker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Exit Price</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full bg-card/80" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    No trades found. Log a trade to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrades.map((trade) => {
                  const pnl = trade.pnl ? parseFloat(trade.pnl as string) : null;
                  const isWin = pnl !== null && pnl > 0;
                  const isLoss = pnl !== null && pnl < 0;
                  
                  return (
                    <TableRow key={trade.id} className="border-border/50 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-bold font-numbers tracking-widest text-primary">
                        {trade.ticker}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${trade.direction === 'long' ? 'border-success/30 text-success bg-success/10' : 'border-destructive/30 text-destructive bg-destructive/10'}
                        `}>
                          {trade.direction === 'long' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          <span className="uppercase tracking-wider text-[10px]">{trade.direction}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.status === 'open' ? 'secondary' : 'outline'} className="uppercase text-[10px] tracking-wider">
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-numbers text-muted-foreground">
                        {formatShortDate(trade.entryDate)}
                      </TableCell>
                      <TableCell className="text-right font-numbers">
                        {formatCurrency(trade.entryPrice)}
                      </TableCell>
                      <TableCell className="text-right font-numbers text-muted-foreground">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : '—'}
                      </TableCell>
                      <TableCell className={`text-right font-numbers font-bold ${isWin ? 'text-success text-glow-success' : isLoss ? 'text-destructive text-glow-danger' : 'text-muted-foreground'}`}>
                        {pnl !== null ? formatCurrency(pnl) : '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(trade)} className="cursor-pointer">
                              Edit Trade
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem 
                              onClick={() => confirmDelete(trade.id)} 
                              className="text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                              Delete Trade
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TradeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        trade={selectedTrade} 
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="glass-panel border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade record for this ticker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
