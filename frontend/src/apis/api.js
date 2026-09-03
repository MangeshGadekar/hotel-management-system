import { apiClient } from "./apiClient";

/* AUTHENTICATION */

/* GUEST */
/* create guest */
export const creteGuest = async (payload) => {
  return await apiClient.post("/guest/create", payload);
};

/* update guest */
export const updateGuest = async (id, payload) => {
  return await apiClient.patch(`/guest/update/${id}`, payload);
};

/* fetch guest */
export const fetchGuest = async (id) => {
  return await apiClient.get(`/guest/${id}`);
};

/* fetch users list */
export const fetchAllGuest = async () => {
  return await apiClient.get(`/guest`);
};

/* delete guest */
export const deleteGuest = async (id) => {
  return await apiClient.delete(`/guest/delete/${id}`);
};

/* BOOKINGS */

/* ROOMS */
/* create rooms */
export const createRoom = async (payload) => {
  return await apiClient.post(`/admin/room/create`, payload).json();
};

/* update room */
export const patchRoom = async (roomNumber, payload) => {
  return await apiClient
    .patch(`/admin/room/update/${roomNumber}`, payload)
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
