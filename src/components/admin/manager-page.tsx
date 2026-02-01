'use client';

import { useState, useTransition, lazy, Suspense, useCallback } from 'react';
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
import { WhiteCard } from '@/components/ui/white-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCard } from './user-card';
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
import { Pagination } from '@/components/manager/task-verification/pagination';
import { UserPlus, LogOut, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { handleSignOut } from '@/action-handlers/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
    data: paginatedData = { data: [], count: 0, totalPages: 0 },
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

  const users = paginatedData.data;
  const totalPages = paginatedData.totalPages;

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
    setSearchQuery(query);
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
    <div className="min-h-screen bg-[#f1f1f1]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                  User Management
                </h1>
                <p className="text-sm text-primary-foreground/70">
                  {users.length} total users on page {page}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setAddModalOpen(true)}
                className="gap-2 border-border bg-secondary text-red-foreground cursor-pointer hover:bg-primary/20 hover:text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isPending}
                className="gap-2 border-border bg-secondary text-red-foreground cursor-pointer hover:bg-primary/20 hover:text-primary-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <WhiteCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Search & Filters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  className={`pl-10 pr-9 ${isDebouncing ? 'bg-muted/50' : ''}`}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  {isDebouncing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                </div>
              </div>
            </div>

            {/* Employee Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-type" className="flex items-center gap-2">
                Employee Type
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select 
                value={employeeTypeFilter} 
                onValueChange={handleEmployeeTypeFilterChange}
                disabled={isLoading}
              >
                <SelectTrigger id="filter-type" className={isLoading ? 'opacity-60 cursor-not-allowed' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="regular">Regular Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employment Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-status" className="flex items-center gap-2">
                Employment Status
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select
                value={employmentStatusFilter}
                onValueChange={handleEmploymentStatusFilterChange}
                disabled={isLoading}
              >
                <SelectTrigger id="filter-status" className={isLoading ? 'opacity-60 cursor-not-allowed' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="probational">Probational</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="sort" className="flex items-center gap-2">
                Sort By
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </Label>
              <Select value={sortBy} onValueChange={handleSortChange} disabled={isLoading}>
                <SelectTrigger id="sort" className={isLoading ? 'opacity-60 cursor-not-allowed' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                  <SelectItem value="date-asc">Date Created (Oldest First)</SelectItem>
                  <SelectItem value="date-desc">Date Created (Newest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </WhiteCard>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 flex flex-col min-h-[calc(100vh-300px)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <WhiteCard className="p-8 sm:p-12 text-center">
            <p className="text-destructive mb-4">Failed to load users</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </WhiteCard>
        ) : isLoading ? (
          <WhiteCard className="p-4">
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading users...</span>
            </div>
          </WhiteCard>
        ) : users.length === 0 ? (
          <WhiteCard className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No users found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || employeeTypeFilter !== 'all' || employmentStatusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first user to get started'}
            </p>
            {!searchQuery && employeeTypeFilter === 'all' && employmentStatusFilter === 'all' && (
              <Button onClick={() => setAddModalOpen(true)}>Add User</Button>
            )}
          </WhiteCard>
        ) : (
          <>
            <div className="grid gap-4">
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
            <div className="mt-auto pt-4">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {addModalOpen && (
        <Suspense fallback={<div className="hidden" />}>
          <AddUserModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            onAddUser={onAddUser}
          />
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
