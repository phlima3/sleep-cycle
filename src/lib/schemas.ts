import { z } from 'zod';

// Time string format validation (HH:MM)
const timeString = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Invalid time format. Expected HH:MM',
});

// Settings Schema
export const settingsSchema = z.object({
  cycleLength: z
    .number()
    .min(60, 'Cycle length must be at least 60 minutes')
    .max(120, 'Cycle length must be at most 120 minutes')
    .default(90),
  sleepLatency: z
    .number()
    .min(0, 'Sleep latency cannot be negative')
    .max(60, 'Sleep latency must be at most 60 minutes')
    .default(15),
  language: z
    .enum(['pt-BR', 'en', 'es', 'fr', 'de'])
    .default('pt-BR'),
  notificationsEnabled: z.boolean().default(false),
});

export type Settings = z.infer<typeof settingsSchema>;

// Sleep Entry Schema
export const sleepEntrySchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Invalid date format. Expected YYYY-MM-DD',
  }),
  bedtime: timeString,
  wakeupTime: timeString,
  completeCycles: z
    .number()
    .int()
    .min(0, 'Complete cycles cannot be negative')
    .max(10, 'Complete cycles cannot exceed 10'),
  partialCycle: z
    .number()
    .min(0, 'Partial cycle cannot be negative')
    .max(1, 'Partial cycle must be between 0 and 1'),
  idealBedtime: timeString,
  idealWakeupTime: timeString,
});

export type SleepEntry = z.infer<typeof sleepEntrySchema>;

// Sleep Entry without ID (for creation)
export const sleepEntryCreateSchema = sleepEntrySchema.omit({ id: true });
export type SleepEntryCreate = z.infer<typeof sleepEntryCreateSchema>;

// Sleep Calculation Input Schema
export const sleepCalculationInputSchema = z.object({
  bedtime: timeString,
  wakeupTime: timeString,
  latencyMinutes: z
    .number()
    .min(0)
    .max(60)
    .optional()
    .default(15),
  cycleLengthMinutes: z
    .number()
    .min(60)
    .max(120)
    .optional()
    .default(90),
});

export type SleepCalculationInput = z.infer<typeof sleepCalculationInputSchema>;

// Sleep Calculation Result Schema
export const sleepCalculationResultSchema = z.object({
  completeCycles: z.number().int().min(0),
  partialCycle: z.number().min(0).max(1),
  totalSleepMinutes: z.number().min(0),
  adjustedBedtime: timeString,
});

export type SleepCalculationResult = z.infer<typeof sleepCalculationResultSchema>;

// Sleep Results (full navigation state)
export const sleepResultsSchema = z.object({
  bedtime: timeString,
  wakeupTime: timeString,
  latency: z.number().min(0),
  cycleLength: z.number().min(60).max(120),
  completeCycles: z.number().int().min(0),
  partialCycle: z.number().min(0).max(1),
  totalSleepMinutes: z.number().min(0),
  adjustedBedtime: timeString,
  idealBedtimes: z.array(timeString),
  idealWakeupTimes: z.array(timeString),
});

export type SleepResults = z.infer<typeof sleepResultsSchema>;

// Validation helpers
export function validateSettings(data: unknown): Settings {
  return settingsSchema.parse(data);
}

export function validateSleepEntry(data: unknown): SleepEntry {
  return sleepEntrySchema.parse(data);
}

export function validateSleepCalculationInput(data: unknown): SleepCalculationInput {
  return sleepCalculationInputSchema.parse(data);
}

export function safeValidateSettings(data: unknown): { success: true; data: Settings } | { success: false; error: z.ZodError } {
  const result = settingsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function safeValidateSleepEntry(data: unknown): { success: true; data: SleepEntry } | { success: false; error: z.ZodError } {
  const result = sleepEntrySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
