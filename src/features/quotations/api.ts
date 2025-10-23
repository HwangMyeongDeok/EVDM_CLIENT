import instance from "@/lib/axios";
import type { IQuotation } from "@/types/quotation";

export const getQuotations = async (): Promise<IQuotation[]> => {
  const res = await instance.get("/quotations");
  return res.data.data;
};

export const getQuotationById = async (id: string): Promise<IQuotation> => {
  const res = await instance.get(`/quotations/${id}`);
  return res.data.data;
};

export const createQuotation = async (data: Partial<IQuotation>) => {
  const res = await instance.post("/quotations", data);
  return res.data;
};

export const updateQuotation = async (id: string, data: Partial<IQuotation>) => {
  const res = await instance.patch(`/quotations/${id}`, data);
  return res.data;
};

export const deleteQuotation = async (id: string) => {
  const res = await instance.delete(`/quotations/${id}`);
  return res.data;
};

export const exportQuotationPDF = async (id: string) => {
  const res = await instance.get(`/quotations/${id}/export`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `quotation_${id}.pdf`;
  link.click();
  window.URL.revokeObjectURL(blobUrl);
};

export const sendQuotationEmail = async (id: string) => {
  const res = await instance.post(`/quotations/${id}/send-email`);
  return res.data;
};
