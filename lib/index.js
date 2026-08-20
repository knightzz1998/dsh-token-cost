/**
 * dsh-token-cost — host half.
 *
 * Registers a `tokenCost` session projection: replays each session log and
 * prices every provider usage sample (uncached input, cache read, cache
 * write, output) against a per-provider/model rate table, with optional
 * DeepSeek peak/off-peak pricing applied by the event's UTC hour.
 *
 * The projection is reactive: `assistant/chunk` usage lands mid-stream, so
 * the browser pill updates while a turn is still generating; the final
 * `assistant/message` usage replaces the same (turn, step) sample instead of
 * double counting (same replacement semantics as dsh-token-meter).
 *
 * Pricing is pure configuration: the loader row in
 * `~/.dsh/profiles/web/cordis.patch.yml` carries the rate table, so editing
 * prices is a config change, not a code change. Changing the table requires a
 * restart (rates are captured when the fold is registered).
 */
import z from '@deepseek-ai/schemastery';
import { z as zod } from 'zod';

/** One rate set: USD per 1,000,000 tokens. */
const rateSchema = z.object({
  input: z.number().min(0),
  cacheRead: z.number().min(0),
  cacheWrite: z.number().min(0),
  output: z.number().min(0),
});

/** One model spec: base rates plus an optional peak-hour rate set (schemastery fields are optional by default). */
const modelSpecSchema = z.object({
  input: z.number().min(0),
  cacheRead: z.number().min(0),
  cacheWrite: z.number().min(0),
  output: z.number().min(0),
  peak: rateSchema,
});

/** Default rates: DeepSeek V4 Flash off-peak (see api-docs.deepseek.com). */
const DEFAULT_SPEC = {
  input: 0.22,
  cacheRead: 0.007,
  cacheWrite: 0.22,
  output: 0.66,
  peak: {
    input: 0.44,
    cacheRead: 0.014,
    cacheWrite: 0.44,
    output: 1.32,
  },
};

/** Wire-validated projection payload (see view()). */
const viewSchema = zod.object({
  costUsd: zod.number().nonnegative(),
  currency: zod.string(),
  cnyUsdRate: zod.number().nonnegative(),
  tokens: zod.object({
    uncachedInput: zod.number().int().nonnegative(),
    cacheRead: zod.number().int().nonnegative(),
    cacheWrite: zod.number().int().nonnegative(),
    output: zod.number().int().nonnegative(),
  }),
  provider: zod.string().nullable(),
  model: zod.string().nullable(),
  rates: zod.object({
    input: zod.number().nonnegative(),
    cacheRead: zod.number().nonnegative(),
    cacheWrite: zod.number().nonnegative(),
    output: zod.number().nonnegative(),
  }).nullable(),
  peak: zod.boolean(),
}).strict();

/** Extract a usage sample from an event, if it carries one. */
function usageSampleOf(event) {
  if (event.type === 'assistant/chunk' && event.data.chunk.type === 'usage') {
    return { usage: event.data.chunk.usage, turn: event.data.turn, step: event.data.step };
  }
  if (event.type === 'assistant/message' && event.data.usage !== undefined) {
    return { usage: event.data.usage, turn: event.data.turn, step: event.data.step };
  }
  return null;
}

/** Disjoint token buckets from one provider usage report. */
function bucketsOf(usage) {
  return {
    uncachedInput: usage.inputTokens,
    cacheRead: usage.cacheReadTokens ?? 0,
    cacheWrite: usage.cacheWriteTokens ?? 0,
    output: usage.outputTokens,
  };
}

/** Whether a UTC hour falls inside any [start, end) peak window. */
function isPeakHour(timeMs, windows) {
  if (windows.length === 0) return false;
  const hour = new Date(timeMs).getUTCHours();
  return windows.some(([start, end]) => hour >= start && hour < end);
}

/** Price one bucket set in USD, given per-million rates. */
function priceUsd(buckets, rates) {
  return (
    buckets.uncachedInput * rates.input +
    buckets.cacheRead * rates.cacheRead +
    buckets.cacheWrite * rates.cacheWrite +
    buckets.output * rates.output
  ) / 1_000_000;
}

/**
 * Resolve the model spec for a route, falling back to `default`. Lookup order:
 * `models["<provider>/<model>"]` → `models["<model>"]` → `default`.
 */
function specOf(config, current) {
  if (current !== null) {
    const byRoute = config.models[`${current.provider}/${current.model}`];
    if (byRoute !== undefined) return byRoute;
    const byModel = config.models[current.model];
    if (byModel !== undefined) return byModel;
  }
  return config.default;
}

/** Effective rates for a sample: peak-adjusted when the hour is peak and the spec declares peak rates. */
function effectiveRates(spec, timeMs, windows) {
  const peak = isPeakHour(timeMs, windows) && spec.peak !== undefined;
  const rates = peak
    ? { input: spec.peak.input, cacheRead: spec.peak.cacheRead, cacheWrite: spec.peak.cacheWrite, output: spec.peak.output }
    : { input: spec.input, cacheRead: spec.cacheRead, cacheWrite: spec.cacheWrite, output: spec.output };
  return { rates, peak };
}

