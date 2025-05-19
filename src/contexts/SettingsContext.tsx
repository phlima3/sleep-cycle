
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

interface Settings {
  cycleLength: number;
  sleepLatency: number;
  language: string;
  notificationsEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  cycleLength: 90, // in minutes
  sleepLatency: 15, // in minutes
  language: 'pt-BR', // Default language is Portuguese (Brazil)
  notificationsEnabled: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Update i18n language whenever settings language changes
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
      localStorage.setItem('language', settings.language);
    }
  }, [settings.language]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
