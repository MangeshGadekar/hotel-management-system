import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { creteGuest, patchGuest } from "../apis/api";

const guestStore = (set) => ({
  guestList: [],
  guest: {},
  addGuest: async (data) => {
    try {
      const res = await creteGuest(data);
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
      console.log("update guest", _guest)
      return res
    } catch (error) {
        return error
    }
  },
});
