import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseDVMProvider } from '@/lib/dvmUtils';
import type { DVMProvider } from '@/lib/dvmTypes';

/**
 * Hook to discover DVM providers from the network using NIP-89
 * Note: Queries for kind:31990 (application handlers) and filters for DVMs
 * by checking for k tags in the 5000-5999 range (DVM job kinds)
 */
export function useDVMProviders(options?: { kinds?: number[]; tags?: string[] }) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-providers', options?.kinds, options?.tags],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const filters: Array<{ kinds: number[]; '#k'?: string[]; '#t'?: string[] }> = [
        { kinds: [31990] }, // NIP-89 application handlers
      ];

      // Add DVM job kind filter if specified (5000-5999)
      // This filters at relay level for better performance
      if (options?.kinds && options.kinds.length > 0) {
        filters[0]['#k'] = options.kinds.map((k) => k.toString());
      }

      // Add tag filter if specified (e.g., 'bitcoin', 'translation')
      if (options?.tags && options.tags.length > 0) {
        filters[0]['#t'] = options.tags;
      }

      const events = await nostr.query(filters, { signal });

      // Parse and deduplicate providers
      // parseDVMProvider filters out non-DVM applications (those without k tags in 5000-5999)
      const providersMap = new Map<string, DVMProvider>();

      for (const event of events) {
        const provider = parseDVMProvider(event);
        if (!provider) continue; // Skips non-DVM applications

        const existing = providersMap.get(provider.pubkey);
        if (!existing || event.created_at > existing.event.created_at) {
          providersMap.set(provider.pubkey, provider);
        }
      }

      return Array.from(providersMap.values()).sort((a, b) => {
        // Sort by event creation time (newest first)
        return b.event.created_at - a.event.created_at;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a specific DVM provider by pubkey
 */
export function useDVMProvider(pubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-provider', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      const events = await nostr.query([{ kinds: [31990], authors: [pubkey] }], { signal });

      if (events.length === 0) return null;

      // Get the latest announcement from this provider
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      return parseDVMProvider(latestEvent);
    },
    enabled: !!pubkey,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
