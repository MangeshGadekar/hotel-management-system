import { createCampaings, getAllCampaings } from "../apis/api";

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
