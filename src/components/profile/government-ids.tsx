'use client';

import { useState, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { maskSensitiveId } from '@/lib/format';
import type { UserWithExtras } from '@/types';

interface GovernmentIDsProps {
  profile: UserWithExtras;
}

export function GovernmentIDs({ profile }: GovernmentIDsProps) {
  const [showUnmaskedIds, setShowUnmaskedIds] = useState(false);

  const toggleVisibility = useCallback(() => {
    setShowUnmaskedIds(prev => !prev);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleVisibility}
          className="text-[#730202] hover:bg-[#730202]/10 transition-colors duration-200"
        >
          {showUnmaskedIds ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2 text-xs">{showUnmaskedIds ? 'Hide' : 'Show'}</span>
        </Button>
      </div>

      {!profile.tin && !profile.sss && !profile.pagibig ? (
        <p className="text-sm text-muted-foreground italic">No government IDs on file</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.tin && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">TIN</Label>
              <p className="text-base font-semibold text-[#730202] font-mono p-2 bg-white rounded-md break-all">
                {showUnmaskedIds ? profile.tin : maskSensitiveId(profile.tin)}
              </p>
            </div>
          )}
          {profile.sss && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">SSS</Label>
              <p className="text-base font-semibold text-[#730202] font-mono p-2 bg-white rounded-md break-all">
                {showUnmaskedIds ? profile.sss : maskSensitiveId(profile.sss)}
              </p>
            </div>
          )}
          {profile.pagibig && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Pag-IBIG</Label>
              <p className="text-base font-semibold text-[#730202] font-mono p-2 bg-white rounded-md break-all">
                {showUnmaskedIds ? profile.pagibig : maskSensitiveId(profile.pagibig)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
