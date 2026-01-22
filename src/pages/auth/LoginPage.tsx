import { Form, Input, Button, Card, Typography, Alert, Space, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { login, activateAccount } from "@/store/slices/authSlice"

const { Title, Text } = Typography

type LoginFormValues = {
  email?: string
  password: string
  confirmPassword?: string
}

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [form] = Form.useForm<LoginFormValues>()

  const token = searchParams.get("token")
  const isActivation = !!token

  const onFinish = async (values: LoginFormValues) => {
    try {
      if (isActivation) {
        if (values.password !== values.confirmPassword) {
          message.error("Passwords do not match!")
          return
        }
        await dispatch(activateAccount({ 
          token: token!, 
          password: values.password,
          confirmPassword: values.confirmPassword! 
        }) as any).unwrap()
        message.success("Account activated successfully! Please login.")
        setSearchParams({}) // Clear token to switch to login mode
        form.resetFields()
      } else {
        // cast the thunk creator to any because the slice is implemented in JS and has no TS param typings
        await (dispatch((login as any)(values)) as any).unwrap()
        navigate("/")
      }
    } catch (err) {
      console.error("Operation failed:", err)
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
            <Title level={2} className="mb-2">
              {isActivation ? "Activate Account" : "Admin Dashboard"}
            </Title>
            <Text type="secondary">
              {isActivation 
                ? "Please set your password to activate your account" 
                : "College of Electrical Engineering and Computing"}
            </Text>
          </div>

          {error && <Alert message="Error" description={String(error)} type="error" showIcon closable />}

          <Form<LoginFormValues>
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {!isActivation && (
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" autoComplete="username" className="w-full" />
              </Form.Item>
            )}

            <Form.Item 
              name="password" 
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="new-password" className="w-full" />
            </Form.Item>

            {isActivation && (
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" className="w-full" />
              </Form.Item>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full sm:w-auto" loading={loading}>
                {isActivation ? "Set Password & Activate" : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          {!isActivation && (
            <div className="text-center">
              <Text type="secondary" className="text-xs">
                Demo Credentials:
                <br />
                Admin: superAdmin@gmail.com / superAdmin@gmail.com
                <br />
                Staff: temari@gmail.com / 12345678
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
