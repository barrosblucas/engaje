'use client';

import { Button } from '@/components/ui/button';
import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'engaje-theme';

function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme = stored === 'dark' || stored === 'light' ? stored : getSystemTheme();

    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  if (!mounted) {
    return <span className="h-10 w-10" aria-hidden="true" />;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      onClick={toggleTheme}
      className="h-10 w-10 rounded-xl p-0"
    >
      {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </Button>
  );
}
