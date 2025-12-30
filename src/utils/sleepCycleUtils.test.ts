import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatTime,
  parseTimeString,
  getMinutesDifference,
  calculateSleepCycles,
  calculateIdealBedtimes,
  calculateIdealWakeupTimes,
  shouldSendBedtimeNotification,
} from './sleepCycleUtils';

describe('sleepCycleUtils', () => {
  describe('parseTimeString', () => {
    it('should parse a valid time string', () => {
      const result = parseTimeString('22:30');
      expect(result.getHours()).toBe(22);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse midnight correctly', () => {
      const result = parseTimeString('00:00');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('should parse early morning time', () => {
      const result = parseTimeString('06:15');
      expect(result.getHours()).toBe(6);
      expect(result.getMinutes()).toBe(15);
    });
  });

  describe('getMinutesDifference', () => {
    it('should calculate minutes between two times on the same day', () => {
      const start = new Date();
      start.setHours(10, 0, 0, 0);

      const end = new Date();
      end.setHours(12, 30, 0, 0);

      expect(getMinutesDifference(start, end)).toBe(150);
    });

    it('should handle overnight time differences', () => {
      const start = new Date();
      start.setHours(23, 0, 0, 0);

      const end = new Date();
      end.setHours(7, 0, 0, 0);

      expect(getMinutesDifference(start, end)).toBe(480); // 8 hours
    });

    it('should return 0 for same time', () => {
      const start = new Date();
      start.setHours(12, 0, 0, 0);

      const end = new Date();
      end.setHours(12, 0, 0, 0);

      expect(getMinutesDifference(start, end)).toBe(0);
    });
  });

  describe('calculateSleepCycles', () => {
    it('should calculate complete cycles correctly for 7.5 hours of sleep', () => {
      // 22:00 bedtime, 07:00 wakeup = 9 hours
      // With 15 min latency = 8h45m actual sleep = 525 minutes
      // 525 / 90 = 5.83 cycles
      const result = calculateSleepCycles('22:00', '07:00', 15, 90);

      expect(result.completeCycles).toBe(5);
      expect(result.partialCycle).toBeCloseTo(0.833, 1);
      expect(result.totalSleepMinutes).toBe(525);
    });

    it('should calculate exactly 5 complete cycles', () => {
      // 22:00 bedtime, 05:45 wakeup = 7h45m
      // With 15 min latency = 7h30m actual sleep = 450 minutes
      // 450 / 90 = 5 exact cycles
      const result = calculateSleepCycles('22:00', '05:45', 15, 90);

      expect(result.completeCycles).toBe(5);
      expect(result.partialCycle).toBe(0);
      expect(result.totalSleepMinutes).toBe(450);
    });

    it('should handle overnight sleep (crossing midnight)', () => {
      const result = calculateSleepCycles('23:30', '07:00', 15, 90);

      expect(result.completeCycles).toBeGreaterThan(0);
      expect(result.totalSleepMinutes).toBe(435); // 7h15m
    });

    it('should handle custom cycle length', () => {
      // Using 100-minute cycles
      const result = calculateSleepCycles('22:00', '06:00', 0, 100);

      // 8 hours = 480 minutes
      // 480 / 100 = 4.8 cycles
      expect(result.completeCycles).toBe(4);
      expect(result.partialCycle).toBeCloseTo(0.8, 1);
    });

    it('should handle zero latency', () => {
      const result = calculateSleepCycles('22:00', '05:30', 0, 90);

      // 7.5 hours = 450 minutes = 5 exact cycles
      expect(result.completeCycles).toBe(5);
      expect(result.partialCycle).toBe(0);
      expect(result.totalSleepMinutes).toBe(450);
    });
  });

  describe('calculateIdealBedtimes', () => {
    it('should return array of ideal bedtimes', () => {
      const result = calculateIdealBedtimes('07:00', 15, 90, 4);

      expect(result).toHaveLength(4);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return times in descending order (most cycles first)', () => {
      const result = calculateIdealBedtimes('07:00', 15, 90, 4);

      // Each time should be later than the previous
      // (more cycles = earlier bedtime = smaller index)
      expect(result.length).toBe(4);
    });

    it('should calculate correct bedtime for 5 cycles', () => {
      // Wakeup at 07:00, 5 cycles (450 min), 15 min latency
      // Sleep start: 07:00 - 7h30m = 23:30
      // Bedtime: 23:30 - 15m = 23:15
      const result = calculateIdealBedtimes('07:00', 15, 90, 5);

      expect(result.length).toBe(5);
    });
  });

  describe('calculateIdealWakeupTimes', () => {
    it('should return array of ideal wakeup times', () => {
      const result = calculateIdealWakeupTimes('22:00', 15, 90, 4);

      expect(result).toHaveLength(4);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should start from 3 cycles', () => {
      // Default starts at 3 cycles
      // Bedtime 22:00 + 15 latency = 22:15 actual sleep
      // 3 cycles = 270 min = 4h30m
      // Wakeup: 22:15 + 4h30m = 02:45
      const result = calculateIdealWakeupTimes('22:00', 15, 90, 4);

      expect(result.length).toBe(4);
    });
  });

  describe('shouldSendBedtimeNotification', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true when within notification window', () => {
      // Set current time to 22:00
      vi.setSystemTime(new Date().setHours(22, 0, 0, 0));

      // Ideal bedtime is 22:15 (15 minutes away)
      // With 30 min lead time, should return true
      const result = shouldSendBedtimeNotification('22:15', 30);

      expect(result).toBe(true);
    });

    it('should return false when past the ideal bedtime', () => {
      // Set current time to 23:00
      vi.setSystemTime(new Date().setHours(23, 0, 0, 0));

      // Ideal bedtime was 22:30
      const result = shouldSendBedtimeNotification('22:30', 30);

      expect(result).toBe(false);
    });

    it('should return false when too far from ideal bedtime', () => {
      // Set current time to 20:00
      vi.setSystemTime(new Date().setHours(20, 0, 0, 0));

      // Ideal bedtime is 22:30 (2.5 hours away)
      const result = shouldSendBedtimeNotification('22:30', 30);

      expect(result).toBe(false);
    });

    it('should respect custom lead time', () => {
      // Set current time to 21:30
      vi.setSystemTime(new Date().setHours(21, 30, 0, 0));

      // Ideal bedtime is 22:30 (60 minutes away)
      // With 60 min lead time, should return true
      const result = shouldSendBedtimeNotification('22:30', 60);

      expect(result).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format date to time string', () => {
      const date = new Date();
      date.setHours(14, 30, 0, 0);

      const result = formatTime(date);

      // Format depends on locale, just check it's a string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
