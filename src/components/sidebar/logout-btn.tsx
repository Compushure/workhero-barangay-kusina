'use client';


import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {handleSignOut} from '@/action-handlers/auth';
import { toast } from 'sonner';

export function LogOutBtn() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
const handleLogout = () => {
    startTransition(async () => {
      const { error } = await handleSignOut();
      if (!error) {
        router.push('/auth/login');

        toast.success('Logged out', {
          description: 'You have successfully logged out.',
        });
      } else{
        toast.error('Logout failed', {
          description: error,
        }); 
        router.push('/auth/login');
      }
    });
  };
  

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="w-full cursor-pointer bg-white text-[#690003] py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm"
    >
      Logout
    </button>
  );
}
