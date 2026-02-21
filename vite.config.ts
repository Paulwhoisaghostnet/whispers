import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const isExtensionBuild = process.env.BUILD_EXTENSION === "1";

export default defineConfig({
  base: isExtensionBuild ? "./" : "/",
  plugins: [
    nodePolyfills(),
    react(),
    ...(isExtensionBuild ? [] : [runtimeErrorOverlay()]),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined &&
    !isExtensionBuild
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: isExtensionBuild
      ? path.resolve(import.meta.dirname, "extension", "dist")
      : path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
    rollupOptions: isExtensionBuild
      ? { input: path.resolve(import.meta.dirname, "client", "index.html") }
      : undefined,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
