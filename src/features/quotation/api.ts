import instance from "@/lib/axios";

// Types


export interface CreateQuotationItemDto {
  variantId: number;
  quantity: number;
}

export interface CreateQuotationDto {
  customerId: number;
  items: CreateQuotationItemDto[];
  notes?: string;
}

export interface UpdateQuotationDto {
  notes?: string;
  discount_total?: number;
  total_amount?: number;
}

export interface QuotationItem {
  item_id: number;
  quotation_id: number;
  variant_id: number;
  description?: string;
  quantity: number;
  unit_price: string;
  discount_amount: string;
  line_total: string;
  variant?: {
    variant_id: number;
    vehicle_id: number;
    version: string;
    color: string;
    dealer_price: string;
    base_price: string;
    retail_price: string;
    discount_percent: string;
    model_year: number;
    battery_capacity_kwh: string;
    range_km: number;
    motor_power_kw: string;
    acceleration_0_100: string;
    top_speed_kmh: number;
    charging_time_hours: string;
    status: string;
  };
}

export interface Customer {
  customer_id: number;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  dealer_id: number;
  created_at?: string;
}

export interface Dealer {
  dealer_id: number;
  dealer_name: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
}

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  dealer_id?: number;
  created_at?: string;
}

export interface QuotationResponse {
  quotation_id: number;
  quotation_number: string;
  customer_id: number;
  dealer_id: number;
  user_id: number;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  discount_total: string;
  total_amount: string;
  notes?: string;
  approved_by?: number | null;
  created_at: string;
  updated_at?: string | null;
  customer?: Customer;
  dealer?: Dealer;
  user?: User;
  items: QuotationItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

// API Functions

/**
 * Tạo quotation mới
 */
export const createQuotation = async (
  data: CreateQuotationDto
): Promise<QuotationResponse> => {
  console.log("createQuotation called with data:", data);
  console.log("Request URL:", "/quotations");
  
  try {
    const response = await instance.post<ApiResponse<QuotationResponse>>("/quotations", data);
    console.log("createQuotation response:", response);
    return response.data.data!;
  } catch (error) {
    console.error("createQuotation error:", error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string } };
      console.error("Error response data:", axiosError.response?.data);
      console.error("Error response status:", axiosError.response?.status);
    }
    throw error;
  }
};

/**
 * Lấy danh sách quotations
 */
export const getQuotations = async (): Promise<QuotationResponse[]> => {
  try {
    const response = await instance.get("/quotations");
    
    // Handle different response structures
    if (response.data.data) {
      return response.data.data;
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết quotation
 */
export const getQuotationById = async (
  id: number
): Promise<QuotationResponse> => {
  const response = await instance.get<ApiResponse<QuotationResponse>>(`/quotations/${id}`);
  return response.data.data!;
};

/**
 * Cập nhật quotation
 */
export const updateQuotation = async (
  id: number,
  data: UpdateQuotationDto
): Promise<QuotationResponse> => {
  const response = await instance.patch<ApiResponse<QuotationResponse>>(
    `/quotations/${id}`,
    data
  );
  return response.data.data!;
};

/**
 * Xóa quotation (chỉ được xóa khi status = DRAFT)
 */
export const deleteQuotation = async (id: number): Promise<void> => {
  await instance.delete(`/quotations/${id}`);
};

/**
 * Export quotation PDF (nếu backend support)
 */
export const exportQuotationPDF = async (id: number): Promise<Blob> => {
  const response = await instance.get(`/quotations/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

/**
 * Download quotation PDF
 */
export const downloadQuotationPDF = async (
  id: number,
  quotationNumber: string
): Promise<void> => {
  try {
    const blob = await exportQuotationPDF(id);
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Quotation_${quotationNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF export not supported or error:", error);
    throw new Error("PDF export is not available");
  }
};
