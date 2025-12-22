import { Form, Input, Button, Card, Typography, Alert, Space } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { login } from "@/store/slices/authSlice"

const { Title, Text } = Typography

type LoginFormValues = {
  email: string
  password: string
}

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [form] = Form.useForm<LoginFormValues>()

  const onFinish = async (values: LoginFormValues) => {
    try {
      // cast the thunk creator to any because the slice is implemented in JS and has no TS param typings
      await (dispatch((login as any)(values)) as any).unwrap()
      navigate("/")
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-3 md:px-0">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="space-y-6 w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/downloads/coeec-logo.png" alt="COEEC" className="h-12 w-12 rounded-full object-cover" />
            </div>
            <Title level={2} className="mb-2">Admin Dashboard</Title>
            <Text type="secondary">College of Electrical Engineering and Computing</Text>
          </div>

          {error && <Alert message="Login Failed" description={String(error)} type="error" showIcon closable />}

          <Form<LoginFormValues>
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" autoComplete="username" className="w-full" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="current-password" className="w-full" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full sm:w-auto" loading={loading}>
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
              Editor: editor / Editor@2025
            </Text>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
