import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChatInterface } from "@/components/ChatInterface";
import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [location] = useLocation();
  const [pageUrl, setPageUrl] = useState<string>("");

  useEffect(() => {
    // Determine the page URL context
    // 1. Try to get it from query params (when embedded)
    const searchParams = new URLSearchParams(window.location.search);
    const urlParam = searchParams.get("pageUrl");
    
    if (urlParam) {
      setPageUrl(urlParam);
    } else {
      // 2. Default fallback for standalone dev mode
      // In production extension, this param will always be injected
      setPageUrl("https://objkt.com/general-chat");
    }
  }, [location]);

  if (!pageUrl) return null;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-transparent">
      {/* 
        The main container for the chat app.
        In the extension context, this will be inside an iframe or sidebar.
        We maximize height but constrain width for a sidebar feel.
      */}
      <div className="w-full h-full max-w-md mx-auto shadow-2xl overflow-hidden relative bg-background">
        
        {/* If no pageUrl is detected (shouldn't happen with above logic, but safe guard) */}
        {!pageUrl ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display mb-2">Objkt Chat</h1>
              <p className="text-muted-foreground">
                No active page detected. Please open this extension on an objkt.com page.
              </p>
            </div>
          </div>
        ) : (
          <ChatInterface pageUrl={pageUrl} />
        )}
      </div>

      {/* 
        This is a dev-only floating indicator to show it's working 
        In production, the iframe would cover the screen or be a sidebar
      */}
      <div className="fixed bottom-4 right-4 hidden lg:block">
        <div className="bg-card border border-border p-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium">Dev Mode Active</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              Context: {pageUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
