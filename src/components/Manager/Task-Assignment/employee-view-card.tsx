"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MoreVertical, ChevronDown, X } from "lucide-react"
import type { AssignedTask } from "./task-assignment-page"

interface Employee {
  id: string
  name: string
  empId: string
  tenure?: string
  assignedTasks: AssignedTask[]
  completedAttempts?: number
}

interface EmployeeViewCardProps {
  tasks: AssignedTask[]
  searchTerm?: string // Added searchTerm prop
  onRemoveAssignment: (taskId: string, employeeId: string) => void
  onClearAllEmployeeTasks?: (employeeId: string) => void
}

export function EmployeeViewCard({
  tasks,
  searchTerm = "", // Default to empty string
  onRemoveAssignment,
  onClearAllEmployeeTasks,
}: EmployeeViewCardProps) {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    taskId: string
    empId: string
  } | null>(null)
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null)

  const employeeMap = new Map<string, Employee>()
  tasks.forEach((task) => {
    task.assignedEmployees.forEach((emp) => {
      if (!employeeMap.has(emp.id)) {
        employeeMap.set(emp.id, { ...emp, assignedTasks: [] })
      }
      const employee = employeeMap.get(emp.id)
      if (employee) {
        employee.assignedTasks.push(task)
      }
    })
  })

  const allEmployees = Array.from(employeeMap.values())
  const employees = searchTerm
    ? allEmployees.filter((emp) => {
        const searchLower = searchTerm.toLowerCase()
        return emp.name.toLowerCase().includes(searchLower) || emp.empId.toLowerCase().includes(searchLower)
      })
    : allEmployees

  if (employees.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No employees match your search.</p>
      </div>
    )
  }

  const toggleEmployeeExpand = (empId: string) => {
    const newSet = new Set(expandedEmployees)
    if (newSet.has(empId)) {
      newSet.delete(empId)
    } else {
      newSet.add(empId)
    }
    setExpandedEmployees(newSet)
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => {
        const isExpanded = expandedEmployees.has(employee.id)
        const displayedTasks = isExpanded ? employee.assignedTasks : employee.assignedTasks.slice(0, 2)
        const hiddenCount = Math.max(0, employee.assignedTasks.length - 2)

        return (
          <div key={employee.id} className="rounded-2xl bg-[#FAFAFA] p-6 shadow-sm/25">
            {/* Employee Details */}
            <div className="flex justify-between items-start mb-6 w-full">
              <div className="w-[30%]">
                <h3 className="text-xl font-bold text-[#690003]">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.empId}</p>
                {employee.tenure && <p className="text-sm text-gray-500">{employee.tenure}</p>}
              </div>

              {/* Assigned Tasks */}
              <div className="flex flex-col pl-8 pr-4 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-[#690003]">
                    Current Tasks{" "}
                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-sm ml-2">
                      {employee.assignedTasks.length}
                    </span>
                  </h4>
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => toggleEmployeeExpand(employee.id)}
                      className="text-[#690003] font-medium flex items-center gap-1 hover:underline"
                    >
                      See All <ChevronDown className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {/* Task Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayedTasks.map((task: AssignedTask) => {
                    const taskEmployee = task.assignedEmployees.find((emp) => emp.id === employee.id)
                    const completedAttempts = taskEmployee?.completedAttempts || 0

                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border-2 border-gray-300 h-full"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 truncate">
                            {task.taskName} ({completedAttempts} / {task.maxAttempts})
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(task.dateRange.start)} - {formatDate(task.dateRange.end)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-600 font-semibold">{task.points}pts</span>
                            <span className="text-xs text-gray-600 font-semibold">XP {task.xp}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowRemoveConfirm({ taskId: task.id, empId: employee.id })}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Popover
                open={openPopoverId === employee.id}
                onOpenChange={(open) => setOpenPopoverId(open ? employee.id : null)}
              >
                <div className="flex w-fit">
                  <PopoverTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="size-6" />
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent className="w-40 p-2" align="end">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setShowClearConfirm(employee.id)
                        setOpenPopoverId(null)
                      }}
                      variant="ghost"
                      className="justify-start text-red-600 hover:bg-red-50"
                    >
                      Clear All Tasks
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Unassign Task Dialog */}
            <Dialog
              open={showRemoveConfirm?.empId === employee.id}
              onOpenChange={(open) => !open && setShowRemoveConfirm(null)}
            >
              <DialogTitle className="hidden">Unassign Task to Employee</DialogTitle>
              <DialogContent className="bg-white">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#690003]">Unassign Task?</h3>
                  <p className="text-gray-600">Are you sure you want to unassign this task from this employee?</p>
                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={() => setShowRemoveConfirm(null)} className="border-gray-300">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (showRemoveConfirm) {
                          onRemoveAssignment(showRemoveConfirm.taskId, showRemoveConfirm.empId)
                          setShowRemoveConfirm(null)
                        }
                      }}
                      className="bg-[#690003] hover:bg-[#8B0000] text-white"
                    >
                      Unassign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Unassign All Tasks Dialog */}
            <Dialog open={showClearConfirm === employee.id} onOpenChange={(open) => !open && setShowClearConfirm(null)}>
              <DialogTitle></DialogTitle>
              <DialogContent className="bg-white">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#690003]">Clear All Tasks?</h3>
                  <p className="text-gray-600">
                    Are you sure you want to unassign all tasks from {employee.name}? This action cannot be undone.
                  </p>
                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={() => setShowClearConfirm(null)} className="border-gray-300">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (showClearConfirm && onClearAllEmployeeTasks) {
                          onClearAllEmployeeTasks(showClearConfirm)
                        }
                        setShowClearConfirm(null)
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      })}
    </div>
  )
}
