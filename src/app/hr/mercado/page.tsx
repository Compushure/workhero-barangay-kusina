'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { MercadoSearchBar } from '@/components/hr/mercado/mercado-search-bar';
import { Button } from '@/components/ui/button';
import { MercadoSortToggle, SortOption } from '@/components/hr/mercado/mercado-sort-toggle';
import {
  MercadoFilterToggle,
  MonthFilter,
  StockFilter,
  VisibilityFilter,
} from '@/components/hr/mercado/mercado-filter-toggle';
import { MercadoSkeleton } from '@/components/hr/mercado/mercado-skeleton';
import { Pagination } from '@/components/manager/task-verification/pagination';
import type { Reward } from '@/types';
import {
  useGetRewards,
  useAddReward,
  useEditReward,
  useDeleteReward,
  useHideReward,
  useUploadRewardPicture,
} from '@/hooks/tanstack';

const AddItemsModal = dynamic(() =>
  import('@/components/hr/mercado/add-items-modal').then((module) => module.AddItemsModal)
);

const DeleteModal = dynamic(() =>
  import('@/components/hr/mercado/delete-modal').then((module) => module.DeleteModal)
);

const ViewItemModal = dynamic(() =>
  import('@/components/hr/mercado/view-item-modal').then((module) => module.ViewItemModal)
);

const ITEMS_PER_PAGE = 9;

interface EditableMercadoItem {
  id: string;
  name: string;
  cost: number;
  quantity?: number;
  redeemingLimit?: number;
  imageUrl?: string;
  availableMonth?: number;
}

interface ViewableMercadoItem {
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

const getRewardCreatedAt = (reward: Reward): string | undefined => {
  if (!reward.createdAt) return undefined;
  return reward.createdAt instanceof Date ? reward.createdAt.toISOString() : reward.createdAt;
};

const mapRewardToEditableItem = (reward: Reward): EditableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  imageUrl: reward.imageUrl,
  availableMonth: reward.availableMonth,
});

const mapRewardToViewableItem = (reward: Reward): ViewableMercadoItem => ({
  id: reward.id,
  name: reward.name,
  cost: reward.pointsCost,
  quantity: reward.quantity,
  redeemingLimit: reward.redeemingLimit,
  isActive: reward.isActive,
  imageUrl: reward.imageUrl,
  availableMonth: reward.availableMonth,
  availableDate: reward.availableDate,
});

const getRewardTimestamp = (reward: Reward): number => {
  if (!reward.createdAt) return 0;
  return reward.createdAt instanceof Date
    ? reward.createdAt.getTime()
    : new Date(reward.createdAt).getTime();
};

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

export default function MercadoPage() {
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

  const debouncedSearch = useDebounce(search, 300);
  const { data: allRewards = [], isLoading } = useGetRewards();

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

  const rewardsById = useMemo(() => {
    return new Map(rewards.map((reward) => [reward.id, reward]));
  }, [rewards]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE)),
    [rewards.length]
  );

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return rewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [rewards, currentPage]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, stockFilter, visibilityFilter, monthFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();
  const uploadRewardPicture = useUploadRewardPicture();

  const isProcessing = deleteReward.isPending || hideReward.isPending;

  const handleAdd = useCallback(() => {
    setEditingItemId(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setEditingItemId(id);
        setIsAddModalOpen(true);
      }
    },
    [rewardsById]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setDeletingItemId(id);
        setIsDeleteModalOpen(true);
      }
    },
    [rewardsById]
  );

  const handleView = useCallback(
    (id: string) => {
      if (rewardsById.has(id)) {
        setViewingItemId(id);
        setIsViewModalOpen(true);
      }
    },
    [rewardsById]
  );

  const handleEditFromView = useCallback(() => {
    if (viewingItemId) {
      handleEdit(viewingItemId);
      setIsViewModalOpen(false);
    }
  }, [viewingItemId, handleEdit]);

  const handleHide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: false });
    },
    [hideReward]
  );

  const handleUnhide = useCallback(
    async (id: string) => {
      await hideReward.mutateAsync({ id, isActive: true });
    },
    [hideReward]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (deletingItemId) {
      await deleteReward.mutateAsync(deletingItemId);
      setDeletingItemId(null);
      setIsDeleteModalOpen(false);
    }
  }, [deletingItemId, deleteReward]);

  const handleSaveItem = useCallback(
    async (data: {
      id?: string;
      icon?: File;
      name: string;
      quantity: string;
      redeemingLimit: string;
      cost: number;
      availableMonth?: number | null;
    }) => {
      setSaveError('');

      const quantityNum = data.quantity ? parseInt(data.quantity) : undefined;
      const redeemingLimitNum = data.redeemingLimit ? parseInt(data.redeemingLimit) : undefined;

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

  return (
    <main className="min-h-screen bg-[#fff8f5] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <MercadoHeader
          title="Mercado Manager"
          description="Manage items visible in mercado"
          showAddButton={false}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full md:w-auto md:min-w-[320px] md:max-w-md">
              <MercadoSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by employee or items"
              />
            </div>
            <MercadoSortToggle value={sortOrder} onChange={setSortOrder} />
            <MercadoFilterToggle
              stockFilter={stockFilter}
              visibilityFilter={visibilityFilter}
              monthFilter={monthFilter}
              onStockFilterChange={setStockFilter}
              onVisibilityFilterChange={setVisibilityFilter}
              onMonthFilterChange={setMonthFilter}
            />
          </div>
          <Button
            onClick={handleAdd}
            className="h-10 px-4 rounded-lg bg-[#730202] hover:bg-[#730202]/90 text-white md:ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {isLoading ? (
          <MercadoSkeleton />
        ) : (
          <>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedRewards.length > 0 ? (
                paginatedRewards.map((item) => (
                  <MercadoCard
                    key={item.id}
                    item={{
                      id: item.id,
                      name: item.name,
                      price: item.pointsCost,
                      quantity: item.quantity,
                      isActive: item.isActive,
                      imageUrl: item.imageUrl,
                      availableMonth: item.availableMonth,
                      availableDate: item.availableDate,
                    }}
                    onClick={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onHide={handleHide}
                    onUnhide={handleUnhide}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  {search ? (
                    <p className="text-[#730202]">No items found matching your search.</p>
                  ) : (
                    <p className="text-[#730202]">No items yet. Click "Add Item" to create one.</p>
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pb-4">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AddItemsModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          if (!open) setSaveError('');
          if (!open) setEditingItemId(null);
          setIsAddModalOpen(open);
        }}
        editingItem={editingItem}
        onSave={handleSaveItem}
        saveError={saveError}
        onErrorClear={() => setSaveError('')}
      />

      <ViewItemModal
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) setViewingItemId(null);
        }}
        onEdit={handleEditFromView}
        item={viewingItem}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setDeletingItemId(null);
        }}
        itemName={deletingItemName}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
