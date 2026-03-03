'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { MercadoSearchBar } from '@/components/hr/mercado/mercado-search-bar';
import { Button } from '@/components/ui/button';
import { MercadoSortToggle } from '@/components/hr/mercado/mercado-sort-toggle';
import { MercadoFilterToggle } from '@/components/hr/mercado/mercado-filter-toggle';
import { MercadoSkeleton } from '@/components/hr/mercado/mercado-skeleton';
import { Pagination } from '@/components/manager/task-verification/pagination';
import { useMercadoPageState } from '@/actions/hr/use-mercado-page-state';

const AddItemsModal = dynamic(() =>
  import('@/components/hr/mercado/add-items-modal').then((module) => module.AddItemsModal)
);

const DeleteModal = dynamic(() =>
  import('@/components/hr/mercado/delete-modal').then((module) => module.DeleteModal)
);

const ViewItemModal = dynamic(() =>
  import('@/components/hr/mercado/view-item-modal').then((module) => module.ViewItemModal)
);

export function MercadoPageContent() {
  const {
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
  } = useMercadoPageState();

  return (
    // Page shell section.
    <main className="min-h-screen bg-background text-foreground p-8 pb-28">
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
            onClick={openAddModal}
            className="h-10 px-4 rounded-lg bg-[#730202] hover:bg-[#730202]/90 text-white md:ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Catalog grid section. */}
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
                    onClick={openViewModal}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
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
          </>
        )}
      </div>

      {/* Floating pagination section. */}
      {totalPages > 1 && (
        <div className="fixed bottom-6 z-40 flex justify-center" style={contentAreaStyle}>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
