import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialen Wert aus LocalStorage holen oder Default nehmen
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("LocalStorage Error:", error);
      return initialValue;
    }
  });

  // Jedes Mal, wenn sich der State ändert, in LocalStorage schreiben
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("LocalStorage Save Error:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}