'use client';

import { useState } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';
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
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch rewards
  const { data: rewards, isLoading } = useGetRewards();

  // Mutations
  const addReward = useAddReward();
  const editReward = useEditReward();
  const deleteReward = useDeleteReward();
  const hideReward = useHideReward();

  const handleAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const item = rewards?.find((item) => item.id === id);
    if (item) {
      setEditingItem({ id: item.id, name: item.name, cost: item.pointsCost });
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
    cost: number;
  }) => {
    const quantityNum = data.quantity ? parseInt(data.quantity) : undefined;

    if (data.id) {
      // Edit existing item
      await editReward.mutateAsync({
        id: data.id,
        input: {
          name: data.name,
          pointsCost: data.cost,
          quantity: quantityNum,
        },
      });
    } else {
      // Add new item
      await addReward.mutateAsync({
        name: data.name,
        pointsCost: data.cost,
        quantity: quantityNum,
        isActive: true,
      });
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  return (
    <main className="min-h-screen bg-[#fff8f5] p-8">
      <div className="max-w-7xl mx-auto">
        <MercadoHeader
          title="Mercado Manager"
          description="Manage Items visible in mercado"
          onAddClick={handleAdd}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#730202]">Loading items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rewards && rewards.length > 0 ? (
              rewards.map((item) => (
                <MercadoCard
                  key={item.id}
                  item={{
                    id: item.id,
                    name: item.name,
                    price: item.pointsCost,
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
