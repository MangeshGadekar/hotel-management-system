import {
  createCampaings,
  deleteCampaign,
  getAllCampaings,
  patchCampaing,
} from "../apis/api";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
const token = localStorage.getItem("token");

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
  removeCampaing: async (camapaingId) => {
    try {
      await deleteCampaign(token, camapaingId);
      set((state) => ({
        campaingList: state.campaingList.filter((c) => {
          c.id !== camapaingId;
        }),
      }));
    } catch (error) {
      return error;
    }
  },
  updateCampaing: async (campaingId, payload) => {
    try {
      const res = await patchCampaing(token, campaingId, payload);
      const _campaing = res;
      set((state) => ({
        campaingList: state.campaingList.map((c) => {
          c.id === campaingId ? _campaing : c;
        }),
      }));
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
