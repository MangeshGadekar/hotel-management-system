import { devtools, persist } from "zustand/middleware";
import { create } from "zustand";
import {
  cancelBooking,
  createBooking,
  fetchBooking,
  patchBooking,
} from "../apis/api";

const bookingStore = (set) => ({
  bookingList: [],
  booking: {},
  addBooking: async (data) => {
    try {
      const res = await createBooking(data);
      const _booking = res;
      set((state) => ({
        bookingList: [_booking, state.bookingList],
      }));
      console.log("_booking", _booking);
      return res;
    } catch (error) {
      return error;
    }
  },
  updateBooking: async (id, data) => {
    try {
      const res = await patchBooking(id, data);
      const _booking = res;

      set((state) => ({
        bookingList: state.bookingList.map((booking) => {
          booking.id === id ? _booking : booking;
        }),
      }));
      console.log("_booking : ", res);
      return res;
    } catch (error) {
      return error;
    }
  },
  getBooking: async (id) => {
    try {
      const res = await fetchBooking(id);
      const _booking = res;
      set({
        booking: _booking,
      });
      console.log("_booking", _booking);
      return res;
    } catch (error) {
      return error;
    }
  },
  getAllBooking: async () => {
    try {
      const res = await fetchBooking();
      const _bookingList = res;
      set({
        bookingList: _bookingList,
      });
      console.log("_bookingList", _bookingList);
      return res;
    } catch (error) {
      return error;
    }
  },
  cancelBooking: async (id) => {
    try {
      const res = await cancelBooking(id);
      set((state) => ({
        bookingList: state.bookingList.filter((booking) => {
          booking.id !== id;
        }),
      }));
      return res;
    } catch (error) {
      return error;
    }
  },
});

const useBookingStore = create(
  devtools(
    persist,
    (bookingStore,
    {
      name: "bookings",
    }),
  ),
);

export default useBookingStore;
