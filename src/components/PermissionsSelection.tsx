import React, { useMemo } from "react"
import { Checkbox, Card, Space, Collapse, Empty, Spin } from "antd"
import type { Permission } from "@/store/slices/permissionSlice"

interface PermissionGroup {
  action: string
  permissions: Permission[]
  selectedCount: number
}

interface PermissionsSelectionProps {
  permissions: Permission[]
  selectedPermissionIds: string[]
  onPermissionChange: (permissionIds: string[]) => void
  loading?: boolean
}

export const PermissionsSelection: React.FC<PermissionsSelectionProps> = ({
  permissions,
  selectedPermissionIds,
  onPermissionChange,
  loading = false,
}) => {
  // Group permissions by action
  const permissionGroups = useMemo((): PermissionGroup[] => {
    const grouped: Record<string, Permission[]> = {}

    permissions.forEach((perm) => {
      if (!grouped[perm.action]) {
        grouped[perm.action] = []
      }
      grouped[perm.action].push(perm)
    })

    return Object.entries(grouped)
      .map(([action, perms]) => ({
        action,
        permissions: perms.sort((a, b) => a.resource.localeCompare(b.resource)),
        selectedCount: perms.filter((p) => selectedPermissionIds.includes(p.id)).length,
      }))
      .sort((a, b) => a.action.localeCompare(b.action))
  }, [permissions, selectedPermissionIds])

  const handleGroupToggle = (action: string, isChecked: boolean) => {
    const group = permissionGroups.find((g) => g.action === action)
    if (!group) return

    const groupPermIds = group.permissions.map((p) => p.id)

    if (isChecked) {
      // Add all permissions in the group
      const newSelectedIds = [
        ...new Set([...selectedPermissionIds, ...groupPermIds]),
      ]
      onPermissionChange(newSelectedIds)
    } else {
      // Remove all permissions in the group
      const newSelectedIds = selectedPermissionIds.filter(
        (id) => !groupPermIds.includes(id)
      )
      onPermissionChange(newSelectedIds)
    }
  }

  const handlePermissionToggle = (permissionId: string, isChecked: boolean) => {
    if (isChecked) {
      onPermissionChange([...selectedPermissionIds, permissionId])
    } else {
      onPermissionChange(
        selectedPermissionIds.filter((id) => id !== permissionId)
      )
    }
  }

  const getGroupCheckboxState = (action: string) => {
    const group = permissionGroups.find((g) => g.action === action)
    if (!group) return false

    if (group.selectedCount === 0) return false
    if (group.selectedCount === group.permissions.length) return true
    return "indeterminate" // Indeterminate state for partial selection
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <Empty description="No permissions available" className="py-8" />
    )
  }

  return (
    <Card
      title="Permissions"
      className="w-full"
      bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
    >
      <div className="space-y-4">
        {permissionGroups.map((group) => (
          <div key={group.action} className="border border-gray-200 rounded-lg p-4">
            {/* Group Header with Parent Checkbox */}
            <div className="mb-3 pb-3 border-b border-gray-100">
              <Checkbox
                indeterminate={
                  group.selectedCount > 0 &&
                  group.selectedCount < group.permissions.length
                }
                checked={group.selectedCount === group.permissions.length}
                onChange={(e) => handleGroupToggle(group.action, e.target.checked)}
              >
                <span className="font-semibold text-base capitalize">
                  {group.action}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({group.selectedCount}/{group.permissions.length})
                </span>
              </Checkbox>
            </div>

            {/* Individual Permission Checkboxes */}
            <div className="space-y-2 ml-6">
              {group.permissions.map((perm) => (
                <Checkbox
                  key={perm.id}
                  checked={selectedPermissionIds.includes(perm.id)}
                  onChange={(e) => handlePermissionToggle(perm.id, e.target.checked)}
                >
                  <span className="capitalize text-sm">
                    {perm.action}.{perm.resource}
                  </span>
                </Checkbox>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>{selectedPermissionIds.length}</strong> permission
          {selectedPermissionIds.length !== 1 ? "s" : ""} selected
        </p>
      </div>
    </Card>
  )
}

export default PermissionsSelection
