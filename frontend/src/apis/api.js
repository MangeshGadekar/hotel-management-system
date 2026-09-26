import { apiClient } from "./apiClient";

/* =================================================== */
/* AUTHENTICATION */
/* =================================================== */

export const userRegister = async (payload) => {
  return await apiClient.post("/auth/signup", { json: payload }).json();
};

export const userLogin = async (payload) => {
  return await apiClient.post("/auth/login", { json: payload }).json();
};

export const userLogout = async () => {
  return await apiClient.get("/auth/logout").json();
};

/* =================================================== */
/* RECEPTIONIST */
/* =================================================== */
/* create receptionist */
export const createReceptionist = async (payload, token) => {
  return await apiClient
    .post(`/admin/receptionist/create`, {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();
};

/* update receptionist */
export const patchReceptionist = async (id, payload, token) => {
  return await apiClient
    .patch(`/admin/receptionist/update/${id}`, {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();
};

/* fetch receptionist */
export const fetchReceptionist = async (id, token) => {
  return await apiClient
    .get(`/admin/receptionist/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* fetch all receptionist */
export const fetchAllReceptionist = async (token) => {
  return await apiClient
    .get(`/admin/receptionist`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* delete receptionist */
export const removeReceptionist = async (id, token) => {
  return await apiClient
    .delete(`/admin/receptionist/delete/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* =================================================== */
/* GUEST */
/* =================================================== */
/* create guest */
export const createGuest = async (payload, token) => {
  return await apiClient
    .post("/guest/create", {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();
};

/* update guest */
export const patchGuest = async (id, payload, token) => {
  return await apiClient
    .patch(`/guest/update/${id}`, {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();
};

/* fetch guest */
export const fetchGuest = async (id, token) => {
  return await apiClient
    .get(`/guest/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* fetch guest list */
export const fetchAllGuest = async (token) => {
  console.log("token", token);
  return await apiClient
    .get(`/guest`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* delete guest */
export const deleteGuest = async (id, token) => {
  return await apiClient
    .delete(`/guest/delete/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* =================================================== */
/* BOOKINGS */
/* =================================================== */
/* Create booking */
export const createBooking = async (payload) => {
  return await apiClient.post(`/booking/create`, { json: payload }).json();
};

/* Update booking */
export const patchBooking = async (id, payload) => {
  return await apiClient
    .patch(`/booking/update/${id}`, { json: payload })
    .json();
};

/* get booking */
export const fetchBooking = async (id) => {
  return await apiClient.get(`/booking/${id}`).json();
};

/* get booking list */
export const fetchAllBooking = async () => {
  return await apiClient.get(`/booking`).json();
};

/* cancel booking */
export const cancelBooking = async (id, payload) => {
  return await apiClient
    .patch(`/booking/cancel/${id}`, { json: payload })
    .json();
};

/* =================================================== */
/* ROOMS */
/* =================================================== */
/* create rooms */
export const createRoom = async (payload, token) => {
  console.log("token :", token);
  console.log("payload :", payload);

  const res = await apiClient
    .post("admin/room/create", {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();

  console.log("res", res);

  return res;
};

/* update room */
export const patchRoom = async (roomNumber, payload) => {
  return await apiClient
    .patch(`/admin/room/update/${roomNumber}`, { json: payload })
    .json();
};

/* get room */
export const fetchRoom = async (roomNumber) => {
  return await apiClient.delete(`/admin/room/${roomNumber}`).json();
};

/* get all rooms */
export const fetchAllRooms = async () => {
  return await apiClient.get(`/admin/room`).json();
};

/* get type of rooms */
export const typeOfRooms = async (roomType) => {
  return await apiClient.get(`/admin/room/type/${roomType}`).json();
};

/* status of rooms */
export const statusOfRooms = async (roomStatus) => {
  return await apiClient.get(`/admin/room/status/${roomStatus}`).json();
};

/* delete room */
export const deleteRoom = async (roomNumber) => {
  return await apiClient.delete(`/admin/room/delete/${roomNumber}`).json();
};

/* =================================================== */
/* CAMPAINGS */
/* =================================================== */
/* create campaings */
export const createCampaings = async (token, payload) => {
  return await apiClient
    .post(`admin/campaigns`, {
      headers: {
        Authorization: token,
      },
      json: payload,
    })
    .json();
};

/* get all campaings */
export const getAllCampaings = async (token) => {
  return apiClient
    .get(`/admin/campaigns`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* delete campaings */
export const deleteCampaign = async (token, campaignId) => {
  return await apiClient
    .delete(`/admin/campaigns/${campaignId}`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};

/* =================================================== */
/* DASHBOARD */
/* =================================================== */
/* admin dashboard */

/* get type of rooms */
export const adminDashboard = async (token) => {
  return await apiClient
    .get(`/admin/dashboard`, {
      headers: {
        Authorization: token,
      },
    })
    .json();
};
