
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeupTime: string;
  completeCycles: number;
  partialCycle: number;
  idealBedtime: string;
  idealWakeupTime: string;
}

interface SleepHistoryContextType {
  history: SleepEntry[];
  addEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  clearHistory: () => void;
}

const SleepHistoryContext = createContext<SleepHistoryContextType | undefined>(undefined);

export const SleepHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<SleepEntry[]>([]);

  useEffect(() => {
    // Load history from localStorage if available
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addEntry = (entry: Omit<SleepEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 100); // Keep the last 100 entries
    setHistory(updatedHistory);
    localStorage.setItem('sleepHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sleepHistory');
  };

  return (
    <SleepHistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </SleepHistoryContext.Provider>
  );
};

export const useSleepHistory = (): SleepHistoryContextType => {
  const context = useContext(SleepHistoryContext);
  if (context === undefined) {
    throw new Error('useSleepHistory must be used within a SleepHistoryProvider');
  }
  return context;
};
