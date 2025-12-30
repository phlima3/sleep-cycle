import { describe, it, expect } from 'vitest';
import {
  settingsSchema,
  sleepEntrySchema,
  sleepCalculationInputSchema,
  validateSettings,
  validateSleepEntry,
  safeValidateSettings,
  safeValidateSleepEntry,
} from './schemas';

describe('Zod Schemas', () => {
  describe('settingsSchema', () => {
    it('should validate valid settings', () => {
      const validSettings = {
        cycleLength: 90,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: true,
      };

      const result = settingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid cycle length (too short)', () => {
      const invalidSettings = {
        cycleLength: 30,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: false,
      };

      const result = settingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid cycle length (too long)', () => {
      const invalidSettings = {
        cycleLength: 150,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: false,
      };

      const result = settingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid language', () => {
      const invalidSettings = {
        cycleLength: 90,
        sleepLatency: 15,
        language: 'invalid',
        notificationsEnabled: false,
      };

      const result = settingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should accept all valid languages', () => {
      const languages = ['pt-BR', 'en', 'es', 'fr', 'de'];

      languages.forEach((lang) => {
        const settings = {
          cycleLength: 90,
          sleepLatency: 15,
          language: lang,
          notificationsEnabled: false,
        };
        const result = settingsSchema.safeParse(settings);
        expect(result.success).toBe(true);
      });
    });

    it('should reject negative sleep latency', () => {
      const invalidSettings = {
        cycleLength: 90,
        sleepLatency: -5,
        language: 'en',
        notificationsEnabled: false,
      };

      const result = settingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  describe('sleepEntrySchema', () => {
    it('should validate valid sleep entry', () => {
      const validEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = sleepEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidEntry = {
        id: '123',
        date: '15-01-2024', // Wrong format
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = sleepEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '25:00', // Invalid hour
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = sleepEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject negative complete cycles', () => {
      const invalidEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: -1,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = sleepEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject partial cycle greater than 1', () => {
      const invalidEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 1.5, // Should be 0-1
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = sleepEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should accept midnight times', () => {
      const validEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '00:00',
        wakeupTime: '00:00',
        completeCycles: 0,
        partialCycle: 0,
        idealBedtime: '00:00',
        idealWakeupTime: '00:00',
      };

      const result = sleepEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('sleepCalculationInputSchema', () => {
    it('should validate valid input', () => {
      const validInput = {
        bedtime: '22:00',
        wakeupTime: '06:00',
        latencyMinutes: 15,
        cycleLengthMinutes: 90,
      };

      const result = sleepCalculationInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should use defaults for optional fields', () => {
      const minimalInput = {
        bedtime: '22:00',
        wakeupTime: '06:00',
      };

      const result = sleepCalculationInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latencyMinutes).toBe(15);
        expect(result.data.cycleLengthMinutes).toBe(90);
      }
    });
  });

  describe('validateSettings', () => {
    it('should return parsed settings for valid input', () => {
      const validSettings = {
        cycleLength: 90,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: true,
      };

      const result = validateSettings(validSettings);
      expect(result).toEqual(validSettings);
    });

    it('should throw for invalid input', () => {
      const invalidSettings = {
        cycleLength: 30, // Too short
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: true,
      };

      expect(() => validateSettings(invalidSettings)).toThrow();
    });
  });

  describe('validateSleepEntry', () => {
    it('should return parsed entry for valid input', () => {
      const validEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = validateSleepEntry(validEntry);
      expect(result).toEqual(validEntry);
    });

    it('should throw for invalid input', () => {
      const invalidEntry = {
        id: '123',
        date: 'invalid-date',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      expect(() => validateSleepEntry(invalidEntry)).toThrow();
    });
  });

  describe('safeValidateSettings', () => {
    it('should return success true for valid settings', () => {
      const validSettings = {
        cycleLength: 90,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: true,
      };

      const result = safeValidateSettings(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSettings);
      }
    });

    it('should return success false with error for invalid settings', () => {
      const invalidSettings = {
        cycleLength: 30,
        sleepLatency: 15,
        language: 'en',
        notificationsEnabled: true,
      };

      const result = safeValidateSettings(invalidSettings);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('safeValidateSleepEntry', () => {
    it('should return success true for valid entry', () => {
      const validEntry = {
        id: '123',
        date: '2024-01-15',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = safeValidateSleepEntry(validEntry);
      expect(result.success).toBe(true);
    });

    it('should return success false with error for invalid entry', () => {
      const invalidEntry = {
        id: '123',
        date: 'invalid',
        bedtime: '22:30',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0.3,
        idealBedtime: '22:15',
        idealWakeupTime: '05:45',
      };

      const result = safeValidateSleepEntry(invalidEntry);
      expect(result.success).toBe(false);
    });
  });
});
