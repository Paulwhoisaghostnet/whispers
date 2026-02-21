import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MessageInput } from "@shared/routes";
import { z } from "zod";

export function useMessages(pageUrl: string) {
  return useQuery({
    queryKey: [api.messages.list.path, pageUrl],
    queryFn: async () => {
      // Construct URL manually since we need to pass query params
      const url = `${api.messages.list.path}?pageUrl=${encodeURIComponent(pageUrl)}`;
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
      // Validate input before sending
      const validated = api.messages.create.input.parse(data);
      
      const res = await fetch(api.messages.create.path, {
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
      // Invalidate the query for the specific page URL
      queryClient.invalidateQueries({ 
        queryKey: [api.messages.list.path, variables.pageUrl] 
      });
    },
  });
}
