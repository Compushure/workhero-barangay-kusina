'use client';

import { useState, useTransition, lazy, Suspense, useCallback, useEffect } from 'react';
import { useGetUsersPaginated } from '@/hooks/tanstack/queries/userQueries';
import {
  useAddUser,
  useEditUser,
  useDeleteUser,
  useUploadProfilePicture,
  useDeleteProfilePicture,
} from '@/hooks/tanstack/mutations/userMutations';
import { useDebounce } from '@/hooks/useDebounce';
import type {
  User,
  AddUserInput,
  EditUserInput,
  EmployeeTypeValue,
  EmploymentStatusValue,
} from '@/types';
import { Button } from '@/components/ui/button';
import { UserCard } from './user-card';
import { SearchFilter, SearchFilterSkeleton } from './user-filter';
// Lazy load modals for better performance
const AddUserModal = lazy(() =>
  import('./modals/add-user-modal').then((mod) => ({ default: mod.AddUserModal }))
);
const EditUserModal = lazy(() =>
  import('./modals/edit-user-modal').then((mod) => ({ default: mod.EditUserModal }))
);
const DeleteUserModal = lazy(() =>
  import('./modals/delete-user-modal').then((mod) => ({ default: mod.DeleteUserModal }))
);
import { Pagination } from '@/components/shared/pagination';
import { UserPlus, LogOut } from 'lucide-react';
import { handleSignOut } from '@/action-handlers/shared/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { useAdminUserStore } from '@/store/adminUserStore';

const EMPTY_PAGINATED_USERS = { data: [] as User[], count: 0, totalPages: 0 };

