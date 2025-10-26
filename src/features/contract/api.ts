import instance from "@/lib/axios";
import type {
  ContractResponse,
  CreateContractDto,
  UpdateContractDto,
  ApproveContractDto,
} from "./types";

// Mock Data for Testing
const MOCK_CONTRACTS: ContractResponse[] = [
  {
    contract_id: 1,
    contract_number: "CT-2025-001",
    quotation_id: 1,
    customer_id: 1,
    dealer_id: 1,
    user_id: 1,
    status: "PENDING_APPROVAL",
    payment_terms: "INSTALLMENT",
    deposit_amount: "100000000",
    subtotal: "650000000",
    tax_amount: "65000000",
    discount_total: "0",
    total_amount: "715000000",
    delivery_deadline: "2025-12-31",
    terms_and_conditions: "Khách hàng thanh toán trước 30% khi ký hợp đồng. Số tiền còn lại thanh toán trong vòng 12 tháng.",
    notes: "Khách hàng VIP, ưu tiên giao xe sớm",
    created_at: "2025-10-20T10:00:00Z",
    customer: {
      customer_id: 1,
      full_name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "nguyenvana@email.com",
      id_number: "001234567890",
    },
    user: {
      user_id: 1,
      full_name: "Trần Thị B",
      email: "staff1@dealer.com",
    },
    items: [
      {
        item_id: 1,
        contract_id: 1,
        variant_id: 1,
        quantity: 1,
        unit_price: "650000000",
        discount_amount: "0",
        line_total: "650000000",
        variant: {
          variant_id: 1,
          version: "VF e34 Eco",
          color: "Trắng Ngọc Trai",
          retail_price: "650000000",
        },
      },
    ],
  },
  {
    contract_id: 2,
    contract_number: "CT-2025-002",
    quotation_id: 2,
    customer_id: 2,
    dealer_id: 1,
    user_id: 2,
    status: "APPROVED",
    payment_terms: "CASH",
    deposit_amount: "200000000",
    subtotal: "1050000000",
    tax_amount: "105000000",
    discount_total: "50000000",
    total_amount: "1105000000",
    delivery_deadline: "2025-11-15",
    terms_and_conditions: "Thanh toán toàn bộ khi nhận xe. Bảo hành 10 năm theo chính sách nhà máy.",
    approved_by: 3,
    approved_at: "2025-10-22T14:30:00Z",
    signed_at: "2025-10-23T09:00:00Z",
    created_at: "2025-10-18T11:00:00Z",
    customer: {
      customer_id: 2,
      full_name: "Lê Thị C",
      phone: "0912345678",
      email: "lethic@email.com",
      id_number: "001234567891",
    },
    user: {
      user_id: 2,
      full_name: "Phạm Văn D",
      email: "staff2@dealer.com",
    },
    approver: {
      user_id: 3,
      full_name: "Hoàng Manager",
      email: "manager@dealer.com",
    },
    items: [
      {
        item_id: 2,
        contract_id: 2,
        variant_id: 11,
        quantity: 1,
        unit_price: "1050000000",
        discount_amount: "50000000",
        line_total: "1000000000",
        variant: {
          variant_id: 11,
          version: "VF 8 Eco",
          color: "Trắng Ngọc Trai",
          retail_price: "1050000000",
        },
      },
    ],
  },
  {
    contract_id: 3,
    contract_number: "CT-2025-003",
    customer_id: 3,
    dealer_id: 1,
    user_id: 1,
    status: "DRAFT",
    payment_terms: "BANK_TRANSFER",
    deposit_amount: "150000000",
    subtotal: "700000000",
    tax_amount: "70000000",
    discount_total: "0",
    total_amount: "770000000",
    delivery_deadline: "2025-12-20",
    created_at: "2025-10-25T15:00:00Z",
    customer: {
      customer_id: 3,
      full_name: "Võ Văn E",
      phone: "0923456789",
      email: "vovane@email.com",
      id_number: "001234567892",
    },
    user: {
      user_id: 1,
      full_name: "Trần Thị B",
      email: "staff1@dealer.com",
    },
    items: [
      {
        item_id: 3,
        contract_id: 3,
        variant_id: 7,
        quantity: 1,
        unit_price: "700000000",
        discount_amount: "0",
        line_total: "700000000",
        variant: {
          variant_id: 7,
          version: "VF 6 Eco",
          color: "Trắng",
          retail_price: "700000000",
        },
      },
    ],
  },
  {
    contract_id: 4,
    contract_number: "CT-2025-004",
    quotation_id: 3,
    customer_id: 4,
    dealer_id: 1,
    user_id: 2,
    status: "REJECTED",
    payment_terms: "INSTALLMENT",
    deposit_amount: "80000000",
    subtotal: "520000000",
    tax_amount: "52000000",
    discount_total: "0",
    total_amount: "572000000",
    delivery_deadline: "2025-11-30",
    terms_and_conditions: "Trả góp 24 tháng, lãi suất 0%",
    rejection_reason: "Khách hàng chưa đủ điều kiện vay tín chấp. Yêu cầu bổ sung giấy tờ chứng minh thu nhập.",
    approved_by: 3,
    approved_at: "2025-10-21T10:00:00Z",
    created_at: "2025-10-19T13:00:00Z",
    customer: {
      customer_id: 4,
      full_name: "Đặng Thị F",
      phone: "0934567890",
      email: "dangthif@email.com",
    },
    user: {
      user_id: 2,
      full_name: "Phạm Văn D",
      email: "staff2@dealer.com",
    },
    approver: {
      user_id: 3,
      full_name: "Hoàng Manager",
      email: "manager@dealer.com",
    },
    items: [
      {
        item_id: 4,
        contract_id: 4,
        variant_id: 5,
        quantity: 1,
        unit_price: "520000000",
        discount_amount: "0",
        line_total: "520000000",
        variant: {
          variant_id: 5,
          version: "VF 5 Plus Base",
          color: "Trắng",
          retail_price: "520000000",
        },
      },
    ],
  },
];

