import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.messages.list.path, async (req, res) => {
    try {
      const pageUrl = (req.query.pageUrl as string) || "general";
      const msgs = await storage.getMessages(pageUrl);
      // reverse so newest are at the bottom of the chat UI
      res.json(msgs.reverse());
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const { fetchCreatorAddress } = await import("@shared/creator");
  app.get(api.creator.get.path, async (req, res) => {
    try {
      const pageUrl = (req.query.pageUrl as string) ?? "";
      const creatorAddress = await fetchCreatorAddress(pageUrl);
      res.json({ creatorAddress });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.messages.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const message = await storage.getMessageById(id);
      if (!message) return res.status(404).json({ message: "Message not found" });

      const wallet =
        (req.headers["x-wallet-address"] as string) ?? req.query.wallet ?? "";
      if (!wallet) return res.status(403).json({ message: "Wallet address required" });

      const creatorAddress = await fetchCreatorAddress(message.pageUrl);
      if (
        creatorAddress === null ||
        creatorAddress.toLowerCase() !== String(wallet).toLowerCase()
      ) {
        return res.status(403).json({
          message: "Only the token/collection creator can delete messages",
        });
      }

      await storage.deleteMessage(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}