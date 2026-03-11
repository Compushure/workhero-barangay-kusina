'use client';

import React from 'react';

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
import {
  Coins,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
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
import BadgeTableSkeleton from './badge-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import type { Badge, BadgeOption, BadgeInterval } from '@/types/manager/badge-editor';

interface BadgeTableProps {
  badges: Badge[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (badge: Badge) => void;
  onDelete: (badgeId: string) => void;
  taskOptions?: BadgeOption[];
  attributeOptions?: BadgeOption[];
  attendanceOptions?: BadgeOption[];
}

export default function BadgeTable({
  badges,
  isLoading,
  isError,
  onEdit,
  onDelete,
  taskOptions = [],
  attributeOptions = [],
  attendanceOptions = [],
}: BadgeTableProps) {
  const formatIntervalLabel = (value: BadgeInterval) => {
    if (value === 'none') return 'Manual';
    if (value === 'anually') return 'Annually';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatCreatedDate = (value?: string | null) => {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null);
  const [expandedBadgeId, setExpandedBadgeId] = useState<string | null>(null);

  const handleDeleteClick = (badge: Badge) => {
    setBadgeToDelete(badge);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (badgeToDelete) {
      onDelete(badgeToDelete.id);
    }
    setDeleteDialogOpen(false);
    setBadgeToDelete(null);
  };

  const toggleExpand = (badgeId: string) => {
    setExpandedBadgeId(expandedBadgeId === badgeId ? null : badgeId);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-sm/25">
        <Table>
          <TableHeader>
            <TableRow className="bg-background border-b border-border hover:bg-background">
              <TableHead className="min-w-48 sm:min-w-64 md:min-w-96 pl-4 sm:pl-6 py-3 sm:py-4">
                <Skeleton className="h-4 w-20 bg-gray-300" />
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-20 max-w-20 w-20 text-center">
                <Skeleton className="h-4 w-12 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-32 max-w-32 w-32 text-center">
                <Skeleton className="h-4 w-16 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="hidden sm:table-cell min-w-20 sm:min-w-24 text-center">
                <Skeleton className="h-4 w-16 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="text-center px-2 sm:px-4 w-24 sm:w-30 sticky right-0">
                <Skeleton className="h-4 w-14 mx-auto bg-gray-300" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <BadgeTableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-sm/25">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-gradient">
              <TableHead className="min-w-48 sm:min-w-64 md:min-w-84 pl-3 sm:pl-5 py-2 sm:py-3 text-left text-2xs sm:text-xs font-bold text-card">
                BADGE
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-20 max-w-20 w-20 text-center text-2xs sm:text-xs font-bold text-card">
                POINTS
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-32 max-w-32 w-32 text-center text-2xs sm:text-xs font-bold text-card">
                INTERVAL
              </TableHead>
              <TableHead className="hidden sm:table-cell min-w-20 sm:min-w-24 text-center text-2xs sm:text-xs font-bold text-card">
                CONDITIONS
              </TableHead>
              <TableHead className="text-card text-center px-3 sm:px-6 w-20 sm:w-24 text-2xs sm:text-xs sticky right-0">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <>
              {badges.map((badge) => (
                <React.Fragment key={badge.id}>
                  <TableRow className="bg-card hover:bg-row-hover transition-colors">
                    <TableCell className="min-w-48 sm:min-w-64 md:min-w-84 pl-3 sm:pl-4 py-2 sm:py-3 align-middle">
                      <div className="flex items-start gap-1.5 sm:gap-3">
                        {/* Badge Icon */}
                        <div className="shrink-0 size-12 sm:size-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-accent/25">
                          {badge.img_link ? (
                            <img
                              src={badge.img_link || '/placeholder.svg'}
                              alt={badge.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HelpCircle size={24} className="text-gray-400" />
                          )}
                        </div>
                        {/* Badge Info */}
                        <div className="flex-1 truncate">
                          <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                            {badge.name}
                          </div>
                          <div className="text-2xs sm:text-xs text-secondary truncate mt-0.5">
                            {badge.description || 'No description'}
                          </div>
                          <div className="text-[8px] sm:text-2xs text-primary font-medium px-1.5 rounded-full bg-accent/15 w-fit mt-1.5">
                            {formatIntervalLabel(badge.award_at_interval)}
                          </div>
                          {badge.conditions.length === 0 && badge.award_at_interval !== 'none' && (
                            <div
                              className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900"
                              title="No conditions configured; badge is treated as manual"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              No conditions — treated as manual
                            </div>
                          )}
                          <div className="text-[10px] sm:text-xs text-secondary mt-2 hidden sm:block">
                            <span className="font-semibold">Created:</span>{' '}
                            {formatCreatedDate(badge.created_at)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-secondary hidden sm:block">
                            <span className="font-semibold">By:</span>{' '}
                            {badge.created_by_name || 'System Default'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell min-w-20 max-w-20 w-20 text-xs sm:text-sm text-center align-middle font-medium text-foreground">
                      <div className="flex items-center justify-center gap-0.5">
                        <Coins strokeWidth={1.75} className="size-3.5 sm:size-4" />
                        {badge.points}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell min-w-32 max-w-32 w-32 text-center align-middle text-xs sm:text-sm">
                      <div className="text-foreground font-medium">
                        {formatIntervalLabel(badge.award_at_interval)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell min-w-20 sm:min-w-24 text-center align-middle text-2xs sm:text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(badge.id)}
                        className="text-foreground hover:bg-foreground/10 p-1 sm:p-2"
                      >
                        <span className="mr-1">{badge.conditions.length}</span>
                        {expandedBadgeId === badge.id ? (
                          <ChevronUp size={14} className="sm:size-4" />
                        ) : (
                          <ChevronDown size={14} className="sm:size-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center align-middle sticky right-0 px-4 sm:px-6">
                      <div className="flex justify-center items-center gap-0.5 sm:gap-1">
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(badge)}
                        className="size-7 sm:size-9 hover:bg-card hover:text-foreground border hover:border-accent/50 transition-colors"
                        title="Edit task"
                      >
                        <Pencil className="size-3 sm:size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(badge)}
                        className="size-7 sm:size-9 hover:bg-card hover:text-red-600 border hover:border-accent/50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="size-3 sm:size-4" />
                      </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(badge)}
                          className="hover:bg-foreground/10 hover:text-foreground transition-colors p-1.5 sm:p-2 size-8 sm:size-10"
                          title="Edit badge"
                        >
                          <Pencil className="size-4 sm:size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(badge)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors p-1.5 sm:p-2 size-8 sm:size-10"
                          title="Delete badge"
                        >
                          <Trash2 className="size-4 sm:size-5" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded conditions row */}
                  {expandedBadgeId === badge.id && badge.conditions.length > 0 && (
                    <TableRow className="bg-background">
                      <TableCell colSpan={5} className="pl-12 py-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-foreground">Conditions:</h4>
                          <div className="max-h-64 overflow-y-auto border border-accent/25 rounded-lg bg-card divide-y divide-accent/25 [scrollbar-width:none] sm:[scrollbar-width:auto] [-ms-overflow-style:none] sm:[-ms-overflow-style:auto] [&::-webkit-scrollbar]:hidden sm:[&::-webkit-scrollbar]:block">
                            {badge.conditions.map((condition, idx) => {
                              const getSpecificName = () => {
                                if (condition.requirement_type === 'task') {
                                  return (
                                    taskOptions.find((t) => t.id === condition.requirement_attrb_id)
                                      ?.name ||
                                    condition.requirement_attrb_id ||
                                    'Unknown Task'
                                  );
                                } else if (condition.requirement_type === 'attribute') {
                                  return (
                                    attributeOptions.find(
                                      (a) => a.id === condition.requirement_attrb_id
                                    )?.name ||
                                    condition.requirement_attrb_id ||
                                    'Unknown Attribute'
                                  );
                                } else if (condition.requirement_type === 'attendance') {
                                  return (
                                    attendanceOptions.find(
                                      (a) => a.id === condition.requirement_attrb_id
                                    )?.name ||
                                    condition.requirement_attrb_id ||
                                    'Unknown Type'
                                  );
                                }
                                return 'Unknown';
                              };

                              const getConditionText = () => {
                                const specificName = getSpecificName();
                                const operatorTextMap: Record<string, string> = {
                                  '=': 'is equal to',
                                  '>': 'is greater than',
                                  '<': 'is less than',
                                  '>=': 'is greater than or equal to',
                                  '<=': 'is less than or equal to',
                                  '!=': 'is not equal to',
                                };
                                const operatorText =
                                  operatorTextMap[condition.requirement_operator] ||
                                  condition.requirement_operator;

                                if (condition.requirement_type === 'task') {
                                  return `When the Task '${specificName}' ${operatorText} ${condition.requirement_attrb_value}`;
                                } else if (condition.requirement_type === 'attribute') {
                                  return `When User ${specificName} attribute ${operatorText} ${condition.requirement_attrb_value}`;
                                } else if (condition.requirement_type === 'attendance') {
                                  return `When Attendance Value ${specificName} ${operatorText} ${condition.requirement_attrb_value}`;
                                }
                                return 'Condition';
                              };

                              return (
                                <div
                                  key={condition.id}
                                  className="px-4 py-3 hover:bg-row-hover transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-6 text-center">
                                      <span className="font-semibold text-foreground text-sm">
                                        {idx + 1}.
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-foreground text-sm">
                                          {condition.requirement_type.charAt(0).toUpperCase() +
                                            condition.requirement_type.slice(1)}
                                        </span>
                                        <span className="text-xs bg-accent/15 text-primary px-2 py-0.5 rounded">
                                          {getSpecificName()}
                                        </span>
                                      </div>
                                      <p className="text-xs text-secondary leading-relaxed">
                                        {getConditionText()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {expandedBadgeId === badge.id && badge.conditions.length === 0 && (
                    <TableRow className="bg-background">
                      <TableCell colSpan={5} className="pl-12 py-4">
                        <div className="text-sm text-secondary italic">
                          No conditions - This badge is awarded manually
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </>
          </TableBody>
        </Table>

        {isError && (
          <div className="bg-background-soft p-8 text-center">
            <div className="text-5xl mb-4">🙊</div>
            <p className="text-secondary text-xl">Woops! Kitchen Issue</p>
            <p className="text-muted-foreground text-sm mt-2">
              Something wrong happened. Try again
            </p>
          </div>
        )}

        {!isLoading && badges.length === 0 && (
          <div className="bg-background-soft p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-secondary text-xl">No badges found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Click &quot;Add New Badge&quot; to create one
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{badgeToDelete?.name}&quot;? This action cannot
              be undone and will remove this badge and all its conditions from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBadgeToDelete(null)}>Cancel</AlertDialogCancel>
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
