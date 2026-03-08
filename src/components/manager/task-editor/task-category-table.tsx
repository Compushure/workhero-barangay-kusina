'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Coins, Pencil, RefreshCw, RefreshCwOff, Trash2 } from 'lucide-react';
import type { TaskCategory } from '@/types/manager/task-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TaskTableSkeleton from './task-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskCategoryTableProps {
  tasks: TaskCategory[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (task: TaskCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleRepeatable: (taskId: string, isRepeatable: boolean) => void;
}

export default function TaskCategoryTable({
  tasks,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleRepeatable,
}: TaskCategoryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskCategory | null>(null);

  const handleDeleteClick = (task: TaskCategory) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete.id);
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border-2 border-accent/25 overflow-x-auto overflow-y-hidden shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-background border-b border-border hover:bg-background">
              <TableHead className="min-w-48 max-w-48 w-48 sm:min-w-64 sm:max-w-64 sm:w-64 md:min-w-96 md:max-w-96 md:w-96 pl-3 sm:pl-6 py-3 sm:py-4">
                <Skeleton className="h-4 w-16 bg-muted" />
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center hidden md:table-cell">
                <Skeleton className="h-4 w-12 mx-auto bg-muted" />
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center hidden md:table-cell">
                <Skeleton className="h-4 w-8 mx-auto bg-muted" />
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-32 sm:max-w-32 sm:w-32 text-center hidden sm:table-cell">
                <Skeleton className="h-4 w-18 mx-auto bg-muted" />
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-36 sm:max-w-36 sm:w-36 text-center sticky right-0 bg-background">
                <Skeleton className="h-4 w-14 mx-auto bg-muted" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TaskTableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border-2 border-accent/25 overflow-x-auto overflow-y-hidden shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-gradient hover:bg-foreground">
              <TableHead className="min-w-48 max-w-48 w-48 sm:min-w-64 sm:max-w-64 sm:w-64 md:min-w-96 md:max-w-96 md:w-96 pl-3 sm:pl-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-card">
                TASK
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center text-xs sm:text-sm font-bold text-card hidden md:table-cell">
                POINTS
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center text-xs sm:text-sm font-bold text-card hidden md:table-cell">
                XP
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-32 sm:max-w-32 sm:w-32 text-center text-xs sm:text-sm font-bold text-card hidden sm:table-cell">
                REPEATABLE
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-36 sm:max-w-36 sm:w-36 text-center text-xs sm:text-sm font-bold text-card sticky right-0 bg-primary-gradient">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <>
              {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="bg-background hover:bg-row-hover transition-colors"
                  >
                    <TableCell className="min-w-48 max-w-48 w-48 sm:min-w-64 sm:max-w-64 sm:w-64 md:min-w-96 md:max-w-96 md:w-96 pl-3 sm:pl-6 py-3 sm:py-4 align-middle">
                      <div className="truncate">
                        <div className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {task.name}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary truncate">{task.description}</div>
                        <div className="text-xs sm:text-sm text-primary font-medium px-1.5 sm:px-2 rounded-full bg-accent/15 w-fit mt-1 sm:mt-2 truncate">
                          {task.type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-sm sm:text-base text-center align-middle font-medium text-foreground hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <Coins strokeWidth={1.75} className="size-5 sm:size-6" />
                        {task.points}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-sm sm:text-base text-center align-middle font-medium text-foreground hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <span className="inline-block italic text-sm sm:text-base leading-none">XP</span>
                        {task.xp}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-24 max-w-24 w-24 sm:min-w-32 sm:max-w-32 sm:w-32 text-center align-middle text-sm sm:text-base hidden sm:table-cell">
                      <div className="flex justify-center items-center">
                        {task.isRepeatable ? (
                          <div className="flex items-center gap-1 text-foreground font-medium">
                            <RefreshCw size={16} className="sm:size-[18px] text-accent" />
                            <span className="text-xs sm:text-base">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-1.5 text-secondary">
                            <RefreshCwOff size={16} className="sm:size-[18px]" />
                            <span className="text-xs sm:text-base">No</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-24 max-w-24 w-24 sm:min-w-36 sm:max-w-36 sm:w-36 text-center align-middle sticky right-0 bg-background">
                      <div className="flex justify-center items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(task)}
                          className="size-8 sm:size-10 hover:bg-card hover:text-foreground border hover:border-accent/50 transition-colors"
                          title="Edit task"
                        >
                          <Pencil className="size-4 sm:size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(task)}
                          className="size-8 sm:size-10 hover:bg-card hover:text-red-600 border hover:border-accent/50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="size-4 sm:size-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
            </>
          </TableBody>
        </Table>

        {isError && (
          <div className="bg-background p-8 text-center">
            <div className="text-5xl mb-4">🙊</div>
            <p className="text-secondary text-xl">Woops! Kitchen Issue</p>
            <p className="text-muted-foreground text-sm mt-2">
              Something wrong happened. Try again
            </p>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="bg-background p-8 text-center">
            <div className="text-5xl mb-4">🥣</div>
            <p className="text-secondary text-xl">No task categories found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Click "Add New Category" to create one
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.name}"? This action cannot be undone
              and will remove this task category from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-foreground hover:bg-red-700 text-card"
            >
              Delete
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setTaskToDelete(null)}
              className="bg-card hover:bg-card hover:brightness-90"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
