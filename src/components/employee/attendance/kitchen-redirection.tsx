'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface KitchenRedirectButtonProps {
  status: {
    hasTimedIn?: boolean;
    isOnBreak?: boolean;
    hasTimedOut?: boolean;
  };
}

export default function KitchenRedirectButton({ status }: KitchenRedirectButtonProps) {
  const router = useRouter();

  // Show only if timed in, not on break, and not timed out
  const shouldShow =
    status?.hasTimedIn && !status?.isOnBreak && !status?.hasTimedOut;

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Button
        onClick={() => router.push('/employee/dashboard')}
        className="w-72 text-3xl font-jersey flex items-center justify-center cursor-pointer gap-3 px-6 py-5 mt-3
                   border-3 border-[#47331F] bg-[#D18C23] text-black
                   shadow-[4px_4px_0px_#000] shadow-[#3017008e] hover:bg-[#D18C23] hover:translate-y-1 hover:shadow-[2px_2px_0px_#000]
                   transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="font-jersey text-xl">🥄 Head to the Kitchen</span>
      </Button>
    </motion.div>
  );
}
