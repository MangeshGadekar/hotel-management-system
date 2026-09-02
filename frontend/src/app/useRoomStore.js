import { create } from "zustand";
import { devtools, persist } from "zustand";
import { createRoom } from "../apis/api";

const roomStore = (set) => ({
  roomList: [],
  addRoom : async(data) => {
      try {
        const res = await createRoom(data)
        set({
          roomList : set.roomList.push(res.data)
        })
        return res.data
      } catch (error) {
        return error.message
      }
  }
});


const useRoomStore = create(
  devtools(
    persist(roomStore, {
      name : 'rooms'
    })
  )
)

export default useRoomStore;