'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
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

interface TaskCategoryTableProps {
  tasks: TaskCategory[];
  isLoading: boolean;
  onEdit: (task: TaskCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleRepeatable: (taskId: string, isRepeatable: boolean) => void;
}

export default function TaskCategoryTable({
  tasks,
  isLoading,
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
      <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#690003] hover:bg-[#690003]">
              <TableHead className="min-w-75 py-4 pl-5 text-left text-sm font-bold text-white">
                TASK
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">
                POINTS
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">XP</TableHead>
              <TableHead className="w-40 text-center text-sm font-bold text-white">
                REPEATABLE
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse mx-auto w-10"></div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-300 p-12 text-center">
        <p className="text-gray-500 text-lg">No task categories found</p>
        <p className="text-gray-400 text-sm mt-2">Click "Add New Category" to create one</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#690003] hover:bg-[#690003]">
              <TableHead className="min-w-75 py-4 text-left text-sm font-bold text-white">
                TASK
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">
                POINTS
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">XP</TableHead>
              <TableHead className="w-40 text-center text-sm font-bold text-white">
                REPEATABLE
              </TableHead>
              <TableHead className="w-32 text-center text-sm font-bold text-white">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-zinc-800">{task.name}</div>
                    <div className="text-sm text-zinc-500 font-medium">{task.type}</div>
                    <div className="text-sm text-zinc-600">{task.description}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium text-zinc-800">
                  {task.points}
                </TableCell>
                <TableCell className="text-center font-medium text-zinc-800">{task.xp}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Switch
                      checked={task.isRepeatable}
                      onCheckedChange={(checked) => onToggleRepeatable(task.id, checked)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="hover:bg-[#690003]/10 hover:text-[#690003] transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(task)}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
