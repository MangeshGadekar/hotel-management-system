import { devtools, persist } from "zustand/middleware";
import { create } from "zustand";
import {
  createReceptionist,
  fetchAllReceptionist,
  fetchReceptionist,
  patchReceptionist,
  removeReceptionist,
} from "../apis/api";

const receptionistStore = (set) => ({
  receptionistList: [],
  receptionist: {},
  addReceptionist: async (data) => {
    try {
      const res = await createReceptionist(data);
      const _receptionist = res;
      set((state) => ({
        receptionist: [_receptionist, state.receptionist],
      }));
      console.log("_receptionist", _receptionist);
      return res;
    } catch (error) {
      return error;
    }
  },
  updateReceptionist: async (id, data) => {
    try {
      const res = await patchReceptionist(id, data);
      const _receptionist = res;
      set((state) => ({
        receptionist: state.receptionistList.map((receptionist) => {
          receptionist.id === id ? _receptionist : receptionist;
        }),
      }));
      console.log("_receptionist", _receptionist);
      return res;
    } catch (error) {
      return error;
    }
  },
  getReceptionist: async (id) => {
    try {
      const res = await fetchReceptionist(id);
      const _receptionist = res;
      set({
        receptionist: _receptionist,
      });
      console.log("_receptionist", _receptionist);
      return res;
    } catch (error) {
      return error;
    }
  },
  getAllReceptionist: async () => {
    try {
      const res = await fetchAllReceptionist();
      const _receptionistlist = res;
      set({
        receptionistList: _receptionistlist,
      });
      console.log("_receptionistlist", _receptionistlist);
      return res;
    } catch (error) {
      return error;
    }
  },
  deleteReceptionist: async (id) => {
    try {
      const res = await removeReceptionist(id);
      set((state) => ({
        receptionist: state.receptionistList.filter((receptionist) => {
          receptionist.id !== id;
        }),
      }));
      return res;
    } catch (error) {
      return error;
    }
  },
});

const useReceptionistStore = create(
  devtools(
    persist(receptionistStore, {
      name: "receptionist",
    }),
  ),
);

export default useReceptionistStore;
