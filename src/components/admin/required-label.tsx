/**
 * Required Field Label Component
 * ================================
 * Reusable label component for required form fields with icon and distinct styling.
 * Icon only shows when field is empty or has errors.
 */

import { AlertCircle } from 'lucide-react';

interface RequiredLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  filled?: boolean;
}

export function RequiredLabel({ htmlFor, children, filled = false }: RequiredLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-sm font-medium text-foreground"
    >
      {!filled && <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />}
      <span>{children}</span>
    </label>
  );
}
