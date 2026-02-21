import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { fetchCreatorAddress } from "../../shared/creator";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const handler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Not found" }),
    };
  }

  const pageUrl = event.queryStringParameters?.pageUrl ?? "";
  const creatorAddress = await fetchCreatorAddress(pageUrl);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
    body: JSON.stringify({ creatorAddress }),
  };
};
