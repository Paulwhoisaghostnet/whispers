import { z } from 'zod';
import { insertMessageSchema, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/messages" as const,
      input: z
        .object({
          pageUrl: z.string(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/messages" as const,
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/messages/:id" as const,
      pathPattern: /^\/api\/messages\/(\d+)$/,
      responses: {
        204: z.undefined(),
        403: errorSchemas.internal,
        404: errorSchemas.internal,
      },
    },
  },
  creator: {
    get: {
      method: "GET" as const,
      path: "/api/creator" as const,
      input: z.object({ pageUrl: z.string() }).optional(),
      responses: {
        200: z.object({ creatorAddress: z.string().nullable() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MessageInput = z.infer<typeof api.messages.create.input>;
export type MessageResponse = z.infer<typeof api.messages.create.responses[201]>;
export type MessagesListResponse = z.infer<typeof api.messages.list.responses[200]>;
export type CreatorResponse = z.infer<typeof api.creator.get.responses[200]>;