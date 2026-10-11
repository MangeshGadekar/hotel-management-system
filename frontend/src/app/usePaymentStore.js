import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchAllPaymentsApi, processPaymentApi } from "../apis/api";

const paymentStore = (set) => ({
  payments: [],
  loading: false,

  getAllPayments: async () => {
    set({ loading: true });
    try {
      const res = await fetchAllPaymentsApi();
      const list = Array.isArray(res) ? res : [];
      set({ payments: list, loading: false });
      return list;
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      set({ payments: [], loading: false });
      return [];
    }
  },

  recordManualPayment: async (payload) => {
    const res = await processPaymentApi(payload);
    set((state) => ({
      payments: [res, ...state.payments],
    }));
    return res;
  },
});

const usePaymentStore = create(devtools(paymentStore, { name: "payments" }));
export default usePaymentStore;