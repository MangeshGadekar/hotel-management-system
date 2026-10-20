import { devtools, persist } from "zustand/middleware";
import { create } from "zustand";
import {
  createReceptionist,
  fetchAllReceptionist,
  fetchReceptionist,
  patchReceptionist,
  removeReceptionist,
} from "../apis/api";

const getCurrentToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return token.replace(/^"|"$/g, "").trim();
};

const receptionistStore = (set, get) => ({
  receptionistList: [],
  receptionist: {},

  addReceptionist: async (data) => {
    try {
      const token = getCurrentToken();
      const res = await createReceptionist(data, token);

      set((state) => ({
        receptionistList: [res, ...state.receptionistList],
        receptionist: res,
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  updateReceptionist: async (id, data) => {
    try {
      const token = getCurrentToken();
      const res = await patchReceptionist(id, data, token);

      set((state) => ({
        receptionistList: state.receptionistList.map((item) =>
          String(item.id) === String(id) ? res : item
        ),
        receptionist: res,
      }));
      return res;
    } catch (error) {
      throw error;
    }
  },

  getReceptionist: async (id) => {
    try {
      const token = getCurrentToken();
      const res = await fetchReceptionist(id, token);
      set({ receptionist: res });
      return res;
    } catch (error) {
      throw error;
    }
  },

  getAllReceptionist: async () => {
    try {
      const token = getCurrentToken();
      const res = await fetchAllReceptionist(token);
      const list = Array.isArray(res) ? res : [];
      set({ receptionistList: list });
      return list;
    } catch (error) {
      throw error;
    }
  },

  deleteReceptionist: async (id) => {
    try {
      const token = getCurrentToken();
      await removeReceptionist(id, token);

      
      set((state) => {
        const filteredList = state.receptionistList.filter(
          (item) => String(item.id) !== String(id)
        );
        return { receptionistList: [...filteredList] };
      });
    } catch (error) {
      throw error;
    }
  },
});

const useReceptionistStore = create(
  devtools(
    persist(receptionistStore, {
      name: "receptionist",
    })
  )
);

export default useReceptionistStore;