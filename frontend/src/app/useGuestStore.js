import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { creteGuest } from "../apis/api";

const guestStore = (set) => ({
    guestList : [],
    guest : {},
    addGuest : async (data) => {
        try {
            const res = await creteGuest(data)
            const _guest = res
            set((state)=>({
                guestList : [_guest, state.guestList]
            }))
            console.log("guest create :", res)
            return res
        } catch (error) {
            return error
        }
    },
})