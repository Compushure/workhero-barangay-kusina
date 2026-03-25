import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Reward } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useSidebarContentArea } from '@/hooks/useSidebarContentArea';
import {
  useAddReward,
  useEditReward,
  useDeleteReward,
  useHideReward,
  useUploadRewardPicture,
} from '@/hooks/tanstack/mutations/hrMutations';
import {
  IntervalFilter,
  StockFilter,
  VisibilityFilter,
} from '@/components/hr/mercado/mercado-filter-toggle';
import { SortOption } from '@/components/hr/mercado/mercado-sort-toggle';

const ITEMS_PER_PAGE = 9;

export interface EditableMercadoItem {
  id: string;
  name: string;
  cost: number;
  quantity?: number;
  redeemingLimit?: number;
  imageUrl?: string;
  availableDate?: string | Date | null;
  availableMonth?: 'weekly' | 'monthly' | 'yearly' | null;
}

export interface ViewableMercadoItem {
  id: string;
  name: string;
  cost: number;
  quantity?: number;
  redeemingLimit?: number;
  isActive: boolean;
  imageUrl?: string;
  availableMonth?: 'weekly' | 'monthly' | 'yearly' | null;
  availableDate?: string | Date | null;
}

export interface SaveMercadoItemInput {
  id?: string;
  icon?: File;
  name: string;
  quantity: string;
  redeemingLimit: string;
  cost: number;
  availableDate?: Date | null;
  availableMonth?: 'weekly' | 'monthly' | 'yearly' | null;
}

// Convert a Reward record into the shape used by the add/edit modal.
const mapRewardToEditableItem = (reward: Reward): EditableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  imageUrl: reward.imageUrl,
  availableDate: reward.availableDate,
  availableMonth: reward.availableMonth ?? null,
});

// Convert a Reward record into the shape used by the view modal.
const mapRewardToViewableItem = (reward: Reward): ViewableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  isActive: reward.isActive,
  imageUrl: reward.imageUrl,
  availableMonth: reward.availableMonth ?? null,
  availableDate: reward.availableDate,
});

// Parse createdAt safely to support both Date objects and ISO strings.
const getRewardTimestamp = (reward: Reward): number => {
  if (!reward.createdAt) return 0;
  return reward.createdAt instanceof Date
    ? reward.createdAt.getTime()
    : new Date(reward.createdAt).getTime();
};

// Match reward against currently selected interval filter.
const matchesIntervalFilter = (reward: Reward, intervalFilter: IntervalFilter): boolean => {
  if (intervalFilter === 'all') return true;
  return reward.availableMonth === intervalFilter;
};

