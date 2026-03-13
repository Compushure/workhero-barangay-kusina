'use client';

import React from 'react';

import { useState } from 'react';
import { Plus, Search, ArrowUpDown, Coins, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEditBadgeDialog, { type BadgeFormData } from './dialogs/add-edit-badge-dialog';
import BadgeTable from './badge-table';
import { BadgeFilterToggle, type BadgeFilterMode } from './badge-filter-toggle';
import { useDebounce } from '../../../hooks/useDebounce';
import { Pagination } from '../task-verification/pagination';
import type { Badge } from '@/types/manager/badge-editor';
import { BadgeEditorHeaderSkeleton } from './badge-editor-header-skeleton';
import {
  useAddBadge,
  useDeleteBadgeImage,
  useDeleteBadge,
  useEditBadge,
  useGetBadgeAttendanceOptions,
  useGetBadgeAttributeOptions,
  useGetBadgeTaskOptions,
  useGetBadges,
  useUploadBadgeImage,
} from '@/hooks/tanstack';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { PageHeader } from '../task-verification/page-header';

type BadgeSortOption = 'name-asc' | 'points-desc' | 'created-desc' | 'created-asc';

const SORT_OPTIONS: { value: BadgeSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'points-desc', label: 'Points (High to Low)' },
  { value: 'created-desc', label: 'Recently Created' },
  { value: 'created-asc', label: 'Oldest Created' },
];

