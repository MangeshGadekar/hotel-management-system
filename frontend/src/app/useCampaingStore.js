import {
  createCampaings,
  deleteCampaign,
  getAllCampaings,
  patchCampaing,
} from "../apis/api";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const campaingsStore = (set) => ({
  campaing: {},
  campaingList: [],

  addCampaing: async (data) => {
    try {
      const res = await createCampaings(data);
      set((state) => ({
        campaingList: [res, ...state.campaingList],
      }));
      return res;
    } catch (error) {
      return error;
    }
  },

  removeCampaing: async (campaingId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      await deleteCampaign(token, campaingId);
      set((state) => ({
        campaingList: state.campaingList.filter((c) => c.id !== campaingId),
      }));
    } catch (error) {
      return error;
    }
  },

  updateCampaing: async (campaingId, payload) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const res = await patchCampaing(token, campaingId, payload);
      set((state) => ({
        campaingList: state.campaingList.map((c) =>
          c.id === campaingId ? res : c
        ),
      }));
      return res;
    } catch (error) {
      return error;
    }
  },

  getAllCampaings: async () => {
    try {
      const res = await getAllCampaings();
      set({
        campaingList: res || [],
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
    })
  )
);

export default useCampaingStore;