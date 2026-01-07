'use client';

import { useState, useTransition } from 'react';
import { useGetUsers } from '@/hooks/tanstack/queries/userQueries';
import {
  useAddUser,
  useEditUser,
  useDeleteUser,
  useUploadProfilePicture,
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
import { Card } from '@/components/ui/card';
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
import { AddUserModal } from './modals/add-user-modal';
import { EditUserModal } from './modals/edit-user-modal';
import { DeleteUserModal } from './modals/delete-user-modal';
import { UserPlus, LogOut, ArrowLeft, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
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
  const [pageSize, setPageSize] = useState(25);

  // Debounce search query to prevent excessive API calls (1500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 1500);

  // TanStack Query hook with debounced parameters
  const {
    data: users = [],
    isLoading,
    error,
  } = useGetUsers({
    searchQuery: debouncedSearchQuery,
    employeeTypeFilter,
    employmentStatusFilter,
    sortBy,
    page,
    pageSize,
  });

  // TanStack Query mutation hooks
  const addUserMutation = useAddUser();
  const editUserMutation = useEditUser();
  const deleteUserMutation = useDeleteUser();
  const uploadProfilePictureMutation = useUploadProfilePicture();

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const onHandleProfilePictureUpload = async (
    userid: string,
    file: File,
    username: string
  ): Promise<boolean> => {
    const currentUser = users.find((u) => u.id === userid);
    if (!currentUser) return false;
    return new Promise((resolve) => {
      uploadProfilePictureMutation.mutate(
        { file, userid, username },
        {
          onSuccess: () => {
            // toast.success('Profile picture updated', {
            //   description: `${username}'s profile picture has been uploaded successfully.`,
            // });
            resolve(true);
          },
          onError: () => {
            // toast.error('Failed to upload profile picture', {
            //   description: 'Please try again. If the issue persists, contact support.',
            // });
            resolve(false);
          },
        }
      );
    });
  };

  // CRUD handlers using TanStack Query mutations
  const onAddUser = async (data: AddUserInput): Promise<void> => {
    addUserMutation.mutate(data, {
      onSuccess: () => {
        setAddModalOpen(false);
      },
    });
  };

  const onEditUser = async (userId: string, data: EditUserInput): Promise<boolean> => {
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
  };

  const onDeleteUser = async (): Promise<boolean> => {
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
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset pagination when searching
  };

  const handleEmployeeTypeFilterChange = (value: string) => {
    setEmployeeTypeFilter(value as any);
    setPage(1);
  };

  const handleEmploymentStatusFilterChange = (value: string) => {
    setEmploymentStatusFilter(value as any);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
    setPage(1);
  };

  const handleLogout = () => {
    startTransition(async () => {
      const { error } = await handleSignOut();
      if (!error) {
        router.push('/admin');

        toast.success('Logged out', {
          description: 'You have successfully logged out.',
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
                <p className="text-sm text-muted-foreground">{users.length} total users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setAddModalOpen(true)} className="gap-2 flex-1 sm:flex-none">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isPending}
                className="gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <Card className="p-4">
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
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Employee Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-type">Employee Type</Label>
              <Select value={employeeTypeFilter} onValueChange={handleEmployeeTypeFilterChange}>
                <SelectTrigger id="filter-type">
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
              <Label htmlFor="filter-status">Employment Status</Label>
              <Select
                value={employmentStatusFilter}
                onValueChange={handleEmploymentStatusFilterChange}
              >
                <SelectTrigger id="filter-status">
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
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger id="sort">
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
        </Card>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="p-8 sm:p-12 text-center">
            <p className="text-destructive mb-4">Failed to load users</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </Card>
        ) : users.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
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
          </Card>
        ) : (
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
        )}
      </main>

      {/* Modals */}
      <AddUserModal open={addModalOpen} onOpenChange={setAddModalOpen} onAddUser={onAddUser} />

      {selectedUser && (
        <>
          <EditUserModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            user={selectedUser}
            onEditUser={onEditUser}
          />

          <DeleteUserModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            userName={selectedUser.name}
            onConfirm={onDeleteUser}
          />
        </>
      )}
    </div>
  );
}
