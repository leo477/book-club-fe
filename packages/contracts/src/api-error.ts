import { z } from 'zod';

const detailObject = z.object({
  error: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});

export const apiErrorBody = z.object({
  detail: z.union([z.string(), detailObject, z.array(z.object({ msg: z.string().optional() }).loose())]).optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorBody>;

export const apiError = z.object({
  status: z.number(),
  detail: z.string().nullable(),
  translationKey: z.string(),
  code: z.string().nullish(),
});
export type ApiError = z.infer<typeof apiError>;