export function ManagerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local UI state - search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<'all' | EmployeeTypeValue>('all');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState<
    'all' | EmploymentStatusValue
  >('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'>(
    'date-desc'
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  // Debounce search query to prevent excessive API calls (1500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 1500);
  const isDebouncing = searchQuery !== debouncedSearchQuery;

  // TanStack Query hook with debounced parameters and pagination
  const {
    data: paginatedData,
    isLoading,
    error,
  } = useGetUsersPaginated(
    {
      searchQuery: debouncedSearchQuery,
      employeeTypeFilter,
      employmentStatusFilter,
      sortBy,
      pageSize,
    },
    page
  );

  const { users: localUsers, hydrateFromServer } = useAdminUserStore();
  const resolvedPaginatedData = paginatedData ?? EMPTY_PAGINATED_USERS;

  useEffect(() => {
    if (!paginatedData) return;
    hydrateFromServer(paginatedData.data);
  }, [paginatedData, hydrateFromServer]);

  const users = localUsers;
  const totalPages = resolvedPaginatedData.totalPages;

  // TanStack Query mutation hooks
  const addUserMutation = useAddUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();
  const uploadProfilePictureMutation = useUploadProfilePicture();
  const deleteProfilePictureMutation = useDeleteProfilePicture();

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const onHandleProfilePictureUpload = useCallback(
    async (userid: string, file: File, username: string): Promise<void> => {
      const currentUser = users.find((u) => u.id === userid);
      if (!currentUser) return;
      return new Promise((resolve) => {
        uploadProfilePictureMutation.mutate(
          { file, userid, username },
          {
            onSuccess: () => {
              window.dispatchEvent(
                new CustomEvent('profile-image-updated', {
                  detail: { userId: userid, timestamp: Date.now() },
                })
              );
              resolve();
            },
            onError: () => {
              resolve();
            },
          }
        );
      });
    },
    [users, uploadProfilePictureMutation]
  );

  const onHandleProfilePictureClear = useCallback(
    async (userid: string, username: string): Promise<void> => {
      return new Promise((resolve) => {
        deleteProfilePictureMutation.mutate(
          { userId: userid, userName: username },
          {
            onSuccess: () => {
              window.dispatchEvent(
                new CustomEvent('profile-image-updated', {
                  detail: { userId: userid, timestamp: Date.now() },
                })
              );
              resolve();
            },
            onError: () => {
              resolve();
            },
          }
        );
      });
    },
    [deleteProfilePictureMutation]
  );

  // CRUD handlers using TanStack Query mutations
  const onAddUser = useCallback(
    async (data: AddUserInput): Promise<void> => {
      return new Promise((resolve, reject) => {
        addUserMutation.mutate(data, {
          onSuccess: async (newUser) => {
            console.log('User created:', newUser?.id, newUser?.name);
            // Profile picture can be added later by editing the user
            setAddModalOpen(false);
            resolve();
          },
          onError: (error) => {
            console.error('User creation error:', error);
            reject(error);
          },
        });
      });
    },
    [addUserMutation]
  );

  const onEditUser = useCallback(
    async (userId: string, data: EditUserInput): Promise<boolean> => {
      const currentUser = users.find((u) => u.id === userId);
      if (!currentUser) return false;

      return new Promise((resolve) => {
        editUserMutation.mutate(
          { userId, data, userName: currentUser.name },
          {
            onSuccess: () => {
              setEditModalOpen(false);
              resolve(true);
            },
            onError: () => {
              resolve(false);
            },
          }
        );
      });
    },
    [users, editUserMutation]
  );

  const onDeleteUser = useCallback(async (): Promise<boolean> => {
    if (!selectedUser) return false;

    return new Promise((resolve) => {
      deleteUserMutation.mutate(
        { userId: selectedUser.id, userName: selectedUser.name },
        {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setSelectedUser(null);
            resolve(true);
          },
          onError: () => {
            resolve(false);
          },
        }
      );
    });
  }, [selectedUser, deleteUserMutation]);

  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  }, []);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(sanitizeSearchInput(query));
    setPage(1);
  }, []);

  const handleEmployeeTypeFilterChange = useCallback((value: string) => {
    setEmployeeTypeFilter(value as EmployeeTypeValue);
    setPage(1);
  }, []);

  const handleEmploymentStatusFilterChange = useCallback((value: string) => {
    setEmploymentStatusFilter(value as EmploymentStatusValue);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc');
    setPage(1);
  }, []);

  const handleLogout = useCallback(() => {
    startTransition(async () => {
      const { error } = await handleSignOut();
      if (!error) {
        router.push('/auth/adminlogin');

        toast.success('Logged out', {
          description: 'You have successfully logged out.',
        });
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary-gradient shadow-sm/25">
        <div className="max-w-6xl lg:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2.5 sm:py-3 md:py-4 lg:py-5">
          {isLoading ? (
            <div className="animate-pulse flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
              <div className="space-y-2">
                <div className="h-6 sm:h-7 lg:h-8 bg-background rounded w-40 sm:w-52" />
                <div className="h-4 sm:h-5 bg-background rounded w-32 sm:w-44" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                <div className="h-9 sm:h-10 bg-background rounded-xl w-24 sm:w-28 md:w-32" />
                <div className="h-9 sm:h-10 bg-background rounded-xl w-24 sm:w-28 md:w-32" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                    User Management
                  </h1>
                  <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-meta text-white/70">
                    {users.length} total users on page {page}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                <Button
                  variant="default"
                  onClick={() => setAddModalOpen(true)}
                  className="gap-0 md:gap-2 bg-background text-foreground border-accent cursor-pointer hover:bg-accent-secondary hover:text-white transition-all duration-500 ease-in-out shadow-sm/25 px-2 sm:px-3 md:px-4 h-9 sm:h-10"
                  aria-label="Add User"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden md:inline">Add User</span>
                </Button>
                <Button
                  variant="default"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="gap-0 md:gap-2 bg-background text-foreground border-accent cursor-pointer hover:bg-accent-secondary hover:text-white transition-all duration-500 ease-in-out shadow-sm/25 px-2 sm:px-3 md:px-4 h-9 sm:h-10"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl lg:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2.5 sm:py-3 md:py-4 lg:py-5 space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-5 overflow-x-hidden">
        {isLoading ? (
          <SearchFilterSkeleton />
        ) : (
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            employeeTypeFilter={employeeTypeFilter}
            onEmployeeTypeChange={handleEmployeeTypeFilterChange}
            employmentStatusFilter={employmentStatusFilter}
            onEmploymentStatusChange={handleEmploymentStatusFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            isDebouncing={isDebouncing}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Content */}
      <main className="max-w-6xl lg:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-6 lg:pb-8 flex flex-col min-h-[calc(100vh-300px)] overflow-x-hidden">
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 lg:gap-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-background p-3 sm:p-4 lg:p-6 xl:p-7 border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25 animate-pulse"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex-1 min-w-0 space-y-2 sm:space-y-3 lg:space-y-4">
                    <div className="h-3.5 sm:h-4 lg:h-5 bg-background rounded w-1/2 sm:w-2/5" />
                    <div className="h-3.5 sm:h-4 lg:h-5 bg-background rounded w-4/5 sm:w-3/5" />
                    <div className="flex gap-1.5 sm:gap-2 lg:gap-3 pt-1 sm:pt-2">
                      <div className="h-5 sm:h-6 lg:h-7 bg-background rounded-full w-16 sm:w-20 lg:w-24" />
                      <div className="h-5 sm:h-6 lg:h-7 bg-background rounded-full w-20 sm:w-24 lg:w-28" />
                    </div>
                  </div>
                  <div className="h-7 sm:h-8 lg:h-10 bg-background rounded-full w-7 sm:w-8 lg:w-10 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-background p-6 sm:p-8 lg:p-12 text-center border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25">
            <p className="text-destructive mb-4 font-semibold">Failed to load users</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl bg-background p-6 sm:p-8 lg:p-12 text-center border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-foreground" />
            </div>
            <p className="text-foreground mb-2 font-semibold">No users found</p>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery || employeeTypeFilter !== 'all' || employmentStatusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first user to get started'}
            </p>
            {!searchQuery && employeeTypeFilter === 'all' && employmentStatusFilter === 'all' && (
              <Button
                onClick={() => setAddModalOpen(true)}
                className="bg-foreground hover:bg-foreground/90 text-white transition-all duration-500 ease-in-out shadow-sm/25"
              >
                Add User
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onHandleProfilePictureUpload={onHandleProfilePictureUpload}
                />
              ))}
            </div>
            {/* Pagination fixed at bottom */}
            <div className="mt-auto pt-3 sm:pt-4">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {addModalOpen && (
        <Suspense fallback={<div className="hidden" />}>
          <AddUserModal open={addModalOpen} onOpenChange={setAddModalOpen} onAddUser={onAddUser} />
        </Suspense>
      )}

      {selectedUser && (
        <>
          {editModalOpen && (
            <Suspense fallback={<div className="hidden" />}>
              <EditUserModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                user={selectedUser}
                onEditUser={onEditUser}
                onImageUpload={onHandleProfilePictureUpload}
                onImageClear={onHandleProfilePictureClear}
              />
            </Suspense>
          )}

          {deleteModalOpen && (
            <Suspense fallback={<div className="hidden" />}>
              <DeleteUserModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                userName={selectedUser.name}
                onConfirm={onDeleteUser}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
