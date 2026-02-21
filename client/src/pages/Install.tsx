import { Link } from "wouter";
import { Download, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXTENSION_ZIP_URL = "/whispers-extension.zip";

export default function Install() {
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
            Chat on objkt.com token and collection pages. Download the
            extension, then install it from the folder.
          </p>
        </div>

        <a href={EXTENSION_ZIP_URL} download="whispers-extension.zip">
          <Button
            size="lg"
            className="w-full gap-2 text-lg h-14 shadow-lg shadow-primary/25"
          >
            <Download className="w-5 h-5" />
            Download Whispers extension
          </Button>
        </a>

        <div className="text-left bg-muted/50 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Install steps</p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            <li>Download the zip (button above).</li>
            <li>Unzip it to a folder on your computer.</li>
            <li>Open <strong>install.html</strong> in that folder (double‑click or open in Chrome).</li>
            <li>Use the button on that page to open Chrome Extensions, then Load unpacked and select the same folder.</li>
          </ol>
        </div>

        <p className="text-sm text-muted-foreground">
          After installing, go to{" "}
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
