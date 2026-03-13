import { formatNumber } from '@/lib/format';
import { Coins, AlertCircle } from 'lucide-react';

interface PointsDisplayProps {
  availablePoints: number;
  pendingPoints?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PointsDisplay({
  availablePoints,
  pendingPoints = 0,
  showIcon = true,
  size = 'md',
}: PointsDisplayProps) {
  const sizeClasses = {
    sm: {
      container: 'h-8 px-3',
      label: 'text-xs',
      value: 'text-base',
      pending: 'text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'h-9 px-4',
      label: 'text-xs',
      value: 'text-lg',
      pending: 'text-xs',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-11 px-5',
      label: 'text-sm',
      value: 'text-xl',
      pending: 'text-sm',
      icon: 'h-5 w-5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`bg-white rounded-lg shadow-md ${classes.container} border-2 border-[#690003] flex items-center gap-2`}
    >
      {showIcon && <Coins className={`${classes.icon} text-amber-500`} />}
      <span className={`${classes.label} text-[#7a3d3d] font-medium whitespace-nowrap`}>
        Available Points
      </span>
      <span className={`${classes.value} font-bold text-[#690003]`}>
        {formatNumber(availablePoints)}
      </span>
      {pendingPoints > 0 && (
        <>
          <AlertCircle className={`${classes.icon} text-orange-600`} />
          <span className={`${classes.pending} text-orange-600 whitespace-nowrap`}>
            Pending: {formatNumber(pendingPoints)}
          </span>
        </>
      )}
    </div>
  );
}
