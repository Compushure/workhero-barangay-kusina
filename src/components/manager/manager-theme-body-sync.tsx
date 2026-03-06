'use client';

import { useEffect } from 'react';

export function ManagerThemeBodySync() {
  useEffect(() => {
    document.body.classList.add('manager-theme');

    return () => {
      document.body.classList.remove('manager-theme');
    };
  }, []);

  return null;
}
