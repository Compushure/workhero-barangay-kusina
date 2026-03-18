'use client';

import { useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { maskSensitiveId } from '@/lib/format';
import type { UserWithExtras } from '@/types';

interface GovernmentIDsProps {
  profile: UserWithExtras;
}

export function GovernmentIDs({ profile }: GovernmentIDsProps) {
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  const toggleIdVisibility = useCallback((idType: string) => {
    setVisibleIds((prev) => ({
      ...prev,
      [idType]: !prev[idType],
    }));
  }, []);

  const ids = useMemo(() => {
    return [
      { type: 'tin', label: 'TIN', value: profile.tin || null },
      { type: 'sss', label: 'SSS', value: profile.sss || null },
      { type: 'pagibig', label: 'Pag-IBIG', value: profile.pagibig || null },
    ];
  }, [profile]);

  return (
    <div>
      <div className="pt-0 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 w-full max-w-full">
        {ids.map((id) => (
          <div
            key={id.type}
            className="space-y-1.5 p-2.5 sm:p-3 rounded-lg border border-gray-200 bg-gray-50"
          >
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                {id.label}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (id.value) {
                    toggleIdVisibility(id.type);
                  }
                }}
                disabled={!id.value}
                className="h-6 w-6 p-0 text-accent hover:bg-accent/10 transition-colors duration-200 disabled:text-muted-foreground disabled:hover:bg-transparent"
                title={
                  id.value
                    ? visibleIds[id.type]
                      ? `Hide ${id.label}`
                      : `Show ${id.label}`
                    : `${id.label} not available`
                }
                aria-label={
                  id.value
                    ? visibleIds[id.type]
                      ? `Hide ${id.label}`
                      : `Show ${id.label}`
                    : `${id.label} not available`
                }
                aria-pressed={id.value ? Boolean(visibleIds[id.type]) : false}
              >
                {id.value && visibleIds[id.type] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-semibold text-title font-mono p-2 bg-white rounded-md break-all">
              {id.value ? (
                visibleIds[id.type] ? (
                  id.value
                ) : (
                  maskSensitiveId(id.value)
                )
              ) : (
                <span className="text-muted-foreground italic">N/A</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
