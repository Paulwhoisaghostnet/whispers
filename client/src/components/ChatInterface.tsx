import { useState, useRef, useEffect } from "react";
import { useMessages, useCreateMessage, useDeleteMessage } from "@/hooks/use-messages";
import { useCreator } from "@/hooks/use-creator";
import { useTezos } from "@/hooks/use-tezos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Hash, ExternalLink, MessageSquareOff, Trash2, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { WalletButton } from "./WalletButton";

interface ChatInterfaceProps {
  pageUrl: string;
}

export function ChatInterface({ pageUrl }: ChatInterfaceProps) {
  const { address } = useTezos();
  const { data: messages, isLoading } = useMessages(pageUrl);
  const { data: creatorData } = useCreator(pageUrl);
  const { mutate: sendMessage, isPending } = useCreateMessage();
  const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage(pageUrl);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    !!address &&
    !!creatorData?.creatorAddress &&
    address.toLowerCase() === creatorData.creatorAddress.toLowerCase();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !address) return;

    sendMessage(
      {
        content: inputValue.trim(),
        pageUrl: pageUrl,
        walletAddress: address,
      },
      {
        onSuccess: () => {
          setInputValue("");
        },
      }
    );
  };

  const getAvatarSeed = (addr: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  return (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-l border-white/5 shadow-2xl overflow-hidden relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-sm tracking-tight text-white">Objkt Chat</h2>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary border border-primary/30">
                    <Shield className="w-3 h-3" /> Creator
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={pageUrl}>
                {new URL(pageUrl).pathname === "/" ? "Home" : new URL(pageUrl).pathname}
              </p>
            </div>
          </div>
          {/* External link back to page if viewing in isolation */}
          <a 
            href={pageUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <WalletButton />
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 relative" ref={scrollRef}>
        <div className="space-y-4 pb-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Loading history...</p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center p-4">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <MessageSquareOff className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs opacity-70 mt-1">Be the first to say hello!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.walletAddress === address;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="w-8 h-8 border border-white/10 shadow-sm">
                      <AvatarImage src={getAvatarSeed(msg.walletAddress)} />
                      <AvatarFallback className="text-[10px] bg-secondary">
                        {msg.walletAddress.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-medium text-muted-foreground">
                          {isMe ? "You" : `${msg.walletAddress.slice(0, 5)}...${msg.walletAddress.slice(-4)}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              address && deleteMessage({ id: msg.id, walletAddress: address })
                            }
                            disabled={isDeleting}
                            title="Delete message (creator only)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div
                        className={`
                          py-2 px-3 rounded-2xl text-sm shadow-md leading-relaxed
                          ${isMe 
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-sm" 
                            : "bg-secondary/80 text-secondary-foreground rounded-tl-sm border border-white/5"}
                        `}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-end gap-2 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={address ? "Type a message..." : "Connect wallet to chat"}
            disabled={!address || isPending}
            className="pr-12 bg-secondary/50 border-white/10 focus-visible:ring-primary/50 min-h-[44px] py-3 rounded-xl transition-all"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!address || !inputValue.trim() || isPending}
            className={`
              absolute right-1 top-1 h-[36px] w-[36px] rounded-lg
              ${inputValue.trim() ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-transparent text-muted-foreground hover:bg-white/5"}
              transition-all duration-200
            `}
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        {!address && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-t-lg z-10">
            <p className="text-xs font-medium text-white/80 px-4 py-1 bg-black/60 rounded-full border border-white/10 shadow-lg">
              Connect wallet to participate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
