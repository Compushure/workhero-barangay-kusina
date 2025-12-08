/**
 * Manager Page Component (Client)
 * =================================
 * Main user management interface with CRUD operations.
 * Displays user list with add/edit/delete capabilities via modals.
 * Uses action handlers for all data operations and useTransition for smooth UX.
 */

'use client'

import { useState, useTransition, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  handleFetchUsers,
  handleAddUser,
  handleEditUser,
  handleDeleteUser,
} from '@/action-handlers/manage'
import type { User, AddUserInput, EditUserInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserCard } from './user-card'
import { AddUserModal } from './modals/add-user-modal'
import { EditUserModal } from './modals/edit-user-modal'
import { DeleteUserModal } from './modals/delete-user-modal'
import { UserPlus, LogOut, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { handleSignOut } from '@/action-handlers/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ManagerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      const fetchedUsers = await handleFetchUsers()
      setUsers(fetchedUsers)
      setIsLoading(false)
    }
    loadUsers()
  }, [])

  const onAddUser = async (data: AddUserInput): Promise<void> => {
    const newUser = await handleAddUser(data)
    if (newUser) {
      setUsers((prev) => [newUser, ...prev])
    }
  }

  const onEditUser = async (
    userId: string,
    data: EditUserInput
  ): Promise<boolean> => {
    const currentUser = users.find((u) => u.id === userId)
    if (!currentUser) return false

    const updatedUser = await handleEditUser(userId, data, currentUser.name)
    if (updatedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: data.name || u.name,
                employeeType:
                  data.employeeType && data.employeeType !== 'no-change'
                    ? data.employeeType
                    : u.employeeType,
                password: '',
              }
            : u
        )
      )
      return true
    }
    return false
  }

  const onDeleteUser = async (): Promise<boolean> => {
    if (!selectedUser) return false

    const success = await handleDeleteUser(selectedUser.id, selectedUser.name)
    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      setSelectedUser(null)
      return true
    }
    return false
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleLogout = () => {
    startTransition(async () => {
      const { error } = await handleSignOut()
      if (!error) {
        router.push('/admin')

        toast.success('Logged out', {
          description: 'You have successfully logged out.',
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAddModalOpen(true)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isPending}
                className="gap-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No users found</p>
            <Button onClick={() => setAddModalOpen(true)}>
              Add your first user
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddUser={onAddUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            user={selectedUser}
            onEditUser={onEditUser}
          />

          <DeleteUserModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            userName={selectedUser.name}
            onConfirm={onDeleteUser}
          />
        </>
      )}
    </div>
  )
}
