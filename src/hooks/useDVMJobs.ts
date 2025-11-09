import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseJobResult, parseJobFeedback } from '@/lib/dvmUtils';
import { isResultKind, isFeedbackKind } from '@/lib/dvmTypes';
import type { DVMJobState } from '@/lib/dvmTypes';

/**
 * Hook to get job state (request, results, and feedback) for a specific job
 */
export function useDVMJobState(jobRequestId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-job-state', jobRequestId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for results and feedback for this job
      const events = await nostr.query(
        [
          {
            kinds: [6000, 6001, 6002, 6003, 6004, 6005, 6100, 6200, 6250, 6300, 6400, 6500, 6900, 6970, 7000],
            '#e': [jobRequestId],
          },
        ],
        { signal }
      );

      const results = events.filter((e) => isResultKind(e.kind)).map(parseJobResult).filter(Boolean);
      const feedbackEvents = events
        .filter((e) => isFeedbackKind(e.kind))
        .map(parseJobFeedback)
        .filter(Boolean);

      // Sort feedback by creation time
      const sortedFeedback = feedbackEvents.sort((a, b) => a!.event.created_at - b!.event.created_at);

      // Determine overall status
      let status: DVMJobState['status'] = 'pending';
      if (results.length > 0) {
        const latestResult = results[results.length - 1];
        const latestFeedback = sortedFeedback[sortedFeedback.length - 1];

        if (latestFeedback && latestFeedback.status === 'success') {
          status = 'completed';
        } else if (latestResult) {
          status = 'completed';
        }
      } else if (sortedFeedback.length > 0) {
        status = sortedFeedback[sortedFeedback.length - 1]!.status;
      }

      return {
        results,
        feedback: sortedFeedback,
        status,
      };
    },
    enabled: !!jobRequestId,
    refetchInterval: (query) => {
      // Keep polling if job is not completed
      const status = query.state.data?.status;
      if (status && ['pending', 'processing', 'payment-required'].includes(status)) {
        return 5000; // Poll every 5 seconds
      }
      return false; // Stop polling
    },
  });
}

/**
 * Hook to get job history for the current user
 */
export function useDVMJobHistory(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-job-history', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      if (!pubkey) return [];

      // Query for all job requests from this user
      const jobRequests = await nostr.query(
        [
          {
            kinds: [
              5000, 5001, 5002, 5050, 5100, 5200, 5201, 5202, 5250, 5300, 5301, 5302, 5303, 5400, 5500, 5900, 5901,
              5905, 5970,
            ],
            authors: [pubkey],
            limit: 50,
          },
        ],
        { signal }
      );

      // Sort by creation time (newest first)
      return jobRequests.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to monitor active jobs (jobs that are processing or pending payment)
 */
export function useActiveDVMJobs(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-active-jobs', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      if (!pubkey) return [];

      // Get recent job requests
      const recentJobRequests = await nostr.query(
        [
          {
            kinds: [
              5000, 5001, 5002, 5050, 5100, 5200, 5201, 5202, 5250, 5300, 5301, 5302, 5303, 5400, 5500, 5900, 5901,
              5905, 5970,
            ],
            authors: [pubkey],
            limit: 20,
            since: Math.floor(Date.now() / 1000) - 60 * 60 * 24, // Last 24 hours
          },
        ],
        { signal }
      );

      if (recentJobRequests.length === 0) return [];

      // Get feedback for these jobs
      const jobIds = recentJobRequests.map((j) => j.id);
      const feedbackAndResults = await nostr.query(
        [
          {
            kinds: [6000, 6001, 6002, 6003, 6004, 6005, 6100, 6200, 6250, 6300, 6400, 6500, 6900, 6970, 7000],
            '#e': jobIds,
          },
        ],
        { signal }
      );

      // Build job states
      const jobStates: DVMJobState[] = [];

      for (const request of recentJobRequests) {
        const relatedEvents = feedbackAndResults.filter((e) => {
          return e.tags.some(([name, value]) => name === 'e' && value === request.id);
        });

        const results = relatedEvents.filter((e) => isResultKind(e.kind));
        const feedbacks = relatedEvents.filter((e) => isFeedbackKind(e.kind));

        // Determine status
        let status: DVMJobState['status'] = 'pending';
        let currentProvider: string | undefined;

        if (results.length > 0) {
          status = 'completed';
          currentProvider = results[0].pubkey;
        } else if (feedbacks.length > 0) {
          const latestFeedback = parseJobFeedback(feedbacks[feedbacks.length - 1]);
          if (latestFeedback) {
            status = latestFeedback.status;
            currentProvider = feedbacks[feedbacks.length - 1].pubkey;
          }
        }

        // Only include active jobs
        if (['pending', 'processing', 'payment-required', 'partial'].includes(status)) {
          const parsedFeedback = feedbacks.map(parseJobFeedback).filter((f): f is NonNullable<typeof f> => f !== null);
          jobStates.push({
            request,
            feedback: parsedFeedback,
            status,
            currentProvider,
            createdAt: request.created_at,
          });
        }
      }

      return jobStates.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!pubkey,
    refetchInterval: 10000, // Poll every 10 seconds for active jobs
  });
}
