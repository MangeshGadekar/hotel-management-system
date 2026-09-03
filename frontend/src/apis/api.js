import { apiClient } from "./apiClient";

/* AUTHENTICATION */

/* BOOKINGS */

/* ROOMS */
/* create rooms */
export const createRoom = async (payload) => {
  return await apiClient.post(`/admin/room/create`, payload).json();
};

/* update room */
export const updateRoom = async (roomNumber, payload) => {
  return await apiClient.patch(`/admin/room/update/${roomNumber}`, payload).json();
};

/* delete room */
export const deleteRoom = async (roomNumber) => {
  return await apiClient.delete(`/admin/room/delete/${roomNumber}`).json();
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
