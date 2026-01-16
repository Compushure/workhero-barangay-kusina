'use client';

import { useState } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { AddItemsModal } from '@/components/hr/mercado/add-items-modal';

// Mock Data
const MOCK_ITEMS = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i + 1}`,
  name: 'Rice sack 10kg',
  price: 400,
}));

export default function MercadoPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAdd = () => setIsAddModalOpen(true);
  const handleEdit = (id: string) => console.log('Editing', id);
  const handleDelete = (id: string) => console.log('Deleting', id);

  const handleSaveItem = (data: {
    icon?: File;
    name: string;
    unitWeight: string;
    weightUnit: string;
    cost: number;
  }) => {
    console.log('Saving item:', data);
    // Add your save logic here
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
      </div>
    </main>
  );
}
