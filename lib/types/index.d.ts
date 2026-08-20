/**
 * dsh-token-cost — type surface.
 *
 * The host side registers a `tokenCost` session projection key; this file
 * augments the shared SessionProjectionMap so typed consumers can read the
 * key through `useProjection("tokenCost")`.
 */
import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types';

/** Disjoint cumulative token buckets, mirroring the tokenUsage projection. */
export interface TokenCostTokens {
  /** Billed input that missed the provider cache. */
  uncachedInput: number;
  /** Input served from the provider's context cache. */
  cacheRead: number;
  /** Input written into the cache (many providers bill 0). */
  cacheWrite: number;
  /** Generated output tokens (reasoning already included). */
  output: number;
}

/** One effective rate set: currency per 1,000,000 tokens (peak-adjusted). */
export interface TokenCostRates {
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
}

/** Cumulative priced usage for one complete session log. */
export interface TokenCostProjection {
  /** Total spend in the configured currency. */
  costUsd: number;
  /** Config currency code (USD default). */
  currency: string;
  /** Optional CNY cross-rate; 0 disables the CNY figure. */
  cnyUsdRate: number;
  tokens: TokenCostTokens;
  /** Latest request route identity; null before any request. */
  provider: string | null;
  model: string | null;
  /** Rates applied to the most recent sample; null before any usage. */
  rates: TokenCostRates | null;
  /** Whether the most recent sample was priced at peak rates. */
  peak: boolean;
  /** Peak-hour windows in LOCAL time, so the client can light a live peak indicator. */
  peakHours: Array<[number, number]>;
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Cumulative priced token spend for the complete durable log. */
    tokenCost: TokenCostProjection;
  }
}

export type { SessionProjectionMap };
