import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center h-screen bg-muted/30">
      <Card className="w-[420px] shadow-lg border border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-destructive">
            <AlertCircle size={48} />
          </div>
          <CardTitle className="text-2xl font-semibold">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don’t have permission to access this page.  
            Please go back or log in with an account that has the appropriate access.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate("/login")}>Log In</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
