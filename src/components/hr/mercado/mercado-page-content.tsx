'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';
import { MercadoCard } from '@/components/hr/mercado/mercado-card';
import { MercadoHeader } from '@/components/hr/mercado/mercado-header';
import { MercadoHeaderSkeleton } from '@/components/hr/mercado/mercado-header-skeleton';
import { MercadoSearchBar } from '@/components/hr/mercado/mercado-search-bar';
import { Button } from '@/components/ui/button';
import { MercadoSortToggle } from '@/components/hr/mercado/mercado-sort-toggle';
import { MercadoFilterToggle } from '@/components/hr/mercado/mercado-filter-toggle';
import { MercadoSkeleton } from '@/components/hr/mercado/mercado-skeleton';
import { Pagination } from '@/components/shared/pagination';
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
    isLoading,
    totalPages,
    currentPage,
    paginatedRewards,
    search,
    sortOrder,
    stockFilter,
    visibilityFilter,
    intervalFilter,
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
    setIntervalFilter,
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

  const getEmptyStateMessage = () => {
    if (search) {
      return `No items found matching "${search}".`;
    }

    const filterLabels: string[] = [];

    if (stockFilter === 'in-stock') filterLabels.push('In Stock');
    if (stockFilter === 'out-of-stock') filterLabels.push('Out of Stock');
    if (visibilityFilter === 'visible') filterLabels.push('Visible');
    if (visibilityFilter === 'hidden') filterLabels.push('Hidden');
    if (intervalFilter === 'weekly') filterLabels.push('Weekly');
    if (intervalFilter === 'monthly') filterLabels.push('Monthly');
    if (intervalFilter === 'yearly') filterLabels.push('Yearly');

    if (filterLabels.length === 0) {
      return 'No items yet. Click "Add Item" to create one.';
    }

    if (filterLabels.length === 1) {
      return `No items found for the ${filterLabels[0]} filter.`;
    }

    return 'No items found. Please select other filters.';
  };

  return (
    <main className="w-full min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-5 sm:gap-6 2xl:max-w-screen-2xl">
        {isLoading ? (
          <MercadoHeaderSkeleton />
        ) : (
          <Suspense fallback={<MercadoHeaderSkeleton />}>
            <div className="space-y-4 sm:space-y-5">
              <MercadoHeader
                title="Mercado Manager"
                description="Manage items visible in mercado"
                showAddButton={false}
              />

              <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5">
                <div className="flex min-w-0 flex-col items-stretch gap-2 xl:flex-row xl:items-center xl:justify-end">
                  <div className="min-w-0 flex-1 xl:max-w-xs">
                    <MercadoSearchBar
                      value={search}
                      onChange={setSearch}
                      placeholder="Search by item name"
                      className="w-full"
                    />
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap xl:shrink-0">
                    <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap">
                      <MercadoSortToggle
                        value={sortOrder}
                        onChange={setSortOrder}
                        className="sm:w-44"
                      />
                      <MercadoFilterToggle
                        stockFilter={stockFilter}
                        visibilityFilter={visibilityFilter}
                        intervalFilter={intervalFilter}
                        onStockFilterChange={setStockFilter}
                        onVisibilityFilterChange={setVisibilityFilter}
                        onIntervalFilterChange={setIntervalFilter}
                      />
                    </div>
                    <Button
                      onClick={openAddModal}
                      className="text-button control-h w-full justify-center rounded-md bg-primary-gradient px-3 py-1.5 whitespace-nowrap text-card shadow-sm/25 transition-all duration-500 ease-in-out cursor-pointer hover:bg-primary-gradient hover:brightness-85 sm:w-auto sm:px-4"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </Suspense>
        )}

        <div className="flex flex-1 flex-col">
          {/* Catalog grid section. */}
          {isLoading ? (
            <MercadoSkeleton />
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                <div className="col-span-full rounded-2xl border border-dashed border-accent/20 bg-card/40 py-14 text-center shadow-sm/25">
                  <p className="text-button text-muted-foreground">{getEmptyStateMessage()}</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination - pushed to bottom with mt-auto */}
          {totalPages > 1 && (
            <div className="mt-auto pt-3 sm:pt-4">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                isFixed={false}
              />
            </div>
          )}
        </div>
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
