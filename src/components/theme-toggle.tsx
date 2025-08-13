"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        setTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
      }
    }
  }, []);

  const toggle = () => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        setTheme('light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        setTheme('dark');
      }
    }
  };

  if (!mounted) return null;
  return (
    <button
      onClick={toggle}
  className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Alternar tema claro/escuro"
      type="button"
    >
      {theme === 'dark' ? (
        <Moon className="w-6 h-6 text-yellow-300" />
      ) : (
        <Sun className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
}
