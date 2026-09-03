import { create } from "zustand";
import { createRoom } from "../apis/api";
import { devtools, persist } from "zustand/middleware";

const roomStore = (set) => ({
  roomList: [],
  addRoom: async (data) => {
    try {
      console.log("create room data", data)
      const res = await createRoom(data);
      set((state) => ({
        roomList: [res.data, ...state.roomList],
      }));
      console.log("create room", res)
      return res.data;
    } catch (error) {
      return error.message;
    }
  },
});

const useRoomStore = create(
  devtools(
    persist(roomStore, {
      name: "rooms",
    }),
  ),
);

export default useRoomStore;
