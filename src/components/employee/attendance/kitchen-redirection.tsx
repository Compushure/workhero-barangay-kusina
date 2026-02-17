'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DashboardRedirectButtonProps {
  attendanceStatus: string;
}

export default function DashboardRedirectButton({ attendanceStatus }: DashboardRedirectButtonProps) {
  const router = useRouter();

  if (attendanceStatus !== 'timein') return null;

  return (
    <motion.button
      className="mt-6 game-btn flex items-center gap-2"
      onClick={() => router.push('/dashboard')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      🥄  Go to Dashboard
    </motion.button>
  );
}
