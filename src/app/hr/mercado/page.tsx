'use client';

import { useState, useMemo } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
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
          {isLoading || isProcessing ? (
            <>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 mb-4 text-[#730202]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Deleting item...</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-card border-border rounded-xl p-4 flex items-center relative shadow-sm h-32"
                  >
                    <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                    <div className="ml-4 flex-1 min-w-0 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </>
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
        {!isLoading && !isProcessing && (
          <div className="mt-8 pb-4">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

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
      </div>
    </main>
  );
}
