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

const roomStore = (set, get) => ({
  roomList: [],
  room: {},
  typeOfRooms: [],
  statusOfRooms: [],

  addRoom: async (data) => {
    let token = localStorage.getItem("token");

    const { amenities, ...backendPayload } = data;
    let res = null;

    try {
      res = await createRoom(backendPayload, token);
    } catch (error) {
      
      console.warn("Backend response warning during create:", error);
    }

    const roomNumber = res?.roomNumber || backendPayload.roomNumber;
    const localAmenities = amenities || [];

    const roomWithFrontendAmenities = {
      ...(res || backendPayload),
      amenities: localAmenities,
    };

    set((state) => {
      const exists = state.roomList.some(
        (r) => r.roomNumber === roomNumber
      );
      if (exists) {
        return {
          roomList: state.roomList.map((r) =>
            r.roomNumber === roomNumber
              ? { ...r, ...roomWithFrontendAmenities }
              : r
          ),
        };
      }
      return { roomList: [roomWithFrontendAmenities, ...state.roomList] };
    });

    return roomWithFrontendAmenities;
  },

  updateRoom: async (roomNumber, data) => {
    let token = localStorage.getItem("token");

    const { amenities, ...backendPayload } = data;
    let res = null;

    try {
      res = await patchRoom(roomNumber, backendPayload, token);
    } catch (error) {
      console.warn("Backend response warning during update:", error);
    }

    set((state) => ({
      roomList: state.roomList.map((room) =>
        room.roomNumber === roomNumber
          ? {
              ...room,
              ...(res || backendPayload),
              amenities:
                amenities !== undefined ? amenities : room.amenities || [],
            }
          : room
      ),
    }));

    return res || { roomNumber, ...data };
  },

  getRoom: async (roomNumber) => {
    try {
      const res = await fetchRoom(roomNumber);
      const existingRoom = get().roomList.find(
        (r) => r.roomNumber === roomNumber
      );
      const mergedRoom = {
        ...res,
        amenities: existingRoom?.amenities || [],
      };
      set({ room: mergedRoom });
      return mergedRoom;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  },

  getRoomsList: async () => {
    try {
      const res = await fetchAllRooms();
      const currentList = get().roomList || [];

      const mergedList = (res || []).map((backendRoom) => {
        const localRoom = currentList.find(
          (r) => r.roomNumber === backendRoom.roomNumber
        );
        return {
          ...backendRoom,
          amenities: localRoom?.amenities || [],
        };
      });

      set({ roomList: mergedList });
      return mergedList;
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
      let token = localStorage.getItem("token");
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