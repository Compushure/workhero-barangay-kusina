'use client';

import React from 'react';

import { useState } from 'react';
import { Plus, Search, ArrowUpDown, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEditBadgeDialog, { type BadgeFormData } from './dialogs/add-edit-badge-dialog';
import BadgeTable, { type Badge } from './badge-table';
import { useDebounce } from '../../../hooks/useDebounce';
import {Pagination} from '../task-verification/pagination';

type BadgeSortOption =
  | 'name-asc'
  | 'points-desc'
  | 'recently-created'
  | 'manual-only'
  | 'conditional-only';

const SORT_OPTIONS: { value: BadgeSortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'points-desc', label: 'Points (High to Low)' },
  { value: 'recently-created', label: 'Recently Created' },
  { value: 'manual-only', label: 'Manual Only' },
  { value: 'conditional-only', label: 'Conditional Only' },
];

// MOCK DATA - Replace with real API calls
let MOCK_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Task Master',
    description: 'Complete specific tasks and reach experience',
    points: 100,
    award_at_interval: 'none',
    img_link: 'https://images.unsplash.com/photo-1578042360781-b645b814e7e1?w=100&h=100&fit=crop',
    conditions: [
      {
        id: 'c1',
        requirement_type: 'task',
        requirement_operator: '>=',
        requirement_attrb_id: 'task-1',
        requirement_attrb_value: 10,
      },
      {
        id: 'c1b',
        requirement_type: 'attribute',
        requirement_operator: '>=',
        requirement_attrb_id: 'attr-xp',
        requirement_attrb_value: 1000,
      },
    ],
  },
  {
    id: '2',
    name: 'Point Collector',
    description: 'Reach specific points',
    points: 50,
    award_at_interval: 'weekly',
    img_link: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=100&fit=crop',
    conditions: [
      {
        id: 'c2',
        requirement_type: 'attribute',
        requirement_operator: '>=',
        requirement_attrb_id: 'attr-points',
        requirement_attrb_value: 500,
      },
    ],
  },
  {
    id: '3',
    name: 'Perfect Attendance',
    description: 'Perfect attendance tracking',
    points: 75,
    award_at_interval: 'none',
    img_link: null,
    conditions: [
      {
        id: 'c3',
        requirement_type: 'attendance',
        requirement_operator: '=',
        requirement_attrb_id: 'absence',
        requirement_attrb_value: 0,
      },
      {
        id: 'c3b',
        requirement_type: 'attendance',
        requirement_operator: '=',
        requirement_attrb_id: 'late',
        requirement_attrb_value: 0,
      },
    ],
  },
];

export function BadgeEditorPage() {
  const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<BadgeSortOption>('name-asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // Mock data filtering and sorting
  let filteredBadges = badges.filter((badge) => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      badge.name.toLowerCase().includes(searchLower) ||
      badge.description?.toLowerCase().includes(searchLower)
    );
  });

  // Apply sorting
  filteredBadges = [...filteredBadges].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'points-desc':
        return b.points - a.points;
      case 'recently-created':
        return b.id.localeCompare(a.id);
      case 'manual-only':
        return a.conditions.length - b.conditions.length;
      case 'conditional-only':
        return b.conditions.length - a.conditions.length;
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

      // TODO: Replace with actual API call
      console.log('Saving badge:', data);

      if (editingBadge) {
        // Update existing badge
        setBadges(
          badges.map((b) =>
            b.id === editingBadge.id
              ? {
                  id: b.id,
                  ...data,
                }
              : b
          )
        );
      } else {
        // Add new badge
        const newBadge: Badge = {
          id: `badge-${Date.now()}`,
          ...data,
        };
        setBadges([...badges, newBadge]);
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
      // TODO: Replace with actual API call
      console.log('Deleting badge:', badgeId);

      // Delete badge from state
      setBadges(badges.filter((b) => b.id !== badgeId));
      setPage(1); // Reset to first page after deletion
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const handleErrorClear = () => {
    setSaveError('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSortChange = (value: BadgeSortOption) => {
    setSortOption(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Name (A-Z)';

  return (
    <main className="w-full min-h-screen bg-zinc-50 p-10">
      <div className="mx-auto min-w-250 max-w-400 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#690003]">Badge Editor</h1>
          <p className="text-md text-gray-600">Create, edit, and manage badges with conditions.</p>
        </div>

        <section className="flex justify-between">
          {/* Badge Count Display */}
          <div className="flex gap-4 text-lg font-bold text-[#690003] pl-2">
            <h5 className="flex items-center gap-2">
              <Coins size={20} />
              Badges{' '}
              <span className="bg-gray-50 px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
                {totalCount ?? 0}
              </span>
            </h5>
          </div>

          {/* Search, Sort, and Add Button */}
          <div className="flex gap-4 items-center justify-end">
            {/* Search Input */}
            <div className="relative flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search badges..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-xl text-sm bg-white shadow-sm/50 border border-gray-200 focus:outline-none focus:border-[#690003] transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="bg-[#690003] hover:brightness-100 w-35 cursor-pointer rounded-full text-white shadow-sm/25 flex justify-between transition-all duration-500 ease-in-out"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  <ArrowUpDown size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`cursor-pointer transition-all duration-300 ease-in-out ${
                      sortOption === option.value ? 'bg-red-100' : ''
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
              className="px-6 py-2 rounded-full bg-[#690003] hover:brightness-100 text-zinc-50 font-semibold text-sm shadow-sm/25 cursor-pointer transition-all duration-500 ease-in-out shrink-0"
            >
              <Coins size={18} />
              <span>Add New Badge</span>
              <Plus size={18} className="ml-4" />
            </Button>
          </div>
        </section>

        <BadgeTable
          badges={paginatedBadges}
          isLoading={false}
          isError={false}
          onEdit={handleOpenEditDialog}
          onDelete={handleDelete}
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
        />
      </div>
    </main>
  );
}
