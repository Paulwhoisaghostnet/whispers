import { Button } from "@/components/ui/button";
import { useTezos } from "@/hooks/use-tezos";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletButtonProps {
  compact?: boolean;
}

export function WalletButton({ compact = false }: WalletButtonProps) {
  const { address, connectWallet, disconnectWallet, loading } = useTezos();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full justify-center glass border-white/10">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {compact ? "" : "Loading..."}
      </Button>
    );
  }

  if (!address) {
    return (
      <Button 
        onClick={connectWallet}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        size="sm"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {compact ? "" : "Sync Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-between glass border-primary/20 text-primary-foreground bg-primary/10 hover:bg-primary/20 transition-all"
        >
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="font-mono text-xs">{truncateAddress(address)}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass border-border/50">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem 
          onClick={disconnectWallet}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
