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
      const token = localStorage.getItem("token");
      const res = await createGuest(data, token);
      const _guest = await res;
      set((state) => ({
        guestList: [_guest, ...state.guestList],
      }));
      console.log("guest create :", res);
      return res;
    } catch (error) {
      return error;
    }
  },
  updateGuest: async (id, data) => {
    try {
      const token = localStorage.getItem("token");
      const res = await patchGuest(id, data, token);
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
      const token = localStorage.getItem("token");
      const res = await fetchGuest(id, token);
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
  getGuestList: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetchAllGuest(token);
      const _guestList = await res;
      set({
        guestList: _guestList,
      });
      console.log("fetch guest", _guestList);
      return _guestList;
    } catch (error) {
      return error;
    }
  },
  removeGuest: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await deleteGuest(id, token);
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
