import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SleepHistoryProvider, useSleepHistory } from './SleepHistoryContext';

// Test component that uses the sleep history context
const TestComponent = () => {
  const { history, addEntry, clearHistory } = useSleepHistory();

  return (
    <div>
      <span data-testid="history-count">{history.length}</span>
      <ul data-testid="history-list">
        {history.map((entry) => (
          <li key={entry.id} data-testid={`entry-${entry.id}`}>
            {entry.bedtime} - {entry.wakeupTime}
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          addEntry({
            date: '2024-01-15',
            bedtime: '22:00',
            wakeupTime: '06:00',
            completeCycles: 5,
            partialCycle: 0.3,
            idealBedtime: '21:45',
            idealWakeupTime: '05:45',
          })
        }
        data-testid="add-entry"
      >
        Add Entry
      </button>
      <button onClick={clearHistory} data-testid="clear-history">
        Clear History
      </button>
    </div>
  );
};

describe('SleepHistoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('SleepHistoryProvider', () => {
    it('should provide empty history by default', () => {
      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    });

    it('should load history from localStorage', () => {
      const savedHistory = [
        {
          id: '1',
          date: '2024-01-14',
          bedtime: '23:00',
          wakeupTime: '07:00',
          completeCycles: 5,
          partialCycle: 0.2,
          idealBedtime: '22:45',
          idealWakeupTime: '06:45',
        },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(savedHistory)
      );

      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    });

    it('should add new entry to history', async () => {
      const user = userEvent.setup();

      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      expect(screen.getByTestId('history-count')).toHaveTextContent('0');

      await user.click(screen.getByTestId('add-entry'));

      expect(screen.getByTestId('history-count')).toHaveTextContent('1');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'sleepHistory',
        expect.stringContaining('"bedtime":"22:00"')
      );
    });

    it('should add entries to the beginning of history (newest first)', async () => {
      const user = userEvent.setup();
      const existingHistory = [
        {
          id: 'old',
          date: '2024-01-14',
          bedtime: '23:00',
          wakeupTime: '07:00',
          completeCycles: 4,
          partialCycle: 0.5,
          idealBedtime: '22:30',
          idealWakeupTime: '06:30',
        },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(existingHistory)
      );

      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      await user.click(screen.getByTestId('add-entry'));

      // Check that setItem was called with the new entry first
      const setItemCalls = (localStorage.setItem as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedHistory = JSON.parse(lastCall[1]);

      // New entry should be first
      expect(savedHistory[0].bedtime).toBe('22:00');
    });

    it('should clear history', async () => {
      const user = userEvent.setup();
      const savedHistory = [
        {
          id: '1',
          date: '2024-01-14',
          bedtime: '23:00',
          wakeupTime: '07:00',
          completeCycles: 5,
          partialCycle: 0,
          idealBedtime: '22:45',
          idealWakeupTime: '06:45',
        },
      ];
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(savedHistory)
      );

      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      expect(screen.getByTestId('history-count')).toHaveTextContent('1');

      await user.click(screen.getByTestId('clear-history'));

      expect(screen.getByTestId('history-count')).toHaveTextContent('0');
      expect(localStorage.removeItem).toHaveBeenCalledWith('sleepHistory');
    });

    it('should limit history to 100 entries', async () => {
      const user = userEvent.setup();

      // Create 100 existing entries
      const existingHistory = Array.from({ length: 100 }, (_, i) => ({
        id: `entry-${i}`,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        bedtime: '22:00',
        wakeupTime: '06:00',
        completeCycles: 5,
        partialCycle: 0,
        idealBedtime: '21:45',
        idealWakeupTime: '05:45',
      }));

      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(existingHistory)
      );

      render(
        <SleepHistoryProvider>
          <TestComponent />
        </SleepHistoryProvider>
      );

      await user.click(screen.getByTestId('add-entry'));

      // Should still be 100 entries (oldest one removed)
      const setItemCalls = (localStorage.setItem as ReturnType<typeof vi.fn>).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedHistory = JSON.parse(lastCall[1]);

      expect(savedHistory.length).toBe(100);
    });
  });

  describe('useSleepHistory', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useSleepHistory must be used within a SleepHistoryProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
