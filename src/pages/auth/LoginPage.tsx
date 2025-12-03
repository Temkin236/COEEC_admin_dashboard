import { Form, Input, Button, Card, Typography, Alert, Space } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { login } from "@/store/slices/authSlice"

const { Title, Text } = Typography

type LoginValues = { email: string; password: string }

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [form] = Form.useForm<LoginValues>()

  const onFinish = async (values: LoginValues) => {
    try {
      await dispatch(login(values) as any).unwrap()
      navigate("/")
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/downloads/coeec-logo.png"
                alt="COEEC"
                className="h-16 w-16 rounded-full object-cover shadow-sm border border-neutral-200"
              />
            </div>
            <Title level={2} className="mb-2">
              Admin Dashboard
            </Title>
            <Text type="secondary">College of Electrical Engineering and Computing</Text>
          </div>

          {error && <Alert message="Login Failed" description={String(error)} type="error" showIcon closable />}

          <Form<LoginValues>
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{ email: "admin@astu.edu.et", password: "Admin@2025" }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" autoComplete="username" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="current-password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Text type="secondary" className="text-xs">
              Demo Credentials:
              <br />
              Admin: admin@astu.edu.et / Admin@2025
              <br />
              Editor: editor@astu.edu.et / Editor@2025
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default LoginPage
