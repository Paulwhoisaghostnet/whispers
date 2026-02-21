import { Buffer } from "buffer";
import process from "process";
if (typeof window !== "undefined") {
  (window as unknown as { global: typeof window }).global = window;
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  (window as unknown as { process: NodeJS.Process }).process = process;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
