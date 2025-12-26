import { Space, Button, Popconfirm, Tooltip } from "antd"
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { usePermissions } from "@/hooks/usePermissions"
import { useAppSelector } from "@/store/hooks"

// Helper to read nested owner field like "createdBy.id"
const getNested = (obj: any, path: string) => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj)
}

interface TableActionsProps {
  resource: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleteConfirmTitle?: string
  deleteConfirmDescription?: string
  record?: any
  allowEditIfOwner?: boolean
  ownerIdField?: string // e.g., 'createdById' or 'createdBy.id'
}

const TableActions = ({
  resource,
  onView,
  onEdit,
  onDelete,
  deleteConfirmTitle = "Delete this item?",
  deleteConfirmDescription = "This action cannot be undone.",
  record,
  allowEditIfOwner = false,
  ownerIdField,
}: TableActionsProps) => {
  const { canView, canUpdate, canDelete } = usePermissions()
  const user = useAppSelector((s: any) => s.auth.user)

  const hasView = canView(resource)
  let hasUpdate = canUpdate(resource)
  let hasDelete = canDelete(resource)

  // If owner-based override is allowed, enable update/delete for record owner
  if (record && allowEditIfOwner) {
    const ownerId = ownerIdField ? getNested(record, ownerIdField) : record.createdById || record.createdBy?.id
    if (ownerId && user?.id && ownerId === user.id) {
      hasUpdate = true
      hasDelete = true
    }
  }

  // If no permissions at all, return null
  if (!hasView && !hasUpdate && !hasDelete) {
    return <span className="text-gray-400 text-xs">No access</span>
  }

  return (
    <Space size="small">
      {hasView && onView && (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={onView}
            size="small"
          />
        </Tooltip>
      )}

      {hasUpdate && onEdit && (
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={onEdit}
            size="small"
            className="text-blue-600 hover:text-blue-700"
          />
        </Tooltip>
      )}

      {hasDelete && onDelete && (
        <Popconfirm
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          onConfirm={onDelete}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Tooltip>
        </Popconfirm>
      )}
    </Space>
  )
}

export default TableActions
