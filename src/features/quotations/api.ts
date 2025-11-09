import instance from "@/lib/axios";

// Types
export type QuotationStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

export interface CreateQuotationItemDto {
  variantId: string;
  quantity: number;
}

export interface CreateQuotationDto {
  customerId: string;
  items: CreateQuotationItemDto[];
  notes?: string;
}

export interface UpdateQuotationDto {
  items?: CreateQuotationItemDto[];
  notes?: string;
  status?: QuotationStatus;
}

export interface QuotationItem {
  variantId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  lineTotal: number;
}

export interface Customer {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Staff {
  _id: string;
  fullName: string;
  email?: string;
}

export interface QuotationResponse {
  _id: string;
  quotationNumber: string;
  customer: Customer | string;
  dealer: string;
  staff: Staff | string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountTotal: number;
  totalAmount: number;
  notes?: string;
  status: QuotationStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListResponse {
  data: QuotationResponse[];
  total: number;
  page: number;
  limit: number;
}

// API Functions

/**
 * Tạo quotation mới
 */
export const createQuotation = async (
  data: CreateQuotationDto
): Promise<QuotationResponse> => {
  const response = await instance.post<QuotationResponse>("/quotations", data);
  return response.data;
};

/**
 * Lấy danh sách quotations
 */
export const getQuotations = async (params?: {
  page?: number;
  limit?: number;
  status?: QuotationStatus;
  customerId?: string;
}): Promise<QuotationResponse[]> => {
  const response = await instance.get<QuotationListResponse>("/quotations", {
    params,
  });
  return response.data.data || (response.data as unknown as QuotationResponse[]);
};

/**
 * Lấy chi tiết quotation
 */
export const getQuotationById = async (
  id: string
): Promise<QuotationResponse> => {
  const response = await instance.get<QuotationResponse>(`/quotations/${id}`);
  return response.data;
};

/**
 * Cập nhật quotation
 */
export const updateQuotation = async (
  id: string,
  data: UpdateQuotationDto
): Promise<QuotationResponse> => {
  const response = await instance.put<QuotationResponse>(
    `/quotations/${id}`,
    data
  );
  return response.data;
};

/**
 * Gửi quotation cho khách hàng
 */
export const sendQuotation = async (id: string): Promise<QuotationResponse> => {
  const response = await instance.post<QuotationResponse>(
    `/quotations/${id}/send`
  );
  return response.data;
};

/**
 * Phê duyệt quotation
 */
export const approveQuotation = async (
  id: string
): Promise<QuotationResponse> => {
  const response = await instance.post<QuotationResponse>(
    `/quotations/${id}/approve`
  );
  return response.data;
};

/**
 * Từ chối quotation
 */
export const rejectQuotation = async (
  id: string
): Promise<QuotationResponse> => {
  const response = await instance.post<QuotationResponse>(
    `/quotations/${id}/reject`
  );
  return response.data;
};

/**
 * Xóa quotation
 */
export const deleteQuotation = async (id: string): Promise<void> => {
  await instance.delete(`/quotations/${id}`);
};

/**
 * Export quotation PDF
 */
export const exportQuotationPDF = async (id: string): Promise<Blob> => {
  const response = await instance.get(`/quotations/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

/**
 * Download quotation PDF
 */
export const downloadQuotationPDF = async (
  id: string,
  quotationNumber: string
): Promise<void> => {
  const blob = await exportQuotationPDF(id);
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Quotation_${quotationNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
};