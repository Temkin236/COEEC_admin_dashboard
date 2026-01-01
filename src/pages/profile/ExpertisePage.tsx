"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CloseOutlined, PlusOutlined } from "@ant-design/icons"
import { Card, Form, Input, Button, Tag, Row, Col } from "antd"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchphoto } from "@/store/slices/profileSlice"

const PRESET_EXPERTISE = [
  "Machine Learning",
  "Artificial Intelligence",
  "Deep Learning",
  "Computer Vision",
  "Software Engineering",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "Embedded Systems",
  "IoT Systems",
  "Networking",
  "Distributed Systems",
  "Educational Technology",
  "Signal Processing",
  "Information Systems",
]

export default function AreasOfExpertise() {
  const dispatch = useAppDispatch()
  const { data: storedphoto } = useAppSelector((s) => s.photo)
  const [expertise, setExpertise] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const photo = (storedphoto as any)?.id ?? (storedphoto as any)?._id

  useEffect(() => {
    if (photo) dispatch(fetchphoto(photo))
  }, [dispatch, photo])

  useEffect(() => {
    if (storedphoto) {
      setExpertise(Array.isArray(storedphoto.researchAreas) ? storedphoto.researchAreas : [])
    }
  }, [storedphoto])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim()) {
      const filtered = PRESET_EXPERTISE.filter(
        (item) => item.toLowerCase().includes(value.toLowerCase()) && !expertise.includes(item),
      )
      setFilteredOptions(filtered)
      setShowDropdown(true)
    } else {
      setFilteredOptions([])
      setShowDropdown(false)
    }
  }

  const addExpertise = (item: string) => {
    if (!expertise.includes(item)) {
      setExpertise([...expertise, item])
    }
    setInputValue("")
    setFilteredOptions([])
    setShowDropdown(false)
  }

  const handleCustomAdd = () => {
    if (inputValue.trim() && !expertise.includes(inputValue)) {
      setExpertise([...expertise, inputValue])
      setInputValue("")
      setFilteredOptions([])
      setShowDropdown(false)
    }
  }

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item))
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fafcfd]">
      <Row gutter={32}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h2 className="font-bold text-xl" style={{ color: '#18485e', margin: 0, fontWeight: 700, letterSpacing: 0.2 }}>Select Expertise</h2>
                <div>
                  <Button
                    type="primary"
                    size="small"
                    style={{ background: '#17A2B8', borderRadius: 6, fontWeight: 500 }}
                    onClick={() => console.log('Save')}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <Form layout="vertical">
                <Form.Item label={<span style={{ fontWeight: 600 }}>Areas of Expertise</span>}>
                  <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {expertise.map((item) => (
                      <Tag
                        key={item}
                        closable
                        onClose={() => removeExpertise(item)}
                        style={{
                          background: '#fafdfe',
                          border: '1.5px solid #17A2B8',
                          color: '#17A2B8',
                          fontWeight: 500,
                          fontSize: 15,
                          borderRadius: 20,
                          padding: '4px 16px',
                          marginBottom: 8,
                        }}
                      >
                        {item}
                      </Tag>
                    ))}
                    <span style={{ color: '#b0b0b0', alignSelf: 'center', fontSize: 15 }}>typeToSearchOrAdd</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input size="large" placeholder="addCustomExpertise" value={inputValue} onChange={handleInputChange} onFocus={() => setShowDropdown(true)} />
                    <Button type="primary" icon={<PlusOutlined />} size="large" style={{ background: '#17A2B8', borderRadius: 6 }} onClick={handleCustomAdd}>Add</Button>
                  </div>

                  {showDropdown && filteredOptions.length > 0 && (
                    <div style={{ marginTop: 8, background: '#fff', border: '1px solid #e6e6e6', borderRadius: 6 }}>
                      {filteredOptions.map((opt) => (
                        <Button key={opt} type="text" block onClick={() => addExpertise(opt)} style={{ textAlign: 'left', padding: '8px 12px' }}>{opt}</Button>
                      ))}
                    </div>
                  )}
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", padding: 0 }}>
            <div className="p-8">
              <h2 className="font-bold text-lg mb-6" style={{ color: '#18485e' }}>Preview</h2>
              <div style={{ background: '#eaf4f7', borderRadius: 12, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 18, color: '#18485e', fontWeight: 700, fontSize: 20 }}>Expertise Areas</h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {expertise.length > 0 ? expertise.map((item) => (
                    <Tag key={item} style={{ background: '#fafdfe', color: '#17A2B8', border: '1.5px solid #17A2B8', fontWeight: 500, fontSize: 15, borderRadius: 20, padding: '4px 16px' }}>{item}</Tag>
                  )) : <div style={{ color: '#6b7280' }}>No expertise areas added yet</div>}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