export function useMercadoPageState() {
  // UI-only local state for filters, pagination, and modal visibility.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [intervalFilter, setIntervalFilter] = useState<IntervalFilter>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Data inputs used by this hook.
  const { contentAreaStyle } = useSidebarContentArea();
  const debouncedSearch = useDebounce(search, 500);
  const { data: allRewards = [], isLoading } = useGetRewards();

  // Build filtered + sorted reward list derived from source data and UI filters.
  const rewards = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    const filteredRewards = allRewards.filter((reward) => {
      if (normalizedSearch && !reward.name.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      if (stockFilter !== 'all') {
        const hasQuantityLimit = reward.quantity !== null && reward.quantity !== undefined;
        const inStock = !hasQuantityLimit || (reward.quantity ?? 0) > 0;

        if (stockFilter === 'in-stock' && !inStock) return false;
        if (stockFilter === 'out-of-stock' && inStock) return false;
      }

      if (visibilityFilter === 'visible' && !reward.isActive) return false;
      if (visibilityFilter === 'hidden' && reward.isActive) return false;

      if (!matchesIntervalFilter(reward, intervalFilter)) return false;

      return true;
    });

    filteredRewards.sort((a, b) => {
      const dateA = getRewardTimestamp(a);
      const dateB = getRewardTimestamp(b);
      switch (sortOrder) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'points-desc':
          return b.pointsCost - a.pointsCost;
        case 'points-asc':
          return a.pointsCost - b.pointsCost;
        default:
          return 0;
      }
    });

    return filteredRewards;
  }, [allRewards, debouncedSearch, sortOrder, stockFilter, visibilityFilter, intervalFilter]);

  // Create quick lookup map for reward-by-id reads.
  const rewardsById = useMemo(() => {
    return new Map(rewards.map((reward) => [reward.id, reward]));
  }, [rewards]);

  // Compute pagination values from filtered list.
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE)),
    [rewards.length]
  );

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return rewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [rewards, currentPage]);

  // Compute selected item payloads for each modal.
  const editingItem = useMemo(() => {
    if (!editingItemId) return null;
    const item = rewardsById.get(editingItemId);
    return item ? mapRewardToEditableItem(item) : null;
  }, [editingItemId, rewardsById]);

  const viewingItem = useMemo(() => {
    if (!viewingItemId) return null;
    const item = rewardsById.get(viewingItemId);
    return item ? mapRewardToViewableItem(item) : null;
  }, [viewingItemId, rewardsById]);

  const deletingItemName = useMemo(() => {
    if (!deletingItemId) return undefined;
    return rewardsById.get(deletingItemId)?.name;
  }, [deletingItemId, rewardsById]);

  // Reset to first page whenever search/sort/filter values change.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, stockFilter, visibilityFilter, intervalFilter]);

  // Keep current page index within valid page range.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Mutation hooks used for create/edit/delete/hide/upload actions.
  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();
  const uploadRewardPicture = useUploadRewardPicture();

  // Open add modal in create mode.
  const openAddModal = useCallback(() => {
    setEditingItemId(null);
    setIsAddModalOpen(true);
  }, []);

  // Open add modal in edit mode when item exists.
  const openEditModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setEditingItemId(id);
        setIsAddModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Open delete confirmation modal when item exists.
  const openDeleteModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setDeletingItemId(id);
        setIsDeleteModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Open read-only view modal when item exists.
  const openViewModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setViewingItemId(id);
        setIsViewModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Switch directly from view modal into edit mode.
  const handleEditFromView = useCallback(() => {
    if (viewingItemId) {
      openEditModal(viewingItemId);
      setIsViewModalOpen(false);
    }
  }, [viewingItemId, openEditModal]);

  // Mark selected item as hidden.
  const handleHide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: false });
    },
    [hideReward]
  );

  // Mark selected item as visible again.
  const handleUnhide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: true });
    },
    [hideReward]
  );

  // Execute confirmed delete and close modal.
  const handleConfirmDelete = useCallback(async () => {
    if (deletingItemId) {
      await deleteReward.mutateAsync(deletingItemId);
      setDeletingItemId(null);
      setIsDeleteModalOpen(false);
    }
  }, [deletingItemId, deleteReward]);

  // Save modal form: update existing item or create new item, then optionally upload image.
  const handleSaveItem = useCallback(
    async (data: SaveMercadoItemInput) => {
      setSaveError('');

      const quantityNum = data.quantity ? Number.parseInt(data.quantity, 10) : undefined;
      const redeemingLimitNum = data.redeemingLimit
        ? Number.parseInt(data.redeemingLimit, 10)
        : undefined;

      let rewardId = data.id;

      if (data.id) {
        await editReward.mutateAsync({
          id: data.id,
          input: {
            name: data.name,
            pointsCost: data.cost,
            quantity: quantityNum,
            redeemingLimit: redeemingLimitNum,
            availableDate: data.availableDate || null,
            availableMonth: data.availableMonth || null,
          },
        });
      } else {
        const createdReward = await addReward.mutateAsync({
          name: data.name,
          pointsCost: data.cost,
          quantity: quantityNum,
          redeemingLimit: redeemingLimitNum,
          isActive: true,
          availableDate: data.availableDate || null,
          availableMonth: data.availableMonth || null,
        });
        rewardId = createdReward?.id;
      }

      if (data.icon && rewardId) {
        await uploadRewardPicture.mutateAsync({
          rewardId,
          file: data.icon,
          rewardName: data.name,
        });
      }

      setEditingItemId(null);
    },
    [addReward, editReward, uploadRewardPicture]
  );

  // Expose state and handlers to the Mercado manager page.
  return {
    contentAreaStyle,
    isLoading,
    totalItemsCount: rewards.length,
    totalPages,
    currentPage,
    paginatedRewards,
    search,
    sortOrder,
    stockFilter,
    visibilityFilter,
    intervalFilter,
    isAddModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    editingItem,
    viewingItem,
    deletingItemName,
    saveError,
    setCurrentPage,
    setSearch,
    setSortOrder,
    setStockFilter,
    setVisibilityFilter,
    setIntervalFilter,
    setSaveError,
    setIsAddModalOpen,
    setIsDeleteModalOpen,
    setIsViewModalOpen,
    setEditingItemId,
    setDeletingItemId,
    setViewingItemId,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openViewModal,
    handleEditFromView,
    handleHide,
    handleUnhide,
    handleConfirmDelete,
    handleSaveItem,
  };
}
