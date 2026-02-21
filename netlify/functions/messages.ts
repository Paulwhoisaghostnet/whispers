import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { api } from "../../shared/routes";
import { fetchCreatorAddress } from "../../shared/creator";
import * as storage from "./storage";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Wallet-Address",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

function json(status: number, body: unknown): HandlerResponse {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
    body: JSON.stringify(body),
  };
}

function noContent(): HandlerResponse {
  return { statusCode: 204, headers: corsHeaders, body: "" };
}

// Path: /.netlify/functions/messages or /.netlify/functions/messages/123
function parseMessageId(path: string): number | null {
  const match = path.match(/\/\.netlify\/functions\/messages\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const path = event.path;
  const method = event.httpMethod;
  const id = parseMessageId(path);

  try {
    if (method === "GET" && id === null) {
      const pageUrl = event.queryStringParameters?.pageUrl ?? "general";
      const msgs = await storage.getMessages(pageUrl);
      return json(200, msgs.reverse());
    }

    if (method === "POST" && id === null) {
      const body = event.body ? JSON.parse(event.body) : {};
      const input = api.messages.create.input.parse(body);
      const message = await storage.createMessage(input);
      return json(201, message);
    }

    if (method === "DELETE" && id !== null) {
      const message = await storage.getMessageById(id);
      if (!message) return json(404, { message: "Message not found" });

      const wallet =
        event.headers["x-wallet-address"] ??
        event.queryStringParameters?.wallet ??
        "";
      const walletStr = typeof wallet === "string" ? wallet : Array.isArray(wallet) ? wallet[0] : "";
      if (!walletStr) return json(403, { message: "Wallet address required" });

      const creatorAddress = await fetchCreatorAddress(message.pageUrl);
      if (
        creatorAddress === null ||
        creatorAddress.toLowerCase() !== walletStr.toLowerCase()
      ) {
        return json(403, {
          message: "Only the token/collection creator can delete messages",
        });
      }

      await storage.deleteMessage(id);
      return noContent();
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      return json(400, {
        message: first?.message ?? "Validation error",
        field: first?.path?.join("."),
      });
    }
    console.error("messages API error:", err);
    return json(500, { message: "Internal server error" });
  }

  return json(404, { message: "Not found" });
};
