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
import { MonthFilter, StockFilter, VisibilityFilter } from '@/components/hr/mercado/mercado-filter-toggle';
import { SortOption } from '@/components/hr/mercado/mercado-sort-toggle';

const ITEMS_PER_PAGE = 9;

export interface EditableMercadoItem {
  id: string;
  name: string;
  cost: number;
  quantity?: number;
  redeemingLimit?: number;
  imageUrl?: string;
  availableMonth?: number;
}

export interface ViewableMercadoItem {
  id: string;
  name: string;
  cost: number;
  quantity?: number;
  redeemingLimit?: number;
  isActive: boolean;
  imageUrl?: string;
  availableMonth?: number;
  availableDate?: string | Date | null;
}

export interface SaveMercadoItemInput {
  id?: string;
  icon?: File;
  name: string;
  quantity: string;
  redeemingLimit: string;
  cost: number;
  availableMonth?: number | null;
}

const monthNameToNumber: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const mapRewardToEditableItem = (reward: Reward): EditableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  imageUrl: reward.imageUrl,
  availableMonth: reward.availableMonth ?? undefined,
});

const mapRewardToViewableItem = (reward: Reward): ViewableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  isActive: reward.isActive,
  imageUrl: reward.imageUrl,
  availableMonth: reward.availableMonth ?? undefined,
  availableDate: reward.availableDate,
});

const getRewardTimestamp = (reward: Reward): number => {
  if (!reward.createdAt) return 0;
  return reward.createdAt instanceof Date
    ? reward.createdAt.getTime()
    : new Date(reward.createdAt).getTime();
};

const getRewardAvailableMonth = (reward: Reward): number | null => {
  if (
    typeof reward.availableMonth === 'number' &&
    reward.availableMonth >= 1 &&
    reward.availableMonth <= 12
  ) {
    return reward.availableMonth;
  }

  if (reward.availableDate) {
    const date = new Date(reward.availableDate);
    if (!Number.isNaN(date.getTime())) {
      return date.getMonth() + 1;
    }
  }

  if (reward.monthName) {
    const normalizedMonthName = reward.monthName.trim().toLowerCase();
    return monthNameToNumber[normalizedMonthName] ?? null;
  }

  return null;
};

const matchesMonthFilter = (reward: Reward, monthFilter: MonthFilter): boolean => {
  if (monthFilter === 'all') return true;
  return getRewardAvailableMonth(reward) === monthFilter;
};

export function useMercadoPageState() {
  // Local UI state.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [monthFilter, setMonthFilter] = useState<MonthFilter>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Data sources.
  const { contentAreaStyle } = useSidebarContentArea();
  const debouncedSearch = useDebounce(search, 300);
  const { data: allRewards = [], isLoading } = useGetRewards();

  // Filtered and sorted list.
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

      if (!matchesMonthFilter(reward, monthFilter)) return false;

      return true;
    });

    filteredRewards.sort((a, b) => {
      const dateA = getRewardTimestamp(a);
      const dateB = getRewardTimestamp(b);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filteredRewards;
  }, [allRewards, debouncedSearch, sortOrder, stockFilter, visibilityFilter, monthFilter]);

  // Fast ID lookup map.
  const rewardsById = useMemo(() => {
    return new Map(rewards.map((reward) => [reward.id, reward]));
  }, [rewards]);

  // Pagination values.
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE)),
    [rewards.length]
  );

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return rewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [rewards, currentPage]);

  // Modal payload data.
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

  // Reset page on filter change.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, stockFilter, visibilityFilter, monthFilter]);

  // Clamp invalid page index.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Mutation hooks.
  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();
  const uploadRewardPicture = useUploadRewardPicture();

  // Open add modal.
  const openAddModal = useCallback(() => {
    setEditingItemId(null);
    setIsAddModalOpen(true);
  }, []);

  // Open edit modal.
  const openEditModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setEditingItemId(id);
        setIsAddModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Open delete modal.
  const openDeleteModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setDeletingItemId(id);
        setIsDeleteModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Open view modal.
  const openViewModal = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setViewingItemId(id);
        setIsViewModalOpen(true);
      }
    },
    [rewardsById]
  );

  // Jump from view to edit.
  const handleEditFromView = useCallback(() => {
    if (viewingItemId) {
      openEditModal(viewingItemId);
      setIsViewModalOpen(false);
    }
  }, [viewingItemId, openEditModal]);

  // Hide selected item.
  const handleHide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: false });
    },
    [hideReward]
  );

  // Unhide selected item.
  const handleUnhide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: true });
    },
    [hideReward]
  );

  // Confirm delete action.
  const handleConfirmDelete = useCallback(async () => {
    if (deletingItemId) {
      await deleteReward.mutateAsync(deletingItemId);
      setDeletingItemId(null);
      setIsDeleteModalOpen(false);
    }
  }, [deletingItemId, deleteReward]);

  // Save add/edit form.
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

  // Public hook API.
  return {
    contentAreaStyle,
    isLoading,
    totalPages,
    currentPage,
    paginatedRewards,
    search,
    sortOrder,
    stockFilter,
    visibilityFilter,
    monthFilter,
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
    setMonthFilter,
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
