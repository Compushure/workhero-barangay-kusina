'use client';

import { useEffect } from 'react';

export function EmployeeTypographyScope() {
  useEffect(() => {
    document.body.classList.add('employee-font-scope');
    return () => {
      document.body.classList.remove('employee-font-scope');
    };
  }, []);

  return null;
}
