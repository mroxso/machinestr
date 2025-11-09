import type { NostrEvent } from '@nostrify/nostrify';
import type {
  DVMInput,
  DVMParam,
  DVMJobRequest,
  DVMJobResult,
  DVMJobFeedback,
  DVMFeedbackStatus,
  DVMProvider,
} from './dvmTypes';

/**
 * Parse DVM inputs from event tags
 */
export function parseInputs(event: NostrEvent): DVMInput[] {
  return event.tags
    .filter(([tagName]) => tagName === 'i')
    .map(([_, data, type, relay, marker]) => ({
      data,
      type: (type || 'text') as DVMInput['type'],
      relay,
      marker,
    }));
}

/**
 * Parse DVM parameters from event tags
 */
export function parseParams(event: NostrEvent): DVMParam[] {
  return event.tags
    .filter(([tagName]) => tagName === 'param')
    .map(([_, key, value]) => ({
      key,
      value,
    }));
}

/**
 * Parse DVM job request from event
 */
export function parseJobRequest(event: NostrEvent): DVMJobRequest {
  const inputs = parseInputs(event);
  const params = parseParams(event);
  const outputTag = event.tags.find(([name]) => name === 'output');
  const bidTag = event.tags.find(([name]) => name === 'bid');
  const relaysTag = event.tags.find(([name]) => name === 'relays');
  const serviceProviders = event.tags
    .filter(([name]) => name === 'p')
    .map(([_, pubkey]) => pubkey);
  const encrypted = event.tags.some(([name]) => name === 'encrypted');

  return {
    kind: event.kind,
    content: event.content,
    inputs,
    output: outputTag?.[1],
    params,
    bid: bidTag ? parseInt(bidTag[1]) : undefined,
    relays: relaysTag ? relaysTag.slice(1) : undefined,
    serviceProviders: serviceProviders.length > 0 ? serviceProviders : undefined,
    encrypted,
  };
}

/**
 * Parse DVM job result from event
 */
export function parseJobResult(event: NostrEvent): DVMJobResult | null {
  const requestTag = event.tags.find(([name]) => name === 'request');
  if (!requestTag) return null;

  let requestEvent: NostrEvent;
  try {
    requestEvent = JSON.parse(requestTag[1]);
  } catch {
    return null;
  }

  const amountTag = event.tags.find(([name]) => name === 'amount');
  const encrypted = event.tags.some(([name]) => name === 'encrypted');

  return {
    event,
    requestEvent,
    payload: event.content,
    amount: amountTag ? parseInt(amountTag[1]) : undefined,
    bolt11: amountTag?.[2],
    encrypted,
  };
}

/**
 * Parse DVM job feedback from event
 */
export function parseJobFeedback(event: NostrEvent): DVMJobFeedback | null {
  const statusTag = event.tags.find(([name]) => name === 'status');
  if (!statusTag) return null;

  const amountTag = event.tags.find(([name]) => name === 'amount');

  return {
    event,
    status: statusTag[1] as DVMFeedbackStatus,
    extraInfo: statusTag[2],
    amount: amountTag ? parseInt(amountTag[1]) : undefined,
    bolt11: amountTag?.[2],
    partialResult: event.content || undefined,
  };
}

/**
 * Parse DVM provider from NIP-89 event
 */
export function parseDVMProvider(event: NostrEvent): DVMProvider | null {
  if (event.kind !== 31990) return null;

  let metadata: { name?: string; about?: string; picture?: string; nip05?: string; lud16?: string } = {};
  if (event.content) {
    try {
      metadata = JSON.parse(event.content);
    } catch {
      // Invalid JSON, continue without metadata
    }
  }

  const supportedKinds = event.tags
    .filter(([name]) => name === 'k')
    .map(([_, kind]) => parseInt(kind))
    .filter((k) => !isNaN(k));

  const tags = event.tags.filter(([name]) => name === 't').map(([_, tag]) => tag);

  return {
    pubkey: event.pubkey,
    event,
    name: metadata.name,
    about: metadata.about,
    picture: metadata.picture,
    nip05: metadata.nip05,
    lud16: metadata.lud16,
    supportedKinds,
    tags,
  };
}

/**
 * Create input tags for a job request
 */
export function createInputTags(inputs: DVMInput[]): string[][] {
  return inputs.map((input) => {
    const tag = ['i', input.data, input.type];
    if (input.relay) tag.push(input.relay);
    if (input.marker) tag.push(input.marker);
    return tag;
  });
}

/**
 * Create param tags for a job request
 */
export function createParamTags(params: DVMParam[]): string[][] {
  return params.map((param) => ['param', param.key, param.value]);
}

/**
 * Validate DVM job request
 */
export function validateJobRequest(event: NostrEvent): boolean {
  if (event.kind < 5000 || event.kind >= 6000) return false;

  // Must have at least one input or content
  const hasInputs = event.tags.some(([name]) => name === 'i');
  const hasContent = event.content.trim().length > 0;

  return hasInputs || hasContent;
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: DVMFeedbackStatus | 'pending' | 'completed'): string {
  switch (status) {
    case 'pending':
      return 'text-muted-foreground';
    case 'processing':
      return 'text-blue-600';
    case 'payment-required':
      return 'text-amber-600';
    case 'partial':
      return 'text-purple-600';
    case 'success':
    case 'completed':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get status icon for UI display
 */
export function getStatusIcon(status: DVMFeedbackStatus | 'pending' | 'completed'): string {
  switch (status) {
    case 'pending':
      return '⏱️';
    case 'processing':
      return '⚙️';
    case 'payment-required':
      return '💰';
    case 'partial':
      return '📊';
    case 'success':
    case 'completed':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
}

/**
 * Format millisats to sats
 */
export function formatAmount(millisats: number): string {
  const sats = Math.floor(millisats / 1000);
  return sats.toLocaleString();
}
