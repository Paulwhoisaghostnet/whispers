import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { buildApiUrl } from "@/lib/api";

export function useCreator(pageUrl: string | null) {
  return useQuery({
    queryKey: [api.creator.get.path, pageUrl ?? ""],
    queryFn: async () => {
      const url = buildApiUrl(api.creator.get.path, { pageUrl: pageUrl ?? "" });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch creator");
      const data = await res.json();
      return api.creator.get.responses[200].parse(data);
    },
    enabled: !!pageUrl && pageUrl.length > 0,
  });
}
