import { apiClient } from "./apiClient";


const getAuthHeaders = (token) => {
  if (!token) return {};

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
    .text();
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
  console.log("token",token)
  return await apiClient
    .get(`/guest`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const deleteGuest = async (id, token) => {
  return await apiClient
    .delete(`/guest/delete/${id}`, {
      headers: getAuthHeaders(token),
    })
    .text();
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

export const sendGuestOtp = async (email, token = null) => {
  const options = token ? { headers: getAuthHeaders(token) } : {};
  return await apiClient
    .post(`/guest/send-otp?email=${encodeURIComponent(email)}`, options)
    .text();
};

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
  const formData = new FormData();

  const roomJson = JSON.stringify({
    roomNumber: String(payload.roomNumber),
    roomType: payload.roomType,
    pricePerNight: Number(payload.pricePerNight),
    capacity: Number(payload.capacity),
    roomStatus: payload.roomStatus,
  });

  formData.append("room", roomJson);
  formData.append("roomNumber", String(payload.roomNumber));
  formData.append("roomType", payload.roomType);
  formData.append("pricePerNight", String(payload.pricePerNight));
  formData.append("capacity", String(payload.capacity));
  formData.append("roomStatus", payload.roomStatus);

  if (payload.imagePayload && Array.isArray(payload.imagePayload)) {
    payload.imagePayload.forEach((item) => {
      if (item.type === "new" && item.file instanceof File) {
        formData.append("files", item.file);
      }
    });
  }

  return await apiClient
    .post("/admin/room/create", {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": undefined,
      },
      body: formData,
    })
    .json();
};

export const patchRoom = async (roomNumber, payload, token) => {
  const formData = new FormData();

  const retainedImages = payload.imagePayload
    ? payload.imagePayload
        .filter((item) => item.type === "existing")
        .map((item) => item.url)
    : payload.images || [];

  const roomJson = JSON.stringify({
    roomType: payload.roomType,
    pricePerNight: Number(payload.pricePerNight),
    capacity: Number(payload.capacity),
    roomStatus: payload.roomStatus,
    images: retainedImages,
  });

  formData.append("room", roomJson);
  formData.append("roomType", payload.roomType);
  formData.append("pricePerNight", String(payload.pricePerNight));
  formData.append("capacity", String(payload.capacity));
  formData.append("roomStatus", payload.roomStatus);

  if (payload.imagePayload && Array.isArray(payload.imagePayload)) {
    payload.imagePayload.forEach((item) => {
      if (item.type === "new" && item.file instanceof File) {
        formData.append("files", item.file);
      }
    });
  }

  return await apiClient
    .patch(`/admin/room/update/${roomNumber}`, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": undefined,
      },
      body: formData,
    })
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

export const deleteRoom = async (roomNumber, token) => {
  return await apiClient
    .delete(`/admin/room/delete/${roomNumber}`, {
      headers: getAuthHeaders(token),
    })
    .text();
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
export const patchCampaing = async (token, campaignId, payload) => {
  return apiClient
    .post(`/admin/campaign/${campaignId}`, {
      headers: {
        Authorization: token,
      },
      json: payload,
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
/* CAMPAINGS */
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
