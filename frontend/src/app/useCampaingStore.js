import { createCampaings, getAllCampaings } from "../apis/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

const campaingsStore = (set) => ({
  campaing: {},
  campaingList: [],

  addCampaing: async (data) => {
    try {
      const res = await createCampaings(data);
      const _campaing = res;
      set((state) => ({
        campaingList: [_campaing, ...state.campaingList],
      }));
      return res;
    } catch (error) {
      return error;
    }
  },
  getAllCampaings: async () => {
    try {
      const res = await getAllCampaings();
      const _allCampaings = res;
      set({
        campaingList: _allCampaings,
      });
      return res;
    } catch (error) {
      return error;
    }
  },
});

const useCampaingStore = create(
  devtools(
    persist(campaingsStore, {
      name: "campaing",
    }),
  ),
);

export default useCampaingStore;
