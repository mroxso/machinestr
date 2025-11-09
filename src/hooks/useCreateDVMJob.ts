import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import { createInputTags, createParamTags } from '@/lib/dvmUtils';
import type { DVMInput, DVMParam } from '@/lib/dvmTypes';

export interface CreateJobRequestOptions {
  kind: number;
  inputs: DVMInput[];
  params?: DVMParam[];
  output?: string;
  bid?: number;
  relays?: string[];
  serviceProviders?: string[];
  content?: string;
}

/**
 * Hook to create and publish DVM job requests
 */
export function useCreateDVMJob() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: CreateJobRequestOptions) => {
      const tags: string[][] = [];

      // Add input tags
      if (options.inputs.length > 0) {
        tags.push(...createInputTags(options.inputs));
      }

      // Add param tags
      if (options.params && options.params.length > 0) {
        tags.push(...createParamTags(options.params));
      }

      // Add output tag
      if (options.output) {
        tags.push(['output', options.output]);
      }

      // Add bid tag
      if (options.bid) {
        tags.push(['bid', options.bid.toString()]);
      }

      // Add relays tag
      if (options.relays && options.relays.length > 0) {
        tags.push(['relays', ...options.relays]);
      }

      // Add service provider tags
      if (options.serviceProviders && options.serviceProviders.length > 0) {
        for (const provider of options.serviceProviders) {
          tags.push(['p', provider]);
        }
      }

      // Publish the job request
      const event = await publishEvent({
        kind: options.kind,
        content: options.content || '',
        tags,
      });

      return event;
    },
    onSuccess: () => {
      // Invalidate job history queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['dvm-job-history'] });
      queryClient.invalidateQueries({ queryKey: ['dvm-active-jobs'] });
    },
  });
}
