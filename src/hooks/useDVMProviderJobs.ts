import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to get recent job requests and results for a specific DVM provider
 * This includes:
 * 1. Jobs specifically targeting this provider (with p tag)
 * 2. Jobs where this provider has responded (feedback or results)
 */
export function useDVMProviderJobs(providerPubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-provider-jobs', providerPubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query 1: Get job requests specifically targeting this provider (with p tag)
      const targetedJobRequests = await nostr.query(
        [
          {
            kinds: [
              5000, 5001, 5002, 5050, 5100, 5200, 5201, 5202, 5250, 5300, 5301, 5302, 5303, 5400, 5500, 5900, 5901,
              5905, 5970,
            ],
            '#p': [providerPubkey],
            limit: 50,
          },
        ],
        { signal }
      );

      // Query 2: Get feedback and results from this provider
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

      // Fetch the original job requests (that weren't already fetched in query 1)
      const existingIds = new Set(targetedJobRequests.map((r) => r.id));
      const missingIds = Array.from(jobRequestIds).filter((id) => !existingIds.has(id));

      let additionalJobRequests: NostrEvent[] = [];
      if (missingIds.length > 0) {
        additionalJobRequests = await nostr.query(
          [
            {
              ids: missingIds,
            },
          ],
          { signal }
        );
      }

      // Combine all job requests
      const allJobRequests = [...targetedJobRequests, ...additionalJobRequests];

      // Build jobs map with requests and their responses
      const jobsMap = new Map<string, { request: NostrEvent; responses: NostrEvent[] }>();

      for (const request of allJobRequests) {
        jobsMap.set(request.id, { request, responses: [] });
      }

      for (const response of providerEvents) {
        const eTag = response.tags.find(([name]) => name === 'e');
        if (eTag?.[1] && jobsMap.has(eTag[1])) {
          jobsMap.get(eTag[1])!.responses.push(response);
        }
      }

      const jobs = Array.from(jobsMap.values()).sort((a, b) => b.request.created_at - a.request.created_at);

      return jobs;
    },
    enabled: !!providerPubkey,
    staleTime: 1000 * 30, // 30 seconds
  });
}
