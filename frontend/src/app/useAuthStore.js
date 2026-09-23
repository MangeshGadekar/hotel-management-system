import { devtools, persist } from "zustand/middleware";
import { userLogin, userLogout, userRegister } from "../apis/api";
import { create } from "zustand";

const authStore = (set) => ({
  user: {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    id: "",
    role: "",
  },
  token: "",

  register: async (data) => {
    try {
      const res = await userRegister(data);
      console.log("login", res.data);
      set({
        user: res,
      });
      return res;
    } catch (error) {
      return error;
    }
  },
  login: async (data) => {
    try {
      const res = await userLogin(data);
      console.log("res", res);
      set({
        user: {
          id: res.data.id,
          username: res.data.username,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          role : res.data.role
        },
        token: res.data.accessToken,
      });
      localStorage.setItem("token", res.data.accessToken);
      return res;
    } catch (error) {
      return error;
    }
  },
  logout: async () => {
    try {
      const res = await userLogout();
      set({
        user: {},
        token: "",
      });
      localStorage.clear();
      return res;
    } catch (error) {
      set({
        user: {},
      });
      localStorage.clear();
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
