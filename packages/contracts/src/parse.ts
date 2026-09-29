import type { z } from 'zod';

export class ContractParseError extends Error {
  readonly issues: z.core.$ZodIssue[];
  constructor(label: string, error: z.ZodError) {
    super(`Invalid ${label}: ${error.message}`);
    this.name = 'ContractParseError';
    this.issues = error.issues;
  }
}

export function parse<S extends z.ZodType>(schema: S, data: unknown, label = 'payload'): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ContractParseError(label, result.error);
  return result.data;
}

export function safeParse<S extends z.ZodType>(
  schema: S,
  data: unknown,
): { ok: true; data: z.output<S> } | { ok: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