// Use mock data flag
const USE_MOCK_DATA = true;

/**
 * Get all contracts
 */
export const getContracts = async (): Promise<ContractResponse[]> => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_CONTRACTS;
  }

  const response = await instance.get("/contracts");
  return response.data.data || response.data;
};

/**
 * Get contract by ID
 */
export const getContractById = async (id: number): Promise<ContractResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const contract = MOCK_CONTRACTS.find((c) => c.contract_id === id);
    if (!contract) {
      throw new Error("Contract not found");
    }
    return contract;
  }

  const response = await instance.get(`/contracts/${id}`);
  return response.data.data;
};

/**
 * Create new contract
 */
export const createContract = async (
  data: CreateContractDto
): Promise<ContractResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newContract: ContractResponse = {
      contract_id: MOCK_CONTRACTS.length + 1,
      contract_number: `CT-2025-${String(MOCK_CONTRACTS.length + 1).padStart(3, "0")}`,
      quotation_id: data.quotationId,
      customer_id: data.customerId,
      dealer_id: 1,
      user_id: 1,
      status: "DRAFT",
      payment_terms: data.paymentTerms,
      deposit_amount: String(data.depositAmount),
      subtotal: "650000000",
      tax_amount: "65000000",
      discount_total: "0",
      total_amount: "715000000",
      delivery_deadline: data.deliveryDeadline,
      terms_and_conditions: data.termsConditions,
      notes: data.notes,
      created_at: new Date().toISOString(),
      customer: {
        customer_id: data.customerId,
        full_name: "Mock Customer",
        phone: "0901234567",
        email: "customer@email.com",
      },
      user: {
        user_id: 1,
        full_name: "Current User",
        email: "user@dealer.com",
      },
      items: [],
    };

    MOCK_CONTRACTS.push(newContract);
    return newContract;
  }

  const response = await instance.post("/contracts", data);
  return response.data.data;
};

/**
 * Update contract
 */
export const updateContract = async (
  id: number,
  data: UpdateContractDto
): Promise<ContractResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = MOCK_CONTRACTS.findIndex((c) => c.contract_id === id);
    if (index === -1) {
      throw new Error("Contract not found");
    }

    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      ...data,
      deposit_amount: data.depositAmount ? String(data.depositAmount) : MOCK_CONTRACTS[index].deposit_amount,
      updated_at: new Date().toISOString(),
    };

    return MOCK_CONTRACTS[index];
  }

  const response = await instance.patch(`/contracts/${id}`, data);
  return response.data.data;
};

/**
 * Approve or reject contract (Manager only)
 */
export const approveContract = async (
  id: number,
  data: ApproveContractDto
): Promise<ContractResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const index = MOCK_CONTRACTS.findIndex((c) => c.contract_id === id);
    if (index === -1) {
      throw new Error("Contract not found");
    }

    MOCK_CONTRACTS[index] = {
      ...MOCK_CONTRACTS[index],
      status: data.status,
      rejection_reason: data.rejectionReason,
      approved_by: 3, // Mock manager ID
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!MOCK_CONTRACTS[index].approver) {
      MOCK_CONTRACTS[index].approver = {
        user_id: 3,
        full_name: "Hoàng Manager",
        email: "manager@dealer.com",
      };
    }

    return MOCK_CONTRACTS[index];
  }

  const response = await instance.post(`/contracts/${id}/approve`, data);
  return response.data.data;
};

/**
 * Delete contract (only DRAFT)
 */
export const deleteContract = async (id: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = MOCK_CONTRACTS.findIndex((c) => c.contract_id === id);
    if (index !== -1) {
      MOCK_CONTRACTS.splice(index, 1);
    }
    return;
  }

  await instance.delete(`/contracts/${id}`);
};

/**
 * Submit contract for approval (change status from DRAFT to PENDING_APPROVAL)
 */
export const submitContractForApproval = async (
  id: number
): Promise<ContractResponse> => {
  return updateContract(id, { status: "PENDING_APPROVAL" });
};
