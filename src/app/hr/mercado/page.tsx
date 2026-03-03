<<<<<<< HEAD
import { MercadoPageContent } from '@/components/hr/mercado/mercado-page-content';

export default function MercadoPage() {
  return <MercadoPageContent />;
=======
'use client';

import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { MercadoSearchBar } from '@/components/hr/mercado/mercado-search-bar';
import { MercadoSortToggle, SortOption } from '@/components/hr/mercado/mercado-sort-toggle';
import {
  MercadoFilterToggle,
  StockFilter,
  VisibilityFilter,
} from '@/components/hr/mercado/mercado-filter-toggle';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';
import { ViewItemModal } from '@/components/hr/mercado/view-item-modal';
import { MercadoSkeleton } from '@/components/hr/mercado/mercado-skeleton';
import { Pagination } from '@/components/manager/task-verification/pagination';
import {
  useGetRewards,
  useAddReward,
  useEditReward,
  useDeleteReward,
  useHideReward,
  useUploadRewardPicture,
} from '@/hooks/tanstack';

export default function MercadoPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
    imageUrl?: string;
    availableDate?: Date | string | null;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [viewingItem, setViewingItem] = useState<{
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt?: string;
    availableDate?: string | Date | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  // Fetch rewards
  const { data: allRewards, isLoading } = useGetRewards();

  // Filter and sort rewards
  const rewards = useMemo(() => {
    if (!allRewards) return [];

    let filtered = allRewards;

    // Filter by search
    if (debouncedSearch) {
      filtered = filtered.filter((reward) =>
        reward.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Filter by stock status
    if (stockFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        const hasQuantityLimit = reward.quantity !== null && reward.quantity !== undefined;
        if (stockFilter === 'in-stock') {
          return !hasQuantityLimit || (reward.quantity !== undefined && reward.quantity > 0);
        } else if (stockFilter === 'out-of-stock') {
          return hasQuantityLimit && reward.quantity !== undefined && reward.quantity <= 0;
        }
        return true;
      });
    }

    // Filter by visibility
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter((reward) => {
        if (visibilityFilter === 'visible') {
          return reward.isActive;
        } else if (visibilityFilter === 'hidden') {
          return !reward.isActive;
        }
        return true;
      });
    }

    // Apply sorting (only date sorting)
    return [...filtered].sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
      const dateB =
        b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [allRewards, debouncedSearch, sortOrder, stockFilter, visibilityFilter]);

  // Pagination logic
  const totalPages = Math.ceil((rewards?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRewards = useMemo(
    () => rewards?.slice(startIndex, endIndex) || [],
    [rewards, startIndex, endIndex]
  );

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOrder, stockFilter, visibilityFilter]);

  // Sync viewing item with updated rewards when mutations complete
  useEffect(() => {
    if (viewingItem && rewards && isViewModalOpen) {
      const updatedItem = rewards.find((r) => r.id === viewingItem.id);
      if (updatedItem) {
        setViewingItem({
          id: updatedItem.id,
          name: updatedItem.name,
          cost: updatedItem.pointsCost,
          quantity: updatedItem.quantity,
          redeemingLimit: updatedItem.redeemingLimit,
          isActive: updatedItem.isActive,
          imageUrl: updatedItem.imageUrl,
          availableDate: updatedItem.availableDate,
          createdAt:
            updatedItem.createdAt instanceof Date
              ? updatedItem.createdAt.toISOString()
              : updatedItem.createdAt,
        });
      }
    }
  }, [rewards, viewingItem?.id, isViewModalOpen]);

  // Mutations
  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();
  const uploadRewardPicture = useUploadRewardPicture();

  const isProcessing = deleteReward.isPending || hideReward.isPending;

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      const item = rewards?.find((item) => item.id === id);
      if (item) {
        setEditingItem({
          id: item.id,
          name: item.name,
          cost: item.pointsCost,
          quantity: item.quantity,
          redeemingLimit: item.redeemingLimit,
          imageUrl: item.imageUrl,
          availableDate: item.availableDate,
        });
        setIsAddModalOpen(true);
      }
    },
    [rewards]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const item = rewards?.find((item) => item.id === id);
      if (item) {
        setDeletingItem({ id: item.id, name: item.name });
        setIsDeleteModalOpen(true);
      }
    },
    [rewards]
  );

  const handleView = useCallback(
    (id: string) => {
      const item = rewards?.find((item) => item.id === id);
      if (item) {
        setViewingItem({
          id: item.id,
          name: item.name,
          cost: item.pointsCost,
          quantity: item.quantity,
          redeemingLimit: item.redeemingLimit,
          isActive: item.isActive,
          imageUrl: item.imageUrl,
          availableDate: item.availableDate,
          createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        });
        setIsViewModalOpen(true);
      }
    },
    [rewards]
  );

  const handleEditFromView = useCallback(() => {
    if (viewingItem) {
      handleEdit(viewingItem.id);
    }
  }, [viewingItem, handleEdit]);

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
    if (deletingItem) {
      await deleteReward.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setIsDeleteModalOpen(false);
    }
  }, [deletingItem, deleteReward]);

  const handleSaveItem = useCallback(
    async (data: {
      id?: string;
      icon?: File;
      name: string;
      quantity: string;
      redeemingLimit: string;
      cost: number;
      availableDate?: Date | null;
    }) => {
      // Clear previous error
      setSaveError('');

      const quantityNum = data.quantity ? parseInt(data.quantity) : undefined;
      const redeemingLimitNum = data.redeemingLimit ? parseInt(data.redeemingLimit) : undefined;

      let rewardId = data.id;

      if (data.id) {
        // Edit existing item
        await editReward.mutateAsync({
          id: data.id,
          input: {
            name: data.name,
            pointsCost: data.cost,
            quantity: quantityNum,
            redeemingLimit: redeemingLimitNum,
            availableDate: data.availableDate || null,
          },
        });
      } else {
        // Add new item
        const createdReward = await addReward.mutateAsync({
          name: data.name,
          pointsCost: data.cost,
          quantity: quantityNum,
          redeemingLimit: redeemingLimitNum,
          isActive: true,
          availableDate: data.availableDate || null,
        });
        rewardId = createdReward?.id;
      }

      if (data.icon && rewardId) {
        await uploadRewardPicture.mutateAsync({
          rewardId: rewardId,
          file: data.icon,
          rewardName: data.name,
        });
      }

      // Modal closes from within the modal component after successful save
      setEditingItem(null);
    },
    [addReward, editReward, uploadRewardPicture]
  );

  return (
    <main className="min-h-screen bg-[#fff8f5] p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header with Search and Sort */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#730202]">Mercado Manager</h1>
              <p className="text-muted-foreground">Manage Items visible in mercado</p>
            </div>
          </div>

          {/* Search and Sort Row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
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
              onStockFilterChange={setStockFilter}
              onVisibilityFilterChange={setVisibilityFilter}
            />
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-11 px-6 rounded-xl bg-[#730202] hover:bg-[#730202]/90 text-white font-semibold text-base ml-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <MercadoSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {paginatedRewards && paginatedRewards.length > 0 ? (
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
                      availableDate: item.availableDate,
                      createdAt:
                        item.createdAt instanceof Date
                          ? item.createdAt.toISOString()
                          : item.createdAt,
                    }}
                    onClick={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onHide={handleHide}
                    onUnhide={handleUnhide}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  {search ? (
                    <p className="text-[#730202]">No items found matching your search.</p>
                  ) : (
                    <p className="text-[#730202]">No items yet. Click "Add Item" to create one.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="mt-8 pb-4">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AddItemsModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          if (!open) setSaveError('');
          setIsAddModalOpen(open);
        }}
        editingItem={editingItem}
        onSave={handleSaveItem}
        saveError={saveError}
        onErrorClear={() => setSaveError('')}
      />

      <ViewItemModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        onEdit={handleEditFromView}
        item={viewingItem}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        itemName={deletingItem?.name}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
>>>>>>> 7c524ad308952552ec3a9c33cee7d435537fff28
}
