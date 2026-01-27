'use client';

import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';
import { ViewItemModal } from '@/components/hr/mercado/view-item-modal';
import { MercadoSkeleton } from '@/components/hr/mercado/mercado-skeleton';
import { Pagination } from '@/components/manager/Task-Verification/pagination';
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
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
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
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch rewards
  const { data: rewards, isLoading } = useGetRewards();
  <Suspense fallback={<div>Loading...</div>}>
    <MercadoHeader
      title="Mercado Manager"
      description="Manage Items visible in mercado"
      onAddClick={() => {}}
    />
    <div>...</div>
  </Suspense>;
  // Pagination logic
  const totalPages = Math.ceil((rewards?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRewards = useMemo(
    () => rewards?.slice(startIndex, endIndex) || [],
    [rewards, startIndex, endIndex]
  );

  // Reset to page 1 when items change and current page is invalid
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [rewards?.length]);

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
          createdAt: updatedItem.createdAt,
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
          createdAt: item.createdAt,
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
    }) => {
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
      setIsAddModalOpen(false);
      setEditingItem(null);
    },
    [addReward, editReward, uploadRewardPicture]
  );

  return (
    <main className="min-h-screen bg-[#fff8f5] p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <MercadoHeader
          title="Mercado Manager"
          description="Manage Items visible in mercado"
          onAddClick={handleAdd}
        />

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
                      createdAt: item.createdAt,
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
                  <p className="text-[#730202]">No items yet. Click "Add Item" to create one.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && (
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
        onOpenChange={setIsAddModalOpen}
        editingItem={editingItem}
        onSave={handleSaveItem}
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
}
