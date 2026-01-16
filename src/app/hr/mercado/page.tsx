'use client';

import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';

// Mock Data
const MOCK_ITEMS = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i + 1}`,
  name: 'Rice sack 10kg',
  price: 400,
}));

export default function MercadoPage() {
  const handleAdd = () => console.log('Open Add Modal');
  const handleEdit = (id: string) => console.log('Editing', id);
  const handleDelete = (id: string) => console.log('Deleting', id);

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
      </div>
    </main>
  );
}
