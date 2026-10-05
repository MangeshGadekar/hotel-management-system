import { apiClient } from "./apiClient";

/* Helper to build header config safely */
const getAuthHeaders = (token) => {
  if (!token) return {};

  // Clean token if extra spaces/quotes exist
  const cleanToken = token.replace(/^"|"$/g, "").trim();

  return {
    Authorization: cleanToken.startsWith("Bearer ")
      ? cleanToken
      : `Bearer ${cleanToken}`,
  };
};

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

export const createReceptionist = async (payload, token) => {
  return await apiClient
    .post(`/admin/receptionist/create`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchReceptionist = async (id, payload, token) => {
  return await apiClient
    .patch(`/admin/receptionist/update/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const fetchReceptionist = async (id, token) => {
  return await apiClient
    .get(`/admin/receptionist/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllReceptionist = async (token) => {
  return await apiClient
    .get(`/admin/receptionist`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const removeReceptionist = async (id, token) => {
  return await apiClient
    .delete(`/admin/receptionist/delete/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* =================================================== */
/* GUEST & OTP APIS */
/* =================================================== */

export const createGuest = async (payload, token) => {
  return await apiClient
    .post("/guest/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchGuest = async (id, payload, token) => {
  return await apiClient
    .patch(`/guest/update/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const fetchGuest = async (id, token) => {
  return await apiClient
    .get(`/guest/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllGuest = async (token) => {
  return await apiClient
    .get(`/guest`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* delete guest */
export const deleteGuest = async (id, token) => {
  return await apiClient
    .delete(`guest/delete/${id}`, {
      headers: getAuthHeaders(token),
    })
    .text(); // Use .text() because Spring Boot returns ResponseEntity<String>
};

export const searchGuestByQuery = async (query, token) => {
  return await apiClient
    .get(`/guest/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const checkEmailExists = async (email, token) => {
  return await apiClient
    .get(`/guest/check-email?email=${encodeURIComponent(email)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const getGuestByEmail = async (email, token) => {
  return await apiClient
    .get(`/guest/by-email?email=${encodeURIComponent(email)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* Public / Authenticated Send OTP */
export const sendGuestOtp = async (email, token = null) => {
  const options = token ? { headers: getAuthHeaders(token) } : {};
  return await apiClient
    .post(`/guest/send-otp?email=${encodeURIComponent(email)}`, options)
    .text();
};

/* Public / Authenticated Verify OTP */
export const verifyGuestOtpAndSave = async (payload, token = null) => {
  const options = { json: payload };
  if (token) {
    options.headers = getAuthHeaders(token);
  }
  return await apiClient.post(`/guest/verify-otp`, options).json();
};

/* =================================================== */
/* BOOKINGS */
/* =================================================== */

export const createBooking = async (payload) => {
  return await apiClient.post(`/booking/create`, { json: payload }).json();
};

export const patchBooking = async (id, payload) => {
  return await apiClient
    .patch(`/booking/update/${id}`, { json: payload })
    .json();
};

export const fetchBooking = async (id) => {
  return await apiClient.get(`/booking/${id}`).json();
};

export const fetchAllBooking = async () => {
  return await apiClient.get(`/booking`).json();
};

export const cancelBooking = async (id, payload) => {
  return await apiClient
    .patch(`/booking/cancel/${id}`, { json: payload })
    .json();
};

/* =================================================== */
/* ROOMS */
/* =================================================== */

export const createRoom = async (payload, token) => {
  return await apiClient
    .post("admin/room/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchRoom = async (roomNumber, payload) => {
  return await apiClient
    .patch(`/admin/room/update/${roomNumber}`, { json: payload })
    .json();
};

export const fetchRoom = async (roomNumber) => {
  return await apiClient.get(`/admin/room/${roomNumber}`).json();
};

export const fetchAllRooms = async () => {
  return await apiClient.get(`/admin/room`).json();
};

export const typeOfRooms = async (roomType) => {
  return await apiClient.get(`/admin/room/type/${roomType}`).json();
};

export const statusOfRooms = async (roomStatus) => {
  return await apiClient.get(`/admin/room/status/${roomStatus}`).json();
};

export const deleteRoom = async (roomNumber) => {
  return await apiClient.delete(`/admin/room/delete/${roomNumber}`).json();
};

/* =================================================== */
/* DASHBOARD */
/* =================================================== */

export const adminDashboard = async (token) => {
  return await apiClient
    .get(`/admin/dashboard`, {
      headers: getAuthHeaders(token),
    })
    .json();
};