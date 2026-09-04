import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  createGuest,
  deleteGuest,
  fetchAllGuest,
  fetchGuest,
  patchGuest,
} from "../apis/api";

const guestStore = (set) => ({
  guestList: [],
  guest: {},
  addGuest: async (data) => {
    try {
      const res = await createGuest(data);
      const _guest = res;
      set((state) => ({
        guestList: [_guest, state.guestList],
      }));
      console.log("guest create :", res);
      return res;
    } catch (error) {
      return error;
    }
  },
  updateGuest: async (id, data) => {
    try {
      const res = await patchGuest(id, data);
      const _guest = res;
      set((state) => ({
        guestList: state.guestList.map((guest) => {
          guest.id === id ? _guest : guest;
        }),
      }));
      console.log("update guest", _guest);
      return res;
    } catch (error) {
      return error;
    }
  },
  getGuest: async (id) => {
    try {
      const res = await fetchGuest(id);
      const _guest = res;
      set({
        guest: _guest,
      });
      console.log("fetch guest", _guest);
      return res;
    } catch (error) {
      return error;
    }
  },
  getGuestList: async (id) => {
    try {
      const res = await fetchAllGuest(id);
      const _guestList = res;
      set({
        guestList: _guestList,
      });
      console.log("fetch guest", _guestList);
      return res;
    } catch (error) {
      return error;
    }
  },
  removeGuest: async (id) => {
    try {
      const res = await deleteGuest(id);
      set((state) => ({
        roomList: state.roomList.filter((guest) => {
          guest.id !== id;
        }),
      }));
      return res;
    } catch (error) {
      return error;
    }
  },
});

const useGuestStore = create(
  devtools(
    persist(guestStore, {
      name: "guests",
    }),
  ),
);

export default useGuestStore;
