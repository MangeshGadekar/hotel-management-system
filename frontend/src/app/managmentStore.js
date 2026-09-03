import { create } from "zustand";
import {
  createGuest,
  patchGuest,
  fetchGuest,
  deleteGuest,
  createBooking,
} from "../apis/api";

const managementStore = (set) => ({
  guestList: [],
  guest: {},

  // Create Guest
  addGuest: async (data) => {
    try {
      const res = await createGuest(data);

      set((state) => ({
        guestList: [res, ...state.guestList],
      }));

      return res;
    } catch (error) {
      return error.message;
    }
  },

  // Update Guest
  updateGuest: async (id, data) => {
    try {
      const res = await patchGuest(id, data);

      set((state) => ({
        guestList: state.guestList.map((guest) =>
          guest.id === id ? res : guest
        ),
      }));

      return res;
    } catch (error) {
      return error.message;
    }
  },

  // Get Guest
  getGuest: async (id) => {
    try {
      const res = await fetchGuest(id);

      set({
        guest: res,
      });

      return res;
    } catch (error) {
      return error.message;
    }
  },

  // Delete Guest
  removeGuest: async (id) => {
    try {
      const res = await deleteGuest(id);

      set((state) => ({
        guestList: state.guestList.filter(
          (guest) => guest.id !== id
        ),
      }));

      return res;
    } catch (error) {
      return error.message;
    }
  },

  // Create Booking
  addBooking: async (data) => {
    try {
      const res = await createBooking(data);

      return res;
    } catch (error) {
      return error.message;
    }
  },
});

const useManagementStore = create(managementStore);

export default useManagementStore;