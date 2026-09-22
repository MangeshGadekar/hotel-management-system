import { devtools, persist } from "zustand/middleware";
import { login, register } from "../apis/api";
import { create } from "zustand";

const authStore = (set) => ({
  user: {},
  register: async (data) => {
    try {
      const res = await register(data);
      console.log("login", res) 
      set({
        user: res,
      });
      return res
    } catch (error) {
      return error;
    }
  },
  login: async (data) => {
    try {
      const res = await login(data);
      console.log("res", res)
      set({
        user: res,
      });
      return res
    } catch (error) {
      return error;
    }
  },
});

const useAuthStore = create(
  devtools(
    persist(authStore, {
      name: "auth",
    }),
  ),
);

export default useAuthStore;
