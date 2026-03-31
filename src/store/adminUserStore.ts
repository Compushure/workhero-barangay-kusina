import { create } from 'zustand';
import type { User, AddUserInput, EditUserInput } from '@/types';

interface AdminUserState {
  users: User[];
  isOptimistic: boolean;
  snapshot: User[] | null;
  // optimistic helpers are intentionally explicit so other teams can extend without guessing behavior
  setUsers: (users: User[]) => void;
  hydrateFromServer: (users: User[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticPrependUser: (user: User) => void;
  optimisticReplaceUser: (tempId: string, user: User) => void;
  optimisticUpdateUser: (userId: string, data: EditUserInput) => void;
  optimisticDeleteUser: (userId: string) => void;
  optimisticSetProfilePicture: (userId: string, profilePictureUrl: string | null) => void;
}

function areUsersEquivalent(a: User[], b: User[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.email !== right.email ||
      left.employeeType !== right.employeeType ||
      left.employmentStatus !== right.employmentStatus ||
      left.profilePictureUrl !== right.profilePictureUrl
    ) {
      return false;
    }
  }

  return true;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  users: [],
  isOptimistic: false,
  snapshot: null,

  setUsers: (users) => set({ users }),

  hydrateFromServer: (users) => {
    // do not clobber active optimistic state; wait until commit/rollback
    if (get().isOptimistic) return;
    if (areUsersEquivalent(get().users, users)) return;
    set({ users });
  },

  startOptimistic: () => {
    if (!get().snapshot) {
      // capture snapshot once per optimistic session to support chained mutations
      set({ snapshot: get().users, isOptimistic: true });
      return;
    }

    set({ isOptimistic: true });
  },

  commit: () => set({ snapshot: null, isOptimistic: false }),

  rollback: () => {
    const snapshot = get().snapshot;

    if (!snapshot) {
      set({ isOptimistic: false });
      return;
    }

    set({ users: snapshot, snapshot: null, isOptimistic: false });
  },

  // push a temp user to the top for optimistic adds
  optimisticPrependUser: (user) =>
    set((state) => ({
      users: [user, ...state.users],
    })),

  // swap temp user with server-confirmed user by id
  optimisticReplaceUser: (tempId, user) =>
    set((state) => ({
      users: state.users.map((currentUser) => (currentUser.id === tempId ? user : currentUser)),
    })),

  // shallow-merge only provided fields during edit
  optimisticUpdateUser: (userId, data) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...(data.name && { name: data.name }),
              ...(data.employeeType &&
                data.employeeType !== 'no-change' && {
                  employeeType: data.employeeType,
                }),
              ...(data.employmentStatus &&
                data.employmentStatus !== 'no-change' && {
                  employmentStatus: data.employmentStatus,
                }),
              ...(data.contactNumber && { contactNumber: data.contactNumber }),
              ...(data.address && { address: data.address }),
              ...(data.tin && { tin: data.tin }),
              ...(data.sss && { sss: data.sss }),
              ...(data.pagibig && { pagibig: data.pagibig }),
            }
          : user
      ),
    })),

  // remove user locally while awaiting server delete
  optimisticDeleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    })),

  optimisticSetProfilePicture: (userId, profilePictureUrl) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              profilePictureUrl: profilePictureUrl ?? undefined,
            }
          : user
      ),
    })),
}));

export function buildOptimisticUser(input: AddUserInput): User {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    email: input.email,
    employeeType: input.employeeType,
    date_added: new Date(),
    createdAt: new Date(),
    companyId: input.companyId || '',
    employeeId: input.employeeId || '',
    employmentStatus: input.employmentStatus || '',
    contactNumber: input.contactNumber || '',
    address: input.address || '',
    tin: input.tin || '',
    sss: input.sss || '',
    pagibig: input.pagibig || '',
  };
}
