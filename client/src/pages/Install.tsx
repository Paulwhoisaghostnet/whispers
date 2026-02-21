import { Link } from "wouter";
import { Download, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHROME_STORE_URL = "https://chrome.google.com/webstore/detail/whispers/REPLACE_WITH_YOUR_EXTENSION_ID";
const GITHUB_INSTALL_URL = "https://github.com/Paulwhoisaghostnet/whispers#installation";

export default function Install() {
  const installHref = CHROME_STORE_URL.includes("REPLACE")
    ? GITHUB_INSTALL_URL
    : CHROME_STORE_URL;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="p-6 bg-primary/10 rounded-2xl inline-flex">
          <MessageSquare className="w-16 h-16 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">
            Whispers
          </h1>
          <p className="text-muted-foreground">
            Chat on objkt.com token and collection pages. Install the Chrome
            extension to get started.
          </p>
        </div>

        <a href={installHref} target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            className="w-full gap-2 text-lg h-14 shadow-lg shadow-primary/25"
          >
            <Download className="w-5 h-5" />
            Install Whispers
          </Button>
        </a>

        <p className="text-sm text-muted-foreground">
          You’ll be taken to the Chrome Web Store or the GitHub install
          instructions. After installing, go to{" "}
          <a
            href="https://objkt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            objkt.com
          </a>{" "}
          and open the extension from the toolbar.
        </p>

        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Back to chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
