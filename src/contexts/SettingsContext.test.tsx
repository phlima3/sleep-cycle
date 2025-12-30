import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider, useSettings } from './SettingsContext';

// Test component that uses the settings context
const TestComponent = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div>
      <span data-testid="cycle-length">{settings.cycleLength}</span>
      <span data-testid="sleep-latency">{settings.sleepLatency}</span>
      <span data-testid="language">{settings.language}</span>
      <span data-testid="notifications">
        {settings.notificationsEnabled ? 'enabled' : 'disabled'}
      </span>
      <button
        onClick={() => updateSettings({ cycleLength: 100 })}
        data-testid="update-cycle"
      >
        Update Cycle
      </button>
      <button
        onClick={() => updateSettings({ notificationsEnabled: true })}
        data-testid="enable-notifications"
      >
        Enable Notifications
      </button>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('SettingsProvider', () => {
    it('should provide default settings', () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      expect(screen.getByTestId('cycle-length')).toHaveTextContent('90');
      expect(screen.getByTestId('sleep-latency')).toHaveTextContent('15');
      expect(screen.getByTestId('language')).toHaveTextContent('pt-BR');
      expect(screen.getByTestId('notifications')).toHaveTextContent('disabled');
    });

    it('should load settings from localStorage', () => {
      const savedSettings = {
        cycleLength: 100,
        sleepLatency: 20,
        language: 'en',
        notificationsEnabled: true,
      };
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify(savedSettings)
      );

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      expect(screen.getByTestId('cycle-length')).toHaveTextContent('100');
      expect(screen.getByTestId('sleep-latency')).toHaveTextContent('20');
      expect(screen.getByTestId('language')).toHaveTextContent('en');
      expect(screen.getByTestId('notifications')).toHaveTextContent('enabled');
    });

    it('should update settings and save to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await user.click(screen.getByTestId('update-cycle'));

      expect(screen.getByTestId('cycle-length')).toHaveTextContent('100');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'settings',
        expect.stringContaining('"cycleLength":100')
      );
    });

    it('should update notifications setting', async () => {
      const user = userEvent.setup();

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await user.click(screen.getByTestId('enable-notifications'));

      expect(screen.getByTestId('notifications')).toHaveTextContent('enabled');
    });
  });

  describe('useSettings', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useSettings must be used within a SettingsProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
