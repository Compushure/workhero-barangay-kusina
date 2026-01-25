'use client';

import { useState, useMemo, Suspense } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';
import { Pagination } from '@/components/manager/task-verification/pagination';
import {
  useGetRewards,
  useAddReward,
  useEditReward,
  useDeleteReward,
  useHideReward,
} from '@/hooks/tanstack';

export default function MercadoPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;


  // Fetch rewards
  const { data: rewards, isLoading } = useGetRewards();
  <Suspense fallback={<div>Loading...</div>}>
    <MercadoHeader
      title="Mercado Manager"
      description="Manage Items visible in mercado" onAddClick={() => {}}
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

  // Mutations
  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();

  const isProcessing = deleteReward.isPending || hideReward.isPending;

  const handleAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (id: string) => {
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
  };

  const handleDelete = (id: string) => {
    const item = rewards?.find((item) => item.id === id);
    if (item) {
      setDeletingItem({ id: item.id, name: item.name });
      setIsDeleteModalOpen(true);
    }
  };

  const handleHide = async (id: string) => {
    await hideReward.mutateAsync({ id, isActive: false });
  };

  const handleUnhide = async (id: string) => {
    await hideReward.mutateAsync({ id, isActive: true });
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      await deleteReward.mutateAsync(deletingItem.id);
      setDeletingItem(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSaveItem = async (data: {
    id?: string;
    icon?: File;
    name: string;
    quantity: string;
    redeemingLimit: string;
    cost: number;
  }) => {
    const quantityNum = data.quantity ? parseInt(data.quantity) : undefined;
    const redeemingLimitNum = data.redeemingLimit ? parseInt(data.redeemingLimit) : undefined;

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
      await addReward.mutateAsync({
        name: data.name,
        pointsCost: data.cost,
        quantity: quantityNum,
        redeemingLimit: redeemingLimitNum,
        isActive: true,
      });
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

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
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin gap-2"/>
                <span className="text-[#5a2a2a] font-medium">Loading items...</span>
              </div>
            </div>
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
                    }}
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

      <DeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        itemName={deletingItem?.name}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
