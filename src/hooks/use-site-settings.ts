import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/site.functions";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 60_000,
  });
}
