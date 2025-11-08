import axiosInstance from "@/lib/axios"; // file axios.ts của bạn
import { type Contract } from "../../features/contract/types";

export const ContractService = {
  fetchContracts: async (): Promise<Contract[]> => {
    const res = await axiosInstance.get("/contracts");
    return res.data.data;
  },

  fetchContractById: async (id: number): Promise<Contract> => {
    const res = await axiosInstance.get(`/contracts/${id}`);
    return res.data.data;
  },

  approveContract: async (id: number) => {
    const res = await axiosInstance.patch(`/contracts/${id}/approve`);
    return res.data.data;
  },

  deliverContract: async (id: number, payload: any) => {
    const res = await axiosInstance.post(`/contracts/${id}/deliver`, payload);
    return res.data;
  },

  makePayment: async (id: number, amount: number, method: string) => {
    const res = await axiosInstance.post(`/contracts/${id}/pay`, { amount, method });
    return res.data;
  },

  createFromQuotation: async (id: number, payload: any) => {
    const res = await axiosInstance.post(`/contracts/from-quotation/${id}`, payload);
    return res.data.data;
  },

  createManual: async (payload: any) => {
    const res = await axiosInstance.post("/contracts/manual", payload);
    return res.data.data;
  },

  uploadAttachment: async (id: number, payload: { type: string; file_url: string }) => {
    const res = await axiosInstance.post(`/contracts/${id}/attachments`, payload);
    return res.data;
  },

  fetchQuotationById: async (id: number) => {
  const res = await axiosInstance.get(`/quotations/${id}`);
  return res.data.data;
}
};
