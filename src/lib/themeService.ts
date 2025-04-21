
import { messageBus } from './messageBus';
import { MessageTopics } from './messageTopics';
import { useEffect, useState } from 'react';

// Current theme state - initialize from localStorage
let currentTheme: 'light' | 'dark' = 
  (typeof localStorage !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark') || 'dark';

export const themeService = {
  getCurrentTheme: () => currentTheme,
  
  setTheme: (theme: 'light' | 'dark') => {
    currentTheme = theme;
    
    // Apply theme to document element for global CSS
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const previousTheme = theme === 'dark' ? 'light' : 'dark';
      
      root.classList.remove(previousTheme);
      root.classList.add(theme);
    }
    
    // Store theme preference in localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    
    messageBus.publish(MessageTopics.THEME.THEME_CHANGED, theme);
  },
  
  // Initialize theme based on system preference or stored preference
  initializeTheme: () => {
    // Check for stored preference
    if (typeof localStorage !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        themeService.setTheme(storedTheme);
        return;
      }
    }
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      themeService.setTheme('dark');
    } else {
      themeService.setTheme('light');
    }
  }
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  themeService.initializeTheme();
}

export function useThemeService() {
  const [theme, setTheme] = useState(themeService.getCurrentTheme());
  
  useEffect(() => {
    const subscription = messageBus.subscribe<'light' | 'dark'>(
      MessageTopics.THEME.THEME_CHANGED, 
      (newTheme) => {
        setTheme(newTheme);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return {
    setTheme: themeService.setTheme,
    currentTheme: theme
  };
}
