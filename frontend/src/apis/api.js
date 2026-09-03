import apiClinet from './apiClient.js'

// Register
export const register = (payload) => {
    return apiClinet.post("", payload)
}

// Login
export const login = (payload) => {
    return apiClinet.post("", payload)
}

/* BOOKINGS */
/* create booking */
export const createBooking = async (payload) => {
  return await apiClinet.post(`/booking/create`, payload).json();
};

/* GUESTS */
/* create guest */
export const createGuest = async (payload) => {
  return await apiClinet.post(`/guest/create`, payload).json();
};

/* update guest */
export const patchGuest = async (id, payload) => {
  return await apiClinet
    .patch(`/guest/update/${id}`, payload)
    .json();
};

/* get guest */
export const fetchGuest = async (id) => {
  return await apiClinet.get(`/guest/${id}`).json();
};

/* delete guest */
export const deleteGuest = async (id) => {
  return await apiClinet.delete(`/guest/delete/${id}`).json();
};

/* ROOMS */
/* create rooms */
export const createRoom = async (payload) => {
  return await apiClinet.post(`/admin/room/create`, payload).json();
};

// Logout
export const logout = () => {
    return apiClinet.post("")
}