import type { NostrEvent } from '@nostrify/nostrify';

/**
 * DVM Input types according to NIP-90
 */
export type DVMInputType = 'url' | 'event' | 'job' | 'text';

/**
 * DVM Input tag structure
 */
export interface DVMInput {
  data: string;
  type: DVMInputType;
  relay?: string;
  marker?: string;
}

/**
 * DVM Parameter tag structure
 */
export interface DVMParam {
  key: string;
  value: string;
}

/**
 * DVM Job Request structure (kind 5000-5999)
 */
export interface DVMJobRequest {
  kind: number;
  content: string;
  inputs: DVMInput[];
  output?: string;
  params: DVMParam[];
  bid?: number;
  relays?: string[];
  serviceProviders?: string[];
  encrypted?: boolean;
}

/**
 * DVM Job Result structure (kind 6000-6999)
 */
export interface DVMJobResult {
  event: NostrEvent;
  requestEvent: NostrEvent;
  payload: string;
  amount?: number;
  bolt11?: string;
  encrypted?: boolean;
}

/**
 * DVM Job Feedback status types
 */
export type DVMFeedbackStatus =
  | 'payment-required'
  | 'processing'
  | 'error'
  | 'success'
  | 'partial';

/**
 * DVM Job Feedback structure (kind 7000)
 */
export interface DVMJobFeedback {
  event: NostrEvent;
  status: DVMFeedbackStatus;
  extraInfo?: string;
  amount?: number;
  bolt11?: string;
  partialResult?: string;
}

/**
 * DVM Service Provider information from NIP-89
 */
export interface DVMProvider {
  pubkey: string;
  event: NostrEvent;
  name?: string;
  about?: string;
  picture?: string;
  supportedKinds: number[];
  tags: string[];
  nip05?: string;
  lud16?: string;
}

/**
 * Combined job state for UI display
 */
export interface DVMJobState {
  request: NostrEvent;
  result?: DVMJobResult;
  feedback: DVMJobFeedback[];
  status: DVMFeedbackStatus | 'pending' | 'completed';
  currentProvider?: string;
  createdAt: number;
}

/**
 * Known DVM job kinds with their descriptions
 */
export const DVM_JOB_KINDS: Record<number, { name: string; description: string }> = {
  5000: { name: 'Text Extraction', description: 'Extract text from various inputs' },
  5001: { name: 'Summarization', description: 'Summarize text content' },
  5002: { name: 'Translation', description: 'Translate text to different languages' },
  5050: { name: 'Text to Speech', description: 'Convert text to audio' },
  5100: { name: 'Text Generation', description: 'Generate text using AI' },
  5200: { name: 'Image Generation', description: 'Generate images using AI' },
  5201: { name: 'Image Upscaling', description: 'Upscale image resolution' },
  5202: { name: 'Image Manipulation', description: 'Modify or edit images' },
  5250: { name: 'Video Generation', description: 'Generate video content' },
  5300: { name: 'Discovery', description: 'Discover content based on criteria' },
  5301: { name: 'Search', description: 'Search for content' },
  5302: { name: 'People Discovery', description: 'Find people/profiles' },
  5303: { name: 'Content Discovery', description: 'Discover interesting content' },
  5400: { name: 'Timestamping', description: 'Timestamp verification' },
  5500: { name: 'NIP-05', description: 'NIP-05 verification service' },
  5900: { name: 'Generic', description: 'Generic computation task' },
  5901: { name: 'Web Scraping', description: 'Scrape web content' },
  5905: { name: 'Nostr Event Fetch', description: 'Fetch Nostr events' },
  5970: { name: 'Lightning Invoice', description: 'Generate Lightning invoices' },
};

/**
 * Get result kind from request kind
 */
export function getResultKind(requestKind: number): number {
  return requestKind + 1000;
}

/**
 * Check if a kind is a DVM request kind
 */
export function isRequestKind(kind: number): boolean {
  return kind >= 5000 && kind < 6000;
}

/**
 * Check if a kind is a DVM result kind
 */
export function isResultKind(kind: number): boolean {
  return kind >= 6000 && kind < 7000;
}

/**
 * Check if a kind is a DVM feedback kind
 */
export function isFeedbackKind(kind: number): boolean {
  return kind === 7000;
}

/**
 * Get job kind name and description
 */
export function getJobKindInfo(kind: number): { name: string; description: string } {
  return DVM_JOB_KINDS[kind] || { name: `Kind ${kind}`, description: 'Custom DVM job' };
}
