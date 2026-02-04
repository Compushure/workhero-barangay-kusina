'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Task {
  title: string;
  progress: string;
  reward: string;
  dueDate: string;
}

export default function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Tasks</h2>
        <Button variant="outline" size="sm">
          Sort
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Task</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{task.progress}</TableCell>
              <TableCell>{task.reward}</TableCell>
              <TableCell>{task.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
