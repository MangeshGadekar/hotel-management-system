import { create } from "zustand";
import { devtools, persist } from "zustand";

const roomStore = (set) => ({
  roomList: [],
  addRoom: (room) => {
    set((state) => ({
      roomList: [room, ...state.roomList],
    }));
  },
  removeRoom: (roomId) => {
    set((state) => ({
        
    }));
  },
});
