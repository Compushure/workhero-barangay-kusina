'use client';

import { useState } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';
import { DeleteModal } from '@/components/hr/mercado/delete-modal';

// Mock Data
const MOCK_ITEMS = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i + 1}`,
  name: 'Rice sack 10kg',
  price: 400,
}));

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

  const handleAdd = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (id: string) => {
    // used the mock data for now to find the item being edited
    const item = MOCK_ITEMS.find((item) => item.id === id);
    if (item) {
      setEditingItem({ id: item.id, name: item.name, cost: item.price });
      setIsAddModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const item = MOCK_ITEMS.find((item) => item.id === id);
    if (item) {
      setDeletingItem({ id: item.id, name: item.name });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      console.log('Deleting item:', deletingItem.id);
      // Delete logic here
      setDeletingItem(null);
    }
  };

  const handleSaveItem = (data: {
    id?: string;
    icon?: File;
    name: string;
    unitWeight: string;
    weightUnit: string;
    cost: number;
  }) => {
    if (data.id) {
      console.log('Updating item:', data);
      // Update logic here
    } else {
      console.log('Adding new item:', data);
      // Add logic here
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f5] p-8">
      <div className="max-w-7xl mx-auto">
        <MercadoHeader
          title="Mercado Manager"
          description="Manage Items visible in mercado"
          onAddClick={handleAdd}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_ITEMS.map((item) => (
            <MercadoCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>

        <AddItemsModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
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
