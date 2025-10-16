import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContractForm } from "../ConTractForm"
import { mockContracts, generateContractCode } from "../data"
import type { Contract, ContractFormData } from "../type"

export function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id && id !== "new") {
      const foundContract = mockContracts.find((c) => c.contract_id === Number.parseInt(id))
      if (foundContract) {
        setContract(foundContract)
      } else {
        toast.error("Contract not found", {
          description: "The contract you're looking for doesn't exist.",
        })
        navigate("/dealer/staff/contracts")

      }
    }
  }, [id, navigate])

  const handleSaveDraft = (data: ContractFormData) => {
    console.log("Saving draft:", data)
    setLoading(true)

    setTimeout(() => {
      const newContract: Contract = {
        contract_id: mockContracts.length + 1,
        contract_code: data.contract_code || generateContractCode(),
        customer_id: data.customer_id,
        dealer_id: 1,
        user_id: 1,
        contract_date: data.contract_date,
        delivery_date: data.delivery_date,
        contract_status: "DRAFT",
        total_amount: data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
        discount_amount: data.discount_amount,
        final_amount:
          data.items.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount_amount, 0) -
          data.discount_amount,
        payment_status: "UNPAID",
        payment_plan: data.payment_plan,
        deposit_amount: data.deposit_amount,
        remaining_amount:
          data.items.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount_amount, 0) -
          data.discount_amount -
          data.deposit_amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockContracts.push(newContract)
      console.log("Draft saved successfully:", newContract)

      setLoading(false)
      toast.success("Draft saved", {
        description: "Contract has been saved as draft.",
      })
      navigate("/dealer/staff/contracts")

    }, 500)
  }

  const handleSubmit = (data: ContractFormData) => {
    console.log("Submitting contract:", data)
    setLoading(true)

    setTimeout(() => {
      const newContract: Contract = {
        contract_id: mockContracts.length + 1,
        contract_code: data.contract_code || generateContractCode(),
        customer_id: data.customer_id,
        dealer_id: 1,
        user_id: 1,
        contract_date: data.contract_date,
        delivery_date: data.delivery_date,
        contract_status: "PENDING_SIGN",
        total_amount: data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
        discount_amount: data.discount_amount,
        final_amount:
          data.items.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount_amount, 0) -
          data.discount_amount,
        payment_status: "UNPAID",
        payment_plan: data.payment_plan,
        deposit_amount: data.deposit_amount,
        remaining_amount:
          data.items.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount_amount, 0) -
          data.discount_amount -
          data.deposit_amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockContracts.push(newContract)
      console.log("Contract submitted successfully:", newContract)

      setLoading(false)
      toast.success("Contract submitted", {
        description: "Contract has been submitted for approval.",
      })
      navigate("/dealer/staff/contracts")

    }, 500)
  }

  const handleCancel = () => {
    navigate("/dealer/staff/contracts")

  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dealer/staff/contracts")
}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Contract" : "Edit Contract"}
          </h1>
          <p className="text-muted-foreground">Fill in the details to create a vehicle sales contract</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ContractForm
            contract={contract}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
