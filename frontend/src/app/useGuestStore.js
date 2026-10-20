import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchAllGuest,
  searchGuestByQuery,
  sendGuestOtp,
  verifyGuestOtpAndSave,
  deleteGuest,
} from "../apis/api";

const parseErrorMessage = async (err, defaultMsg) => {
  if (err?.response) {
    try {
      const resJson = await err.response.json();
      return resJson?.message || defaultMsg;
    } catch {
      try {
        return await err.response.text();
      } catch {
        return defaultMsg;
      }
    }
  }
  return err?.message || defaultMsg;
};

const useGuestStore = create(
  persist(
    (set) => ({
      guestList: [],
      searchResults: [],
      loading: false,
      error: null,

      
      getGuestList: async (token) => {
        if (!token) return;
        set({ loading: true, error: null });
        try {
          const data = await fetchAllGuest(token);
          set({
            guestList: Array.isArray(data) ? data : data?.guests || [],
            loading: false,
          });
        } catch (err) {
          const errMessage = await parseErrorMessage(err, "Failed to fetch guests");
          set({
            error: errMessage,
            loading: false,
          });
        }
      },

   
      sendOtp: async (email, token = null) => {
        set({ loading: true, error: null });
        try {
          const res = await sendGuestOtp(email, token);
          set({ loading: false });
          return res;
        } catch (err) {
          const errMessage = await parseErrorMessage(err, "Failed to send OTP");
          set({ error: errMessage, loading: false });
          throw new Error(errMessage);
        }
      },

      
      verifyOtpAndSave: async (verifyPayload, token = null) => {
        set({ loading: true, error: null });
        try {
          const savedGuest = await verifyGuestOtpAndSave(verifyPayload, token);
          set((state) => {
            const exists = state.guestList.some(
              (g) => String(g.id || g._id) === String(savedGuest.id || savedGuest._id)
            );
            const updatedList = exists
              ? state.guestList.map((g) =>
                  String(g.id || g._id) === String(savedGuest.id || savedGuest._id)
                    ? savedGuest
                    : g
                )
              : [savedGuest, ...state.guestList];

            return {
              guestList: updatedList,
              loading: false,
            };
          });
          return savedGuest;
        } catch (err) {
          const errMessage = await parseErrorMessage(
            err,
            "Failed to create guest. Verification failed."
          );
          set({ error: errMessage, loading: false });
          throw new Error(errMessage);
        }
      },

      
      searchGuests: async (query, token) => {
        if (!query || query.trim().length < 2) {
          set({ searchResults: [] });
          return [];
        }
        try {
          const results = await searchGuestByQuery(query, token);
          set({ searchResults: results || [] });
          return results || [];
        } catch (err) {
          set({ searchResults: [] });
          return [];
        }
      },

      clearSearchResults: () => set({ searchResults: [] }),

  
      removeGuest: async (id, token) => {
        if (!token) {
          const errMsg = "Unauthorized: Admin/Receptionist token is required to delete guest.";
          set({ error: errMsg });
          throw new Error(errMsg);
        }

        set({ loading: true, error: null });
        try {
          await deleteGuest(id, token);
          set((state) => ({
            guestList: state.guestList.filter(
              (g) => String(g._id || g.id) !== String(id)
            ),
            loading: false,
          }));
        } catch (err) {
          const serverError = await parseErrorMessage(err, "Failed to delete guest");
          set({
            error: serverError,
            loading: false,
          });
          throw new Error(serverError);
        }
      },
    }),
    {
      name: "guest-storage",
      partialize: (state) => ({ guestList: state.guestList }),
    }
  )
);

export default useGuestStore;