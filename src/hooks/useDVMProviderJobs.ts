import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to get recent job requests and results for a specific DVM provider
 */
export function useDVMProviderJobs(providerPubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-provider-jobs', providerPubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // First, get feedback and results from this provider
      const providerEvents = await nostr.query(
        [
          {
            kinds: [
              6000, 6001, 6002, 6050, 6100, 6200, 6201, 6202, 6250, 6300, 6301, 6302, 6303, 6400, 6500, 6900, 6901,
              6905, 6970, 7000,
            ],
            authors: [providerPubkey],
            limit: 50,
          },
        ],
        { signal }
      );

      // Extract the job request IDs from feedback and results
      const jobRequestIds = new Set<string>();
      for (const event of providerEvents) {
        const eTag = event.tags.find(([name]) => name === 'e');
        if (eTag?.[1]) {
          jobRequestIds.add(eTag[1]);
        }
      }

      if (jobRequestIds.size === 0) {
        return [];
      }

      // Fetch the original job requests
      const jobRequests = await nostr.query(
        [
          {
            ids: Array.from(jobRequestIds),
          },
        ],
        { signal }
      );

      // Combine and sort by creation time
      const jobsMap = new Map<string, { request: NostrEvent; responses: NostrEvent[] }>();

      for (const request of jobRequests) {
        jobsMap.set(request.id, { request, responses: [] });
      }

      for (const response of providerEvents) {
        const eTag = response.tags.find(([name]) => name === 'e');
        if (eTag?.[1] && jobsMap.has(eTag[1])) {
          jobsMap.get(eTag[1])!.responses.push(response);
        }
      }

      const jobs = Array.from(jobsMap.values())
        .sort((a, b) => b.request.created_at - a.request.created_at);

      return jobs;
    },
    enabled: !!providerPubkey,
    staleTime: 1000 * 30, // 30 seconds
  });
}
