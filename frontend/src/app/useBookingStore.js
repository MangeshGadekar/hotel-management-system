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
  extendStayApi,
  sendManageBookingOtpApi,
  verifyManageBookingOtpApi,
  cancelGuestBooking,
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

  settleAndCheckOut: async (bookingId, dueAmount, paymentMethod) => {
    try {
      if (dueAmount && dueAmount > 0) {
        await processPaymentApi({
          bookingId: bookingId,
          amount: dueAmount,
          paymentType: "SPLIT_BALANCE",
          paymentMethod: paymentMethod || "CASH",
        });
      }

      const checkoutResponse = await checkOutGuestApi(bookingId);
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

 cancelBooking: async (id, emailOrPayload) => {
    try {
      let res;
      if (typeof emailOrPayload === "string" && emailOrPayload.includes("@")) {
        res = await cancelGuestBooking(id, emailOrPayload);
      } else {
        res = await apiCancelBooking(id, emailOrPayload);
      }

      set((state) => ({
        bookingList: state.bookingList.map((b) =>
          b.id === id ? { ...b, bookingStatus: "CANCELLED" } : b
        ),
      }));
      return res;
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


  extendStay: async (bookingId, newCheckOutDate) => {
    try {
      const res = await extendStayApi(bookingId, newCheckOutDate);
      set((state) => ({
        bookingList: state.bookingList.map((b) => (b.id === bookingId ? res : b)),
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  
  switchRoom: async (bookingId, targetRoomId, reason) => {
    try {
      const res = await switchRoomApi(bookingId, targetRoomId, reason);
      set((state) => ({
        bookingList: state.bookingList.map((b) => (b.id === bookingId ? res : b)),
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  sendBookingOtp: async (bookingId, email) => {
    return await sendManageBookingOtpApi(bookingId, email);
  },

  verifyBookingOtp: async (bookingId, email, otp) => {
    const bookingResponse = await verifyManageBookingOtpApi(bookingId, email, otp);
    set({ currentBooking: bookingResponse });
    return bookingResponse;
  },

  resetBooking: () => {
    set({ currentBooking: null });
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