import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"  // Thêm useLocation
import type { AppDispatch, RootState } from "@/app/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/features/auth/api"
import { Car } from "lucide-react"
import type { UserRole } from "@/types/enums"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation() 
  const { loading } = useSelector((state: RootState) => state.auth)

  const getDashboardPath = (role: UserRole): string => {
    const map: Record<UserRole, string> = {
      DEALER_STAFF: "/dealer/staff/dashboard",
      DEALER_MANAGER: "/dealer/manager/dashboard",
      EVM_STAFF: "/evm/dashboard",
      ADMIN: "/admin/dashboard",
    }
    return map[role] || "/unauthorized"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const resultAction = await dispatch(login({ email, password }))
    if (login.fulfilled.match(resultAction)) {
      const { user } = resultAction.payload 
      const from = location.state?.from?.pathname || "/"  

      if (from === "/" || !user) {
        navigate(getDashboardPath(user.role as UserRole), { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } else {
      setError(
        (resultAction.payload as string) || "Login failed. Please try again."
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">EV DMS Login</CardTitle>
          <CardDescription>
            Sign in with your dealer or EVM account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}