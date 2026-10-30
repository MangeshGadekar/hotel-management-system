import { create } from "zustand";
import {
  getAllExtraServicesAdminApi,
  getActiveExtraServicesApi,
  createExtraServiceAdminApi,
  updateExtraServiceAdminApi,
  toggleExtraServiceStatusAdminApi,
  deleteExtraServiceAdminApi,
  
} from "../apis/api"; 

const useExtraServiceStore = create((set, get) => ({
  services: [],
  activeServices: [],
  loading: false,
  error: null,

  fetchAdminServices: async (token) => {
    set({ loading: true, error: null });
    try {
      const data = await getAllExtraServicesAdminApi(token);
      set({ services: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message || "Failed to load services", loading: false });
    }
  },

  fetchActiveServices: async (category = null) => {
    set({ loading: true, error: null });
    try {
      const data = await getActiveExtraServicesApi(category);
      set({ activeServices: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message || "Failed to load active services", loading: false });
    }
  },

addService: async (formDataPayload, passedToken) => {
  let token =
    passedToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const isFormData = formDataPayload instanceof FormData;
  const headers = {};

  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    headers["Authorization"] = `Bearer ${cleanToken}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch("http://localhost:8080/api/extra-services/admin", {
    method: "POST",
    headers, // Valid header: "Bearer eyJhbGciOi..."
    body: isFormData ? formDataPayload : JSON.stringify(formDataPayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create service");
  }

  const newService = await res.json();
  set((state) => ({
    services: [newService, ...(state.services || [])],
  }));

  return newService;
},

editService: async (id, formDataPayload, passedToken) => {
  let token =
    passedToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const isFormData = formDataPayload instanceof FormData;
  const headers = {};

  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    headers["Authorization"] = `Bearer ${cleanToken}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`http://localhost:8080/api/extra-services/admin/${id}`, {
    method: "PUT",
    headers,
    body: isFormData ? formDataPayload : JSON.stringify(formDataPayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update service");
  }

  const updatedService = await res.json();
  set((state) => ({
    services: (state.services || []).map((s) => (s.id === id ? updatedService : s)),
  }));

  return updatedService;
},


  toggleServiceStatus: async (id, passedToken) => {
    let token =
      passedToken ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    const headers = {};
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }

    const res = await fetch(
      `http://localhost:8080/api/extra-services/admin/${id}/toggle-status`,
      {
        method: "PATCH",
        headers,
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to toggle service status");
    }

    const updatedService = await res.json();
    set((state) => ({
      services: (state.services || []).map((s) =>
        s.id === id ? updatedService : s
      ),
      activeServices: updatedService.active
        ? [...state.activeServices.filter((s) => s.id !== id), updatedService]
        : state.activeServices.filter((s) => s.id !== id),
    }));

    return updatedService;
  },

  removeService: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await deleteExtraServiceAdminApi(id, token);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        activeServices: state.activeServices.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message || "Failed to delete service", loading: false });
      throw err;
    }
  },
}));




export default useExtraServiceStore;