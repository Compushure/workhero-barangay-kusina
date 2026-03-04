'use client';

import { useEffect } from 'react';

export function HRThemeBodySync() {
  useEffect(() => {
    document.body.classList.add('manager-theme');

    return () => {
      document.body.classList.remove('manager-theme');
    };
  }, []);

  return null;
}
