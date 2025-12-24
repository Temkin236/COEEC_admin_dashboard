"use client"

import { useEffect } from "react"
import { Card, Table, Tag } from "antd"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchResearchProjects, ResearchProject } from "@/store/slices/researchProjectsSlice"
import { formatDate } from "@/utils/helpers"

const PublicationsPage = () => {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.researchProjects)

  useEffect(() => {
    dispatch(fetchResearchProjects() as any)
  }, [dispatch])

  // Filter only published projects
  const publishedProjects = items.filter((item) => item.state === "PUBLISHED")

  const columns = [
    { 
      title: "Title", 
      dataIndex: "title", 
      key: "title", 
      ellipsis: true, 
      width: 300,
      render: (title: string) => <span className="font-medium">{title}</span>
    },
    { 
      title: "Members", 
      dataIndex: "members", 
      key: "members", 
      render: (members: any[]) => members?.map(m => m.name || m).join(", ") || "N/A"
    },
    { 
      title: "Type", 
      key: "type", 
      render: () => <Tag color="blue">Research Project</Tag> 
    },
    { 
      title: "Year", 
      dataIndex: "endDate", 
      key: "year", 
      render: (date: string) => date ? formatDate(date, "YYYY") : "Ongoing" 
    },
    {
      title: "Status",
      dataIndex: "state",
      key: "state",
      render: (state: string) => <Tag color="green">{state}</Tag>
    }
  ]

  return (
    <div className="space-y-4">
      <Card title="Published Research Projects">
        <Table 
          columns={columns as any} 
          dataSource={publishedProjects} 
          loading={loading} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
        />
      </Card>
    </div>
  )
}

export default PublicationsPage
