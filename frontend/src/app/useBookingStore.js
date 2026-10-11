import { devtools, persist } from "zustand/middleware";
import { create } from "zustand";
import {
  cancelBooking as apiCancelBooking,
  createBooking as apiCreateBooking,
  fetchAllBooking as apiFetchAllBooking,
  fetchBooking as apiFetchBooking,
  updateBookingApi,
  checkInGuestApi,
  checkOutGuestApi,
  fetchActiveExtraServices,
  processPaymentApi,
} from "../apis/api";

const bookingStore = (set) => ({
  bookingList: [],
  booking: {},
  extraServices: [],

  addBooking: async (data) => {
    try {
      const res = await apiCreateBooking(data);
      set((state) => ({
        bookingList: [res, ...state.bookingList],
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  updateBooking: async (id, data) => {
    try {
      const res = await updateBookingApi(id, data);
      set((state) => ({
        bookingList: state.bookingList.map((b) => (b.id === id ? res : b)),
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  checkInBooking: async (id) => {
    try {
      const updated = await checkInGuestApi(id);
      set((state) => ({
        bookingList: state.bookingList.map((b) =>
          b.id === id
            ? { ...b, ...updated, bookingStatus: "CHECKED_IN" }
            : b
        ),
      }));
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Direct checkout (Full payment completed: balanceDue <= 0)
  checkOutDirect: async (id) => {
    try {
      const updated = await checkOutGuestApi(id);
      set((state) => ({
        bookingList: state.bookingList.map((b) =>
          b.id === id
            ? { ...b, ...updated, bookingStatus: "CHECKED_OUT" }
            : b
        ),
      }));
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Settle balance payment via PaymentController, then check out
  settleAndCheckOut: async (bookingId, dueAmount, paymentMethod) => {
    try {
      // 1. Clear the balance through PaymentController (/api/payments/pay)
      if (dueAmount && dueAmount > 0) {
        await processPaymentApi({
          bookingId: bookingId,
          amount: dueAmount,
          paymentType: "SPLIT_BALANCE",
          paymentMethod: paymentMethod || "CASH",
        });
      }

      // 2. Complete check-out now that balanceDue is 0.00
      const checkoutResponse = await checkOutGuestApi(bookingId);

      // 3. Update Zustand store state
      set((state) => ({
        bookingList: state.bookingList.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                ...checkoutResponse,
                balanceDue: 0,
                bookingStatus: "CHECKED_OUT",
              }
            : b
        ),
      }));

      return checkoutResponse;
    } catch (error) {
      throw error;
    }
  },

  getBooking: async (id) => {
    try {
      const res = await apiFetchBooking(id);
      set({ booking: res });
      return res;
    } catch (error) {
      throw error;
    }
  },

  getAllBooking: async () => {
    try {
      const res = await apiFetchAllBooking();
      const list = Array.isArray(res) ? res : [];
      set({ bookingList: list });
      return list;
    } catch (error) {
      set({ bookingList: [] });
      throw error;
    }
  },

  cancelBooking: async (id, payload) => {
    try {
      await apiCancelBooking(id, payload);
      set((state) => ({
        bookingList: state.bookingList.map((b) =>
          b.id === id ? { ...b, bookingStatus: "CANCELLED" } : b
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  loadExtraServices: async () => {
    try {
      const services = await fetchActiveExtraServices();
      const list = Array.isArray(services) ? services : [];
      set({ extraServices: list });
      return list;
    } catch (error) {
      set({ extraServices: [] });
      return [];
    }
  },
});

const useBookingStore = create(
  devtools(
    persist(bookingStore, {
      name: "bookings",
    })
  )
);

export default useBookingStore;