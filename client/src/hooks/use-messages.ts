import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MessageInput } from "@shared/routes";
import { buildApiUrl, getApiHeaders } from "@/lib/api";
import { z } from "zod";

export function useMessages(pageUrl: string) {
  return useQuery({
    queryKey: [api.messages.list.path, pageUrl],
    queryFn: async () => {
      const url = buildApiUrl(api.messages.list.path, {
        pageUrl,
      });
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) throw new Error("Failed to fetch messages");
      
      const data = await res.json();
      return api.messages.list.responses[200].parse(data);
    },
    refetchInterval: 3000, // Poll every 3 seconds for new chat messages
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MessageInput) => {
      const validated = api.messages.create.input.parse(data);
      const url = buildApiUrl(api.messages.create.path);
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.messages.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to send message");
      }
      
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [api.messages.list.path, variables.pageUrl],
      });
    },
  });
}

export function useDeleteMessage(pageUrl: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      walletAddress,
    }: {
      id: number;
      walletAddress: string;
    }) => {
      const path = `/api/messages/${id}`;
      const url = buildApiUrl(path);
      const res = await fetch(url, {
        method: "DELETE",
        headers: getApiHeaders({ walletAddress }),
        credentials: "include",
      });
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Forbidden");
      }
      if (res.status === 404) throw new Error("Message not found");
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: (_, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [api.messages.list.path, pageUrl],
      });
    },
  });
}
