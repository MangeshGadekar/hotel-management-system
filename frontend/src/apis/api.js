import { apiClient } from "./apiClient";

/* =================================================== */
/* AUTHENTICATION */
/* =================================================== */

/* =================================================== */
/* RECEPTIONIST */
/* =================================================== */
/* create receptionist */
export const createReceptionist = async (payload) => {
  return await apiClient.post(`/admin/receptionist/create`, { json : payload}).json();
};

/* update receptionist */
export const patchReceptionist = async (id, payload) => {
  return await apiClient
    .patch(`/admin/receptionist/update/${id}`, { json : payload })
    .json();
};

/* fetch receptionist */
export const fetchReceptionist = async (id) => {
  return await apiClient.get(`/admin/receptionist/${id}`).json();
};

/* fetch all receptionist */
export const fetchAllReceptionist = async () => {
  return await apiClient.get(`/admin/receptionist`).json();
};

/* delete receptionist */
export const removeReceptionist = async (id) => {
  return await apiClient.delete(`/admin/receptionist/delete/${id}`).json();
};

/* =================================================== */
/* GUEST */
/* =================================================== */
/* create guest */
export const createGuest = async (payload) => {
  return await apiClient.post("/guest/create", {json : payload}).json();
};

/* update guest */
export const patchGuest = async (id, payload) => {
  return await apiClient.patch(`/guest/update/${id}`, { json : payload}).json();
};

/* fetch guest */
export const fetchGuest = async (id) => {
  return await apiClient.get(`/guest/${id}`).json();
};

/* fetch guest list */
export const fetchAllGuest = async () => {
  return await apiClient.get(`/guest`).json();
};

/* delete guest */
export const deleteGuest = async (id) => {
  return await apiClient.delete(`/guest/delete/${id}`).json();
};

/* =================================================== */
/* BOOKINGS */
/* =================================================== */
/* Create booking */
export const createBooking = async (payload) => {
  return await apiClient.post(`/booking/create`, { json : payload}).json();
};

/* Update booking */
export const patchBooking = async (id, payload) => {
  return await apiClient.patch(`/booking/update/${id}`, {json : payload}).json();
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
  return await apiClient.patch(`/booking/cancel/${id}`,{ json:  payload }).json();
};

/* =================================================== */
/* ROOMS */
/* =================================================== */
/* create rooms */
export const createRoom = async (payload) => {
  return await apiClient.post(`/admin/room/create`, {json : payload}).json();
};

/* update room */
export const patchRoom = async (roomNumber, payload) => {
  return await apiClient
    .patch(`/admin/room/update/${roomNumber}`, {json : payload})
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
