"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";

type Settings = {
  reducedMotion: boolean;
  highContrast: boolean;
  sound: boolean;
};

type Ctx = Settings & {
  set: (key: keyof Settings, value: boolean) => void;
  reset: () => void;
};

const defaults: Settings = {
  reducedMotion: false,
  highContrast: false,
  sound: false,
};
const Context = createContext<Ctx | null>(null);

export function useSettings() {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);
  const systemReduced = useReducedMotion();
  const reducedMotion = s.reducedMotion || !!systemReduced;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hasif:settings");
      if (raw) setS({ ...defaults, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("hasif:settings", JSON.stringify(s));
    } catch {}
    document.documentElement.classList.toggle("high-contrast", s.highContrast);
    document.documentElement.dataset.reducedMotion = reducedMotion
      ? "true"
      : "false";
  }, [s, loaded, reducedMotion]);

  const set = useCallback((key: keyof Settings, value: boolean) => {
    setS((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setS(defaults), []);

  return (
    <Context.Provider value={{ ...s, reducedMotion, set, reset }}>
      <MotionConfig
        reducedMotion={reducedMotion ? "always" : "never"}
      >
        {children}
      </MotionConfig>
    </Context.Provider>
  );
}
