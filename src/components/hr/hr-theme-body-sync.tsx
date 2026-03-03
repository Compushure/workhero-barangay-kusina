'use client';

import { useEffect } from 'react';

export function HRThemeBodySync() {
  useEffect(() => {
    document.body.classList.add('hr-theme');

    return () => {
      document.body.classList.remove('hr-theme');
    };
  }, []);

  return null;
}
