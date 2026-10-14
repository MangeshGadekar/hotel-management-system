import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createCupone, deleteCupon, fetchAllCupons } from "../apis/api";

const cuposeStore = (set) => ({
  cupons: {},
  cuponseList: [],

  addCuponse: async (data) => {
    try {
      const res = await createCupone(data);
      const cupon = res;
      set((state) => ({
        cuponseList: [cupon, ...state.cuponseList],
      }));
      return cupon;
    } catch (error) {
      return error;
    }
  },
  updateCupon: async (data) => {
    try {
      const res = patchCupon(cuponId, data);
      const _cupon = res;
      set((state) => ({
        cuponseList: state.cuponseList.map((c) => {
          c.id === cuponId ? _cupon : c;
        }),
      }));
    } catch (error) {
      return error;
    }
  },

  removeCupon: async (cuponId) => {
    try {
      await deleteCupon(cuponId);

      set((state) => ({
        cuponseList: state.cuponseList.filter((c) => c.id !== cuponId),
      }));
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      return error;
    }
  },
  getAllCuponse: async () => {
    try {
      const res = await fetchAllCupons();
      const allCupons = res;
      set({
        cuponseList: allCupons,
      });
    } catch (error) {
      return error;
    }
  },
});

const useCuponesStore = create(
  devtools(
    persist(cuposeStore, {
      name: "cupons",
    }),
  ),
);

export default useCuponesStore;