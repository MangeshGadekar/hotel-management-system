import { create } from "zustand";
import {
  createRoom,
  deleteRoom,
  fetchAllRooms,
  fetchRoom,
  patchRoom,
  statusOfRooms,
} from "../apis/api";
import { devtools, persist } from "zustand/middleware";

const roomStore = (set) => ({
  roomList: [],
  room: {},
  typeOfRooms: [],
  statusOfRooms: [],

  addRoom: async (data) => {
    const token = localStorage.getItem("token");
    const res = await createRoom(data, token);

    const roomNumber = res?.roomNumber || data.roomNumber;
    const roomRecord = res || data;

    set((state) => {
      const exists = state.roomList.some(
        (r) => r.roomNumber === roomNumber
      );
      if (exists) {
        return {
          roomList: state.roomList.map((r) =>
            r.roomNumber === roomNumber ? { ...r, ...roomRecord } : r
          ),
        };
      }
      return { roomList: [roomRecord, ...state.roomList] };
    });

    return roomRecord;
  },

  updateRoom: async (roomNumber, data) => {
    const token = localStorage.getItem("token");
    const res = await patchRoom(roomNumber, data, token);

    const updated = res || { roomNumber, ...data };

    set((state) => ({
      roomList: state.roomList.map((room) =>
        room.roomNumber === roomNumber
          ? {
              ...room,
              ...updated,
              amenities:
                updated.amenities !== undefined
                  ? updated.amenities
                  : room.amenities || [],
            }
          : room
      ),
    }));

    return updated;
  },

  getRoom: async (roomNumber) => {
    try {
      const res = await fetchRoom(roomNumber);
      set({ room: res });
      return res;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  },

  getRoomsList: async () => {
    try {
      const res = await fetchAllRooms();
      const list = Array.isArray(res) ? res : [];
      set({ roomList: list });
      return list;
    } catch (error) {
      console.error("Error fetching rooms list:", error);
      throw error;
    }
  },

  getStatusOfRoomsList: async (status) => {
    try {
      const res = await statusOfRooms(status);
      set({ statusOfRooms: res || [] });
      return res;
    } catch (error) {
      console.error("Error fetching room status:", error);
      throw error;
    }
  },

  deleteRoom: async (roomNumber) => {
    try {
      const token = localStorage.getItem("token");
      const res = await deleteRoom(roomNumber, token);
      set((state) => ({
        roomList: state.roomList.filter(
          (room) => room.roomNumber !== roomNumber
        ),
      }));
      return res;
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },
});

const useRoomStore = create(
  devtools(
    persist(roomStore, {
      name: "rooms",
    })
  )
);

export default useRoomStore;