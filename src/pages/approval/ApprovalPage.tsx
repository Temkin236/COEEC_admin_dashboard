"use client"

import { useEffect, useState } from "react"
import { Card, Tag, Button, Space, Modal, Descriptions, Input, message } from "antd"
import DataTable from "@/components/common/DataTable"
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { usePermissions } from "@/hooks/usePermissions"
import { fetchPendingApprovals, approveItem, rejectItem } from "@/store/slices/approvalSlice"
import { formatRelativeTime } from "@/utils/helpers"

const { TextArea } = Input

const ApprovalPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.approval)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")

  useEffect(() => {
    dispatch(fetchPendingApprovals() as any)
  }, [dispatch])

  const { canView, canPublish } = usePermissions()
  const hasApproveView = canView("approvals")
  const hasApprovePublish = canPublish("approvals")

  const handleView = (record: any) => {
    setSelectedItem(record)
    setViewModalOpen(true)
  }

  const handleAction = (record: any, type: "approve" | "reject") => {
    setSelectedItem(record)
    setActionType(type)
    setCommentModalOpen(true)
  }

  const submitAction = async () => {
    try {
      if (!selectedItem || !actionType) return
      if (actionType === "approve") {
        await dispatch(
          approveItem({ type: selectedItem.type, id: selectedItem.id, comment }) as any,
        ).unwrap()
        message.success("Item approved successfully")
      } else {
        await dispatch(
          rejectItem({ type: selectedItem.type, id: selectedItem.id, comment }) as any,
        ).unwrap()
        message.success("Item rejected")
      }
      setCommentModalOpen(false)
      setComment("")
    } catch (error) {
      message.error("Action failed")
    }
  }

  const columns = [
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => <Tag color="blue">{type}</Tag> },
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Submitted By", dataIndex: "submittedBy", key: "submittedBy" },
    { title: "Submitted", dataIndex: "submittedAt", key: "submittedAt", render: (date: string | Date) => formatRelativeTime(date) },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          {hasApproveView && <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />}
          {hasApprovePublish && <Button type="text" icon={<CheckOutlined />} className="text-green-600" onClick={() => handleAction(record, "approve")} />}
          {hasApprovePublish && <Button type="text" danger icon={<CloseOutlined />} onClick={() => handleAction(record, "reject")} />}
        </Space>
      ),
    },
  ]

  const mockData = [
    { id: 1, type: "News", title: "New research lab opening", submittedBy: "Dr. Abebe Kebede", submittedAt: new Date("2024-01-20"), content: "We are excited to announce the opening of our new AI research lab..." },
    { id: 2, type: "Staff Profile", title: "Profile update - Dr. Chaltu Gemechu", submittedBy: "Dr. Chaltu Gemechu", submittedAt: new Date("2024-01-19"), content: "Updated research interests and publications" },
  ]

  return (
    <div className="space-y-4">
      <Card title="Pending Approvals">
        <DataTable columns={columns as any} dataSource={mockData} loading={!!loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="View Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[<Button key="close" onClick={() => setViewModalOpen(false)}>Close</Button>]}
        width={700}
      >
        {selectedItem && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Type">{selectedItem.type}</Descriptions.Item>
            <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
            <Descriptions.Item label="Submitted By">{selectedItem.submittedBy}</Descriptions.Item>
            <Descriptions.Item label="Content">{selectedItem.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={actionType === "approve" ? "Approve Item" : "Reject Item"}
        open={commentModalOpen}
        onCancel={() => setCommentModalOpen(false)}
        onOk={submitAction}
        okText={actionType === "approve" ? "Approve" : "Reject"}
        okButtonProps={{ danger: actionType === "reject" }}
      >
        <div className="py-4">
          <p className="mb-4">Add a comment (optional):</p>
          <TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter your comment..." />
        </div>
      </Modal>
    </div>
  )
}

export default ApprovalPage
