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
    try {
      console.log("create room data", data);
      const res = await createRoom(data);
      const _room = res;
      set((state) => ({
        roomList: [_room, ...state.roomList],
      }));
      console.log("create room", res);
      return res;
    } catch (error) {
      return error.message;
    }
  },
  updateRoom: async (roomNumber, data) => {
    try {
      const res = await patchRoom(roomNumber, data);
      const _room = res;
      set((state) => ({
        roomList: state.roomList.map((room) => {
          room.roomNumber === roomNumber ? _room : room;
        }),
      }));
      return res;
    } catch (error) {
      return error.message;
    }
  },
  getRoom: async (roomNumber) => {
    try {
      const res = await fetchRoom(roomNumber);
      const _room = res;
      set({
        room: _room,
      });
      return res;
    } catch (error) {
      return error;
    }
  },
  getRoomsList: async () => {
    try {
      const res = await fetchAllRooms();
      const _roomsList = res;
      set({
        roomList: _roomsList,
      });
      return res;
    } catch (error) {
      return error;
    }
  },
  getStatusOfRoomsList: async () => {
    try {
      const res = await statusOfRooms();
      const _statusOfRooms = res;
      set({
        statusOfRooms: _statusOfRooms,
      });
      return res;
    } catch (error) {
      return error;
    }
  },

  deleteRoom: async (roomNumber) => {
    try {
      const res = await deleteRoom(roomNumber);
      set((state) => ({
        roomList: state.roomList.filter((room) => {
          room.roomNumber !== roomNumber;
        }),
      }));
      return res;
    } catch (error) {
      return error;
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
