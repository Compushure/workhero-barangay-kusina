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

  return (
    <>
      <div className="bg-[#FBF4E8] rounded-2xl border-2 border-gray-300 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#690003] hover:bg-[#690003]">
              <TableHead className="min-w-96 max-w-96 w-96 pl-6 py-4 text-left text-sm font-bold text-card">
                TASK
              </TableHead>
              <TableHead className="min-w-20 max-w-20 w-20 text-center text-sm font-bold text-card">
                POINTS
              </TableHead>
              <TableHead className="min-w-20 max-w-20 w-20 text-center text-sm font-bold text-card">
                XP
              </TableHead>
              <TableHead className="min-w-32 max-w-32 w-32 text-center text-sm font-bold text-card">
                REPEATABLE
              </TableHead>
              <TableHead className="min-w-36 max-w-36 w-36 text-center text-sm font-bold text-card">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { isLoading ? (
              <TaskTableSkeleton/>
            ) : (
            <>
              {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="min-w-96 max-w-96 w-96 pl-6 py-4 align-middle">
                  <div className="truncate">
                    <div className="font-semibold text-base text-red-950 truncate">{task.name}</div>
                    <div className="text-sm text-amber-900 truncate">{task.description}</div>
                    <div className="text-sm text-red-900 font-medium px-2 rounded-full bg-[#fdeac8] w-fit mt-2 truncate">{task.type}</div>
                  </div>
                </TableCell>
                <TableCell className="min-w-20 max-w-20 w-20 text-base text-center align-middle font-medium text-red-950">
                  <div className="flex items-center justify-center gap-1">
                    <Coins strokeWidth={1.75} className="size-6" />
                    {task.points}
                  </div>
                </TableCell>
                <TableCell className="min-w-20 max-w-20 w-20 text-base text-center align-middle font-medium text-red-950">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block italic text-base leading-none">XP</span>
                    {task.xp}
                  </div>
                </TableCell>
                <TableCell className='min-w-32 max-w-32 w-32 text-center align-middle text-base'>
                  <div className="flex justify-center items-center">
                    {task.isRepeatable ? (
                      <div className='flex items-center gap-1 text-red-950 font-medium'>
                        <RefreshCw size={18}/>
                        <span>Yes</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-1.5 text-zinc-500'>
                        <RefreshCwOff size={18}/>
                        <span>No</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className='min-w-36 max-w-36 w-36 text-center align-middle'>
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="hover:bg-[#690003]/10 hover:text-[#690003] transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(task)}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              ))}
            </>
            )}
          </TableBody>
        </Table>

        { isError && (
          <div className="bg-background p-8 text-center">
            <div className='text-5xl mb-4'>🙊</div>
            <p className="text-zinc-500 text-xl">Woops! Kitchen Issue</p>
            <p className="text-zinc-400 text-sm mt-2">Something wrong happened. Try again</p>
          </div>
        )}
        
        { !isLoading && tasks.length === 0 && (
          <div className="bg-background p-8 text-center">
            <div className='text-5xl mb-4'>🥣</div>
            <p className="text-zinc-500 text-xl">No task categories found</p>
            <p className="text-zinc-400 text-sm mt-2">Click "Add New Category" to create one</p>
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
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-foreground hover:bg-red-700 text-card"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
