// utils/roleRouter.ts
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export type UserRoleResult = {
  role?: string | null;
  error?: unknown;
};

type HandleRoleOptions = {
  router: ReturnType<typeof useRouter>;
  setError: (msg: string) => void;
  getUserRole: () => Promise<UserRoleResult>;
};

export async function handleUserRole({ router, setError, getUserRole }: HandleRoleOptions) {
  const { role, error } = await getUserRole();

  if (error || !role) {
    setError('Unable to verify user role');
    toast.error('Authorization Error', {
      description: 'Unable to verify your permissions.',
    });
    return;
  }

  const normalizedRole = role.trim().toLowerCase();

  switch (normalizedRole) {
    case 'superadmin':
      toast.success('Welcome Admin!', {
        description: 'You have successfully logged in.',
      });
      router.push('/admin/manage');
      break;
    case 'manager':
      toast.success('Welcome Manager!', {
        description: 'You have successfully logged in.',
      });
      router.push('/manager/dashboard/task-assignment');
      break;
    case 'hr':
      toast.success('Welcome HR!', {
        description: 'You have successfully logged in.',
      });
      router.push('/hr/reward-requests');
      break;
    case 'regular':
    case 'employee':
      toast.success('Welcome!', {
        description: 'You have successfully logged in.',
      });
      router.push('/employee/dashboard');
      break;
    default:
      setError('You are not authorized to access this system.');
      toast.error('Not Authorized', {
        description: `Your role (${role}) does not have access to any dashboard.`,
      });
      break;
  }
}