export function BadgeEditorPage() {
  const { data: badges = [], isLoading, isFetching, isError } = useGetBadges();
  const { data: taskOptions = [] } = useGetBadgeTaskOptions();
  const { data: attributeOptions = [] } = useGetBadgeAttributeOptions();
  const { data: attendanceOptions = [] } = useGetBadgeAttendanceOptions();
  const addBadge = useAddBadge();
  const editBadge = useEditBadge();
  const deleteBadge = useDeleteBadge();
  const uploadBadgeImage = useUploadBadgeImage();
  const deleteBadgeImage = useDeleteBadgeImage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<BadgeSortOption>('name-asc');
  const [filterMode, setFilterMode] = useState<BadgeFilterMode>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // Mock data filtering and sorting
  let filteredBadges = badges.filter((badge) => {
    const searchLower = normalizeSearchQuery(debouncedSearchTerm);
    if (!searchLower) return true;
    return (
      badge.name.toLowerCase().includes(searchLower) ||
      badge.description?.toLowerCase().includes(searchLower)
    );
  });

  if (filterMode === 'manual') {
    filteredBadges = filteredBadges.filter((badge) => badge.conditions.length === 0);
  }

  if (filterMode === 'conditional') {
    filteredBadges = filteredBadges.filter((badge) => badge.conditions.length > 0);
  }

  // Apply sorting
  filteredBadges = [...filteredBadges].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'points-desc':
        return b.points - a.points;
      case 'created-desc': {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (!aTime && !bTime) return a.name.localeCompare(b.name);
        return bTime - aTime;
      }
      case 'created-asc': {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (!aTime && !bTime) return a.name.localeCompare(b.name);
        return aTime - bTime;
      }
      default:
        return 0;
    }
  });

  // Mock pagination
  const totalCount = filteredBadges.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedBadges = filteredBadges.slice((page - 1) * pageSize, page * pageSize);

  // Extract existing badge names for duplicate checking
  const existingNames = badges.map((b) => b.name);

  const handleOpenAddDialog = () => {
    setEditingBadge(null);
    setSaveError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (badge: Badge) => {
    setEditingBadge(badge);
    setSaveError('');
    setDialogOpen(true);
  };

  const handleSave = async (data: BadgeFormData) => {
    try {
      setSaveError('');

      const hasImageChange = !!data.imageFile || !!data.clearImage;

      const badgePayload = {
        name: data.name,
        description: data.description,
        points: data.points,
        award_at_interval: data.award_at_interval,
        img_link: data.img_link,
        conditions: data.conditions,
      };

      if (editingBadge) {
        const result = await editBadge.mutateAsync({
          id: editingBadge.id,
          input: badgePayload,
          suppressToast: hasImageChange,
        });
        if (!result) {
          const message = 'Failed to update badge';
          setSaveError(message);
          throw new Error(message);
        }

        if (data.clearImage) {
          const cleared = await deleteBadgeImage.mutateAsync(editingBadge.id);
          if (!cleared) {
            const message = 'Failed to remove badge image';
            setSaveError(message);
            throw new Error(message);
          }
        }

        if (data.imageFile) {
          const uploadedUrl = await uploadBadgeImage.mutateAsync({
            badgeId: editingBadge.id,
            file: data.imageFile,
          });
          if (!uploadedUrl) {
            const message = 'Failed to upload badge image';
            setSaveError(message);
            throw new Error(message);
          }
        }
      } else {
        const result = await addBadge.mutateAsync(badgePayload);
        if (!result) {
          const message = 'Failed to add badge';
          setSaveError(message);
          throw new Error(message);
        }

        if (data.imageFile) {
          const uploadedUrl = await uploadBadgeImage.mutateAsync({
            badgeId: result.id,
            file: data.imageFile,
          });
          if (!uploadedUrl) {
            const message = 'Failed to upload badge image';
            setSaveError(message);
            throw new Error(message);
          }
        }
      }

      // Close dialog on success
      setDialogOpen(false);
      setEditingBadge(null);
      setPage(1); // Reset to first page after saving
    } catch (error) {
      console.error('Error saving badge:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save badge');
      throw error;
    }
  };

  const handleDelete = async (badgeId: string) => {
    try {
      const result = await deleteBadge.mutateAsync(badgeId);
      if (result) {
        setPage(1); // Reset to first page after deletion
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const handleErrorClear = () => {
    setSaveError('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(sanitizeSearchInput(e.target.value));
    setPage(1);
  };

  const handleSortChange = (value: BadgeSortOption) => {
    setSortOption(value);
    setPage(1);
  };

  const handleFilterChange = (value: BadgeFilterMode) => {
    setFilterMode(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Name (A-Z)';

  return (
    <main className="w-full min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl space-y-5 sm:space-y-4 lg:space-y-6">
        {isLoading ? (
          <BadgeEditorHeaderSkeleton />
        ) : (
          <>
            <PageHeader
              title="Badge Editor"
              subtitle="Create, edit, and manage badges with conditions."
            />

            <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* Badge Count Display */}
              <div className="flex shrink-0 self-start gap-2 whitespace-nowrap pl-0.5 text-h2 text-foreground sm:gap-3 sm:pl-1">
                <h5 className="flex items-center gap-1.5">
                  <Coins size={16} className="text-accent" />
                  Badges
                  <span className="bg-accent/75 text-primary-foreground px-2 py-0.5 rounded-md text-[13px] ml-0.5 shadow-sm/25">
                    {totalCount ?? 0}
                  </span>
                </h5>
              </div>

              {/* Search, Sort, and Add Button */}
              <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                {/* Search Input */}
                <div className="relative min-w-0 flex-1 xl:max-w-md">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search badges"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="text-meta control-h w-full min-w-0 rounded-md border border-zinc-200 bg-card pr-3 pl-9 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end">
                  <div className="shrink-0">
                    <BadgeFilterToggle
                      filterMode={filterMode}
                      onFilterChange={handleFilterChange}
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="default"
                        className="text-button control-h w-full justify-between border border-gray-200 bg-card py-1.5 text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-44"
                      >
                        <span className="truncate">{currentSortLabel}</span>
                        <ArrowUpDown size={14} className="text-accent" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="manager-dropdown-content w-56">
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                            sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                          }`}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Add New Badge Button */}
                  <Button
                    onClick={handleOpenAddDialog}
                    className="text-button control-h w-full justify-center rounded-md bg-primary-gradient px-3 py-1.5 whitespace-nowrap text-card shadow-sm/25 transition-all duration-500 ease-in-out cursor-pointer hover:bg-primary-gradient hover:brightness-85 sm:w-auto sm:px-4"
                  >
                    <Coins size={14} />
                    <span>Add New Badge</span>
                    <Plus size={14} className="ml-1 sm:ml-3" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}

        <BadgeTable
          badges={paginatedBadges}
          isLoading={isLoading || isFetching}
          isError={isError}
          onEdit={handleOpenEditDialog}
          onDelete={handleDelete}
          taskOptions={taskOptions}
          attributeOptions={attributeOptions}
          attendanceOptions={attendanceOptions}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="my-6">
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <AddEditBadgeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingBadge={editingBadge}
          onSave={handleSave}
          saveError={saveError}
          onErrorClear={handleErrorClear}
          existingNames={existingNames}
          taskOptions={taskOptions}
          attributeOptions={attributeOptions}
          attendanceOptions={attendanceOptions}
        />
      </div>
    </main>
  );
}
