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

export const createBooking = async (payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post(`/booking/create`, {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const patchBooking = async (id, payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .patch(`/booking/update/${id}`, {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const updateBookingApi = patchBooking;

export const fetchBooking = async (id, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get(`/booking/${id}`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const fetchAllBooking = async (token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get(`/booking`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const cancelBooking = async (id, payload = {}, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .patch(`/booking/cancel/${id}`, {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

/* =================================================== */
/* BOOKINGS & OPERATIONS */
/* =================================================== */

export const checkInGuestApi = async (bookingId, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .patch(`booking/${bookingId}/check-in`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const checkOutGuestApi = async (bookingId, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .patch(`booking/${bookingId}/check-out`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const settleBalancePaymentApi = async (bookingId, payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post(`booking/${bookingId}/settle-balance`, {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const downloadCheckInReceiptApi = async (bookingId) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const response = await fetch(`http://localhost:8080/booking/${bookingId}/receipt-pdf`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download Check-In receipt PDF");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `CheckIn_Receipt_${bookingId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/* =================================================== */
/* EXTRA SERVICES */
/* =================================================== */

export const fetchActiveExtraServices = async () => {
  return await apiClient.get("api/extra-services").json();
};

export const createExtraServiceApi = async (payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post("api/extra-services", {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const addExtraServicesToBookingApi = async (bookingId, extraServiceIds, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post(`booking/${bookingId}/add-services`, {
      headers: getAuthHeaders(authToken),
      json: extraServiceIds,
    })
    .json();
};

export const addCustomServiceToBookingApi = async (bookingId, payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post(`booking/${bookingId}/add-custom-service`, {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const removeExtraServiceFromBookingApi = async (bookingId, serviceId, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .delete(`booking/${bookingId}/remove-service/${serviceId}`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

/* =================================================== */
/* COUPONS */
/* =================================================== */

export const fetchCouponsApi = async () => {
  return await apiClient.get("coupon").json();
};

/* =================================================== */
/* PAYMENTS & RAZORPAY GATEWAY */
/* =================================================== */

export const processPaymentApi = async (payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post("api/payments/pay", {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const createRazorpayOrderApi = async (bookingId, paymentType, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post("api/payments/razorpay/order", {
      headers: getAuthHeaders(authToken),
      searchParams: { bookingId, paymentType },
    })
    .json();
};

export const verifyRazorpayPaymentApi = async (payload, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post("api/payments/razorpay/verify", {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const fetchAllPaymentsApi = async (token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get("api/payments", {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const fetchPaymentsByBookingApi = async (bookingId, token = null) => {
  const authToken = token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get(`api/payments/booking/${bookingId}`, {
      headers: getAuthHeaders(authToken),
    })
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
/* CAMPAIGNS & DASHBOARD */
/* =================================================== */

export const createCampaings = async (token, payload) => {
  return await apiClient
    .post(`admin/campaigns`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const getAllCampaings = async (token) => {
  return apiClient
    .get(`/admin/campaigns`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const patchCampaing = async (token, campaignId, payload) => {
  return apiClient
    .post(`/admin/campaign/${campaignId}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const deleteCampaign = async (token, campaignId) => {
  return await apiClient
    .delete(`/admin/campaigns/${campaignId}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const adminDashboard = async (token) => {
  return await apiClient
    .get(`/admin/dashboard`, {
      headers: getAuthHeaders(token),
    })
    .json();
};