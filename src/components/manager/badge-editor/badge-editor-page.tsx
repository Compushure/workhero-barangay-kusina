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
  const pageSize = 8;

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
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-screen-2xl space-y-5 sm:space-y-6 lg:space-y-8">
        {isLoading ? (
          <BadgeEditorHeaderSkeleton />
        ) : (
          <>
            <PageHeader
              title="Badge Editor"
              subtitle="Create, edit, and manage badges with conditions."
            />

            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              {/* Badge Count Display */}
              <div className="flex gap-2 sm:gap-3 text-sm sm:text-base font-bold text-foreground pl-0.5 sm:pl-1">
                <h5 className="flex items-center gap-1.5">
                  <Coins size={16} className="text-accent" />
                  Badges
                  <span className="bg-accent/75 text-primary-foreground px-2 py-0.5 rounded-full text-xs ml-0.5 shadow-sm/25">
                    {totalCount ?? 0}
                  </span>
                </h5>
              </div>

              {/* Search, Sort, and Add Button */}
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-start lg:justify-end">
                {/* Search Input */}
                <div className="relative flex">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by badge name or description"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 rounded-full text-sm bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent transition-colors"
                  />
                </div>

                <BadgeFilterToggle filterMode={filterMode} onFilterChange={handleFilterChange} />

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="default"
                      className="bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-gray-700 shadow-md w-full sm:w-48 py-2 justify-between border border-gray-200"
                    >
                      <span className="truncate">{currentSortLabel}</span>
                      <ArrowUpDown size={18} className="text-accent" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background w-56">
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`cursor-pointer transition-all duration-300 ease-in-out ${
                          sortOption === option.value ? 'bg-accent/15' : ''
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
                  className="bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card cursor-pointer transition-all duration-500 ease-in-out px-3 sm:px-4 py-2 rounded-full shadow-sm/25 font-semibold text-sm w-full sm:w-48 justify-between"
                >
                  <Coins size={18} />
                  <span className="inline">Add New Badge</span>
                  <Plus size={18} />
                </Button>
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
