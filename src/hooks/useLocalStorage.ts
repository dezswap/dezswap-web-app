import { useEffect, useMemo, useState } from "react";

const useLocalStorage = <T = string>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item;
    } catch {
      return null;
    }
  });

  const value = useMemo<T>(() => {
    try {
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch {
      return storedValue;
    }
  }, [initialValue, storedValue]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = (newValue) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setStoredValue(JSON.stringify(valueToStore));
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // ignore write errors
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item);
      } catch {
        setStoredValue(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialValue, key]);

  return [value, setValue] as const;
};

export default useLocalStorage;