/**
 * The tokenCost projection unit. State stays bounded: cumulative integer
 * micro-dollar cost, cumulative token buckets, the latest route identity, the
 * rates used for the most recent sample, and the single last sample needed for
 * same-(turn, step) replacement.
 */
function costProjectionDefinition(config, peakWindows) {
  const { currency, cnyUsdRate } = config;
  return {
    key: 'tokenCost',
    schema: viewSchema,
    init: () => ({
      costUsdMicro: 0,
      tokens: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
      provider: null,
      model: null,
      rates: null,
      peak: false,
      last: null,
      current: null,
    }),
    apply: (state, event) => {
      if (event.type === 'request/header') {
        const cfg = event.data.header?.config;
        if (cfg === undefined) return state;
        const current = { provider: String(cfg.provider ?? ''), model: String(cfg.model ?? '') };
        return { ...state, current, provider: current.provider, model: current.model };
      }
      const sample = usageSampleOf(event);
      if (sample === null) return state;
      const { rates, peak } = effectiveRates(specOf(config, state.current), event.time ?? Date.now(), peakWindows);
      const buckets = bucketsOf(sample.usage);
      const costUsdMicro = Math.round(priceUsd(buckets, rates) * 1_000_000);
      const previous = state.last !== null && state.last.turn === sample.turn && state.last.step === sample.step
        ? state.last
        : null;
      return {
        ...state,
        costUsdMicro: state.costUsdMicro - (previous?.costUsdMicro ?? 0) + costUsdMicro,
        tokens: {
          uncachedInput: state.tokens.uncachedInput - (previous?.tokens.uncachedInput ?? 0) + buckets.uncachedInput,
          cacheRead: state.tokens.cacheRead - (previous?.tokens.cacheRead ?? 0) + buckets.cacheRead,
          cacheWrite: state.tokens.cacheWrite - (previous?.tokens.cacheWrite ?? 0) + buckets.cacheWrite,
          output: state.tokens.output - (previous?.tokens.output ?? 0) + buckets.output,
        },
        rates,
        peak,
        last: { turn: sample.turn, step: sample.step, tokens: buckets, costUsdMicro },
      };
    },
    view: (state) => ({
      costUsd: state.costUsdMicro / 1_000_000,
      currency,
      cnyUsdRate,
      tokens: { ...state.tokens },
      provider: state.current?.provider ?? null,
      model: state.current?.model ?? null,
      rates: state.rates,
      peak: state.peak,
    }),
    stateVersion: 1,
  };
}

/**
 * Fill any rate a spec omits from its fallback (schemastery fields are
 * optional by default, so a sparse user entry must not produce NaN).
 */
function normalizeSpec(spec, fallback) {
  const base = {
    input: spec.input ?? fallback.input,
    cacheRead: spec.cacheRead ?? fallback.cacheRead,
    cacheWrite: spec.cacheWrite ?? fallback.cacheWrite,
    output: spec.output ?? fallback.output,
  };
  if (spec.peak === undefined || spec.peak === null) return base;
  return {
    ...base,
    peak: {
      input: spec.peak.input ?? fallback.peak?.input ?? base.input,
      cacheRead: spec.peak.cacheRead ?? fallback.peak?.cacheRead ?? base.cacheRead,
      cacheWrite: spec.peak.cacheWrite ?? fallback.peak?.cacheWrite ?? base.cacheWrite,
      output: spec.peak.output ?? fallback.peak?.output ?? base.output,
    },
  };
}

/** Normalize the whole config's rate table into complete specs. */
function normalizeConfig(config) {
  const fallback = normalizeSpec(config.default, DEFAULT_SPEC);
  const models = {};
  for (const [name, spec] of Object.entries(config.models ?? {})) models[name] = normalizeSpec(spec, fallback);
  return { ...config, default: fallback, models };
}

/**
 * Plugin body: register the tokenCost projection unit once the projection
 * registry is available.
 */
function apply(ctx, config) {
  const normalized = normalizeConfig(config);
  const peakWindows = normalized.peakHoursUtc;
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(costProjectionDefinition(normalized, peakWindows));
  });
}

/** Loader row config: currency, optional CNY cross-rate, rate table, peak windows. */
apply.Config = z.object({
  currency: z.string().default('USD'),
  cnyUsdRate: z.number().min(0).default(0),
  default: modelSpecSchema.default(DEFAULT_SPEC),
  models: z.dict(modelSpecSchema).default({}),
  peakHoursUtc: z.array(z.tuple([z.number(), z.number()])).default([[1, 4], [6, 10]]),
});

export { costProjectionDefinition, effectiveRates, priceUsd, usageSampleOf };
export default apply;
