import { apiClient } from "./apiClient";

const getAuthHeaders = (token) => {
  const currentToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  if (!currentToken) return {};

  const cleanToken = currentToken.replace(/^"|"$/g, "").trim();

  return {
    Authorization: cleanToken.startsWith("Bearer ")
      ? cleanToken
      : `Bearer ${cleanToken}`,
  };
};

const triggerPdfViewOrDownload = (blob, filename = null) => {
  const pdfBlob = new Blob([blob], { type: "application/pdf" });
  const viewUrl = window.URL.createObjectURL(pdfBlob);

  if (filename) {
    const link = document.createElement("a");
    link.href = viewUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(viewUrl, "_blank");
  }

  setTimeout(() => {
    window.URL.revokeObjectURL(viewUrl);
  }, 60000);
};

/* =================================================== */
/* AUTHENTICATION                                      */
/* =================================================== */

export const userRegister = async (payload) => {
  return await apiClient.post("auth/signup", { json: payload }).json();
};

export const userLogin = async (payload) => {
  return await apiClient.post("auth/login", { json: payload }).json();
};

export const userLogout = async (token = null) => {
  return await apiClient
    .post("auth/logout", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const requestPasswordReset = async (email) => {
  return await apiClient.post("auth/forgot-password", { json: { email } }).json();
};

export const resetPassword = async (payload) => {
  return await apiClient.post("auth/reset-password", { json: payload }).json();
};

/* =================================================== */
/* RECEPTIONIST                                        */
/* =================================================== */

export const createReceptionist = async (payload, token = null) => {
  return await apiClient
    .post("admin/receptionist/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchReceptionist = async (id, payload, token = null) => {
  return await apiClient
    .patch(`admin/receptionist/update/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const fetchReceptionist = async (id, token = null) => {
  return await apiClient
    .get(`admin/receptionist/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllReceptionist = async (token = null) => {
  return await apiClient
    .get("admin/receptionist", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const removeReceptionist = async (id, token = null) => {
  return await apiClient
    .delete(`admin/receptionist/delete/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* =================================================== */
/* GUEST & OTP APIS                                    */
/* =================================================== */

export const createGuest = async (payload, token = null) => {
  return await apiClient
    .post("guest/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchGuest = async (id, payload, token = null) => {
  return await apiClient
    .patch(`guest/update/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const fetchGuest = async (id, token = null) => {
  return await apiClient
    .get(`guest/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllGuest = async (token = null) => {
  return await apiClient
    .get("guest", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const deleteGuest = async (id, token = null) => {
  return await apiClient
    .delete(`guest/delete/${id}`, {
      headers: getAuthHeaders(token),
    })
    .text();
};

export const searchGuestByQuery = async (query, token = null) => {
  return await apiClient
    .get(`guest/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const checkEmailExists = async (email, token = null) => {
  return await apiClient
    .get(`guest/check-email?email=${encodeURIComponent(email)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const getGuestByEmail = async (email, token = null) => {
  return await apiClient
    .get(`guest/by-email?email=${encodeURIComponent(email)}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const sendGuestOtp = async (email, token = null) => {
  const options = token ? { headers: getAuthHeaders(token) } : {};
  return await apiClient
    .post(`guest/send-otp?email=${encodeURIComponent(email)}`, options)
    .text();
};

export const verifyGuestOtpAndSave = async (payload, token = null) => {
  const options = { json: payload, headers: getAuthHeaders(token) };
  return await apiClient.post("guest/verify-otp", options).json();
};

/* =================================================== */
/* BOOKINGS & OPERATIONS                               */
/* =================================================== */

export const createBooking = async (payload, token = null) => {
  return await apiClient
    .post("booking/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const patchBooking = async (id, payload, token = null) => {
  return await apiClient
    .patch(`booking/update/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const updateBookingApi = patchBooking;

export const fetchBooking = async (id, token = null) => {
  return await apiClient
    .get(`booking/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllBooking = async (token = null) => {
  return await apiClient
    .get("booking", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const cancelBooking = async (bookingId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  return await apiClient
    .patch(`booking/cancel/${bookingId}`, {
      headers: getAuthHeaders(authToken),
    })
    .text();
};

export const cancelBookingApi = cancelBooking;

export const checkInGuestApi = async (bookingId, token = null) => {
  return await apiClient
    .patch(`booking/${bookingId}/check-in`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const checkOutGuestApi = async (bookingId, token = null) => {
  return await apiClient
    .patch(`booking/${bookingId}/check-out`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const extendStayApi = async (bookingId, newCheckOutDate, token = null) => {
  return await apiClient
    .patch(`booking/${bookingId}/extend-stay?newCheckOutDate=${newCheckOutDate}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const switchRoomApi = async (bookingId, targetRoomId, reason = "", sourceRoomId = null, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  let url = `booking/${bookingId}/switch-room?targetRoomId=${targetRoomId}&reason=${encodeURIComponent(
    reason || ""
  )}`;
  
  if (sourceRoomId) {
    url += `&sourceRoomId=${sourceRoomId}`;
  }

  return await apiClient
    .patch(url, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const fetchBookingsByGuestIdApi = async (guestId, token = null) => {
  return await apiClient
    .get(`booking/guest/${guestId}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAdminAvailableRoomsByDatesApi = async (
  checkInDate,
  checkOutDate,
  guests = 1,
  token = null
) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  return await apiClient
    .get(
      `booking/available-rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`,
      {
        headers: getAuthHeaders(authToken),
      }
    )
    .json();
};

/* =================================================== */
/* PDF SLIP & RECEIPT DOWNLOADS                        */
/* =================================================== */

export const downloadCheckInReceiptApi = async (bookingId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  const blob = await apiClient
    .get(`booking/${bookingId}/check-in-receipt-pdf`, {
      headers: getAuthHeaders(authToken),
    })
    .blob();

  triggerPdfViewOrDownload(blob);
};

export const downloadMasterFolioReceiptApi = async (bookingId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  const blob = await apiClient
    .get(`booking/${bookingId}/master-receipt-pdf`, {
      headers: getAuthHeaders(authToken),
    })
    .blob();

  triggerPdfViewOrDownload(blob);
};

export const downloadPaymentReceiptApi = async (paymentId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  const blob = await apiClient
    .get(`api/payments/${paymentId}/receipt-pdf`, {
      headers: getAuthHeaders(authToken),
    })
    .blob();

  triggerPdfViewOrDownload(blob);
};

export const openReceiptByNumberPdfApi = async (receiptNumber, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  const blob = await apiClient
    .get(`booking/receipt-by-number/${encodeURIComponent(receiptNumber)}/pdf`, {
      headers: getAuthHeaders(authToken),
    })
    .blob();

  triggerPdfViewOrDownload(blob);
};

export const downloadReceiptByNumberApi = openReceiptByNumberPdfApi;

export const downloadCancellationReceiptPdf = async (bookingId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");

  const blob = await apiClient
    .get(`booking/${bookingId}/cancellation-receipt-pdf`, {
      headers: getAuthHeaders(authToken),
    })
    .blob();

  triggerPdfViewOrDownload(blob, `Cancellation_Slip_Booking_${bookingId}.pdf`);
};

/* =================================================== */
/* EXTRA SERVICES                                      */
/* =================================================== */

export const getActiveExtraServicesApi = async (category = null, token = null) => {
  const url = category
    ? `api/extra-services?category=${encodeURIComponent(category)}`
    : "api/extra-services";

  return await apiClient
    .get(url, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchActiveExtraServices = async () => {
  return await apiClient.get("api/extra-services").json();
};

export const getExtraServiceByIdApi = async (id, token = null) => {
  return await apiClient
    .get(`api/extra-services/${id}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const getAllExtraServicesAdminApi = async (token = null) => {
  return await apiClient
    .get("api/extra-services/admin/all", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const createExtraServiceAdminApi = async (payload, token = null) => {
  return await apiClient
    .post("api/extra-services/admin", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const updateExtraServiceAdminApi = async (id, payload, token = null) => {
  return await apiClient
    .put(`api/extra-services/admin/${id}`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const toggleExtraServiceStatusAdminApi = async (id, token = null) => {
  return await apiClient
    .patch(`api/extra-services/admin/${id}/toggle-status`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const deleteExtraServiceAdminApi = async (id, token = null) => {
  return await apiClient
    .delete(`api/extra-services/admin/${id}`, {
      headers: getAuthHeaders(token),
    })
    .text();
};

export const addExtraServicesToBookingApi = async (
  bookingId,
  extraServiceIds,
  token = null
) => {
  return await apiClient
    .post(`booking/${bookingId}/add-services`, {
      headers: getAuthHeaders(token),
      json: extraServiceIds,
    })
    .json();
};

export const addCustomServiceToBookingApi = async (
  bookingId,
  payload,
  token = null
) => {
  return await apiClient
    .post(`booking/${bookingId}/add-custom-service`, {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const removeExtraServiceFromBookingApi = async (
  bookingId,
  serviceId,
  token = null
) => {
  return await apiClient
    .delete(`booking/${bookingId}/remove-service/${serviceId}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const removeServiceFromBookingApi = removeExtraServiceFromBookingApi;

export const fetchSettlementBreakdownApi = async (bookingId, token = null) => {
  return await apiClient
    .get(`booking/${bookingId}/settlement-breakdown`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* =================================================== */
/* COUPONS                                             */
/* =================================================== */

export const fetchCouponsApi = async (token = null) => {
  return await apiClient
    .get("api/coupons", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchAllCupons = fetchCouponsApi;

export const createCupone = async (payload, token = null) => {
  return await apiClient
    .post("api/coupons/create", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const deleteCupon = async (cuponId, token = null) => {
  return await apiClient
    .delete(`api/coupons/${cuponId}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchStaffCouponsApi = async (token = null) => {
  return await apiClient
    .get("api/coupons/active", {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* =================================================== */
/* POST-BOOKING DISCOUNT & SETTLEMENT                  */
/* =================================================== */

export const applyPostBookingDiscountApi = async (
  bookingId,
  discountValue,
  discountType = "FLAT",
  reason = "",
  token = null
) => {
  return await apiClient
    .patch(`booking/${bookingId}/apply-discount`, {
      headers: getAuthHeaders(token),
      searchParams: {
        discountValue: String(discountValue),
        discountType: String(discountType),
        ...(reason && reason.trim() ? { reason: reason.trim() } : {}),
      },
    })
    .json();
};

export const settlePartialPaymentApi = async (bookingId, payload, token = null) => {
  const searchParams = new URLSearchParams();
  searchParams.append("amount", String(payload.amount));
  searchParams.append("paymentMethod", payload.paymentMethod || "CASH");

  if (payload.discountAmount && Number(payload.discountAmount) > 0) {
    searchParams.append("discountAmount", String(payload.discountAmount));
    if (payload.discountReason) {
      searchParams.append("discountReason", payload.discountReason);
    }
  }

  if (Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0) {
    payload.serviceIds.forEach((id) => {
      if (id != null) searchParams.append("serviceIds", String(id));
    });
  }

  return await apiClient
    .post(`booking/${bookingId}/settle-payment`, {
      headers: getAuthHeaders(token),
      searchParams: searchParams,
    })
    .json();
};

export const fetchBookingDiscountsApi = async (bookingId, token = null) => {
  return await apiClient
    .get(`booking/${bookingId}/discounts`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

/* =================================================== */
/* PAYMENTS & RAZORPAY GATEWAY                         */
/* =================================================== */

export const processPaymentApi = async (payload, token = null) => {
  return await apiClient
    .post("api/payments/pay", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

export const fetchAllPaymentsApi = async (token = null) => {
  return await apiClient
    .get("api/payments", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const fetchPaymentsByBookingApi = async (bookingId, token = null) => {
  return await apiClient
    .get(`api/payments/booking/${bookingId}`, {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const createRazorpayOrderApi = async (bookingId, paymentType = "FULL") => {
  return await apiClient
    .post(`api/payments/razorpay/order?bookingId=${bookingId}&paymentType=${paymentType}`)
    .json();
};

export const verifyRazorpayPaymentApi = async (payload) => {
  return await apiClient
    .post("api/payments/razorpay/verify", { json: payload })
    .json();
};

/* =================================================== */
/* ROOMS                                               */
/* =================================================== */

export const createRoom = async (payload, token = null) => {
  const formData = new FormData();
  const safeAmenities = Array.isArray(payload.amenities) ? payload.amenities : [];

  const roomJson = JSON.stringify({
    roomNumber: String(payload.roomNumber),
    roomType: payload.roomType,
    pricePerNight: Number(payload.pricePerNight),
    capacity: Number(payload.capacity),
    roomStatus: payload.roomStatus,
    amenities: safeAmenities,
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
    .post("admin/room/create", {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": undefined,
      },
      body: formData,
    })
    .json();
};

export const patchRoom = async (roomNumber, payload, token = null) => {
  const formData = new FormData();

  const retainedImages = payload.imagePayload
    ? payload.imagePayload
        .filter((item) => item.type === "existing")
        .map((item) => item.url)
    : payload.images || [];

  const safeAmenities = Array.isArray(payload.amenities) ? payload.amenities : [];

  const roomJson = JSON.stringify({
    roomNumber: String(roomNumber),
    roomType: payload.roomType,
    pricePerNight: Number(payload.pricePerNight),
    capacity: Number(payload.capacity),
    roomStatus: payload.roomStatus,
    images: retainedImages,
    amenities: safeAmenities,
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
    .patch(`admin/room/update/${roomNumber}`, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": undefined,
      },
      body: formData,
    })
    .json();
};

export const fetchRoom = async (roomNumber) => {
  return await apiClient.get(`admin/room/${roomNumber}`).json();
};

export const fetchAllRooms = async () => {
  return await apiClient.get("admin/room").json();
};

export const typeOfRooms = async (roomType) => {
  return await apiClient.get(`admin/room/type/${roomType}`).json();
};

export const statusOfRooms = async (roomStatus) => {
  return await apiClient.get(`admin/room/status/${roomStatus}`).json();
};

export const deleteRoom = async (roomNumber, token = null) => {
  return await apiClient
    .delete(`admin/room/delete/${roomNumber}`, {
      headers: getAuthHeaders(token),
    })
    .text();
};

/* =================================================== */
/* USER PROFILE                                        */
/* =================================================== */

export const fetchProfile = async (token) => {
  return await apiClient
    .get("user/profile", { headers: getAuthHeaders(token) })
    .json();
};

export const updateProfile = async (payload, token) => {
  return await apiClient
    .patch("user/profile/edit", {
      headers: getAuthHeaders(token),
      json: payload,
    })
    .json();
};

/* =================================================== */
/* CAMPAIGNS & DASHBOARD                               */
/* =================================================== */

export const adminDashboard = async (token = null) => {
  return await apiClient
    .get("admin/dashboard", {
      headers: getAuthHeaders(token),
    })
    .json();
};

export const createCampaign = async (payload, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post("admin/campaigns", {
      headers: getAuthHeaders(authToken),
      json: payload,
    })
    .json();
};

export const createCampaings = createCampaign;

export const fetchAllCampaigns = async (token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get("admin/campaigns", {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const getAllCampaings = fetchAllCampaigns;

export const fetchCampaignAudience = async (campaignId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .get(`admin/campaigns/${campaignId}/audience`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const deleteCampaign = async (arg1, arg2 = null) => {
  let campaignId;
  let authToken;

  if (arg2 !== null && arg2 !== undefined) {
    authToken = arg1;
    campaignId = arg2;
  } else {
    campaignId = arg1;
    authToken = localStorage.getItem("token") || localStorage.getItem("authToken");
  }

  return await apiClient
    .delete(`admin/campaigns/${campaignId}`, {
      headers: getAuthHeaders(authToken),
    })
    .text();
};

export const sendCampaign = async (campaignId, token = null) => {
  const authToken =
    token || localStorage.getItem("token") || localStorage.getItem("authToken");
  return await apiClient
    .post(`admin/campaigns/${campaignId}/send`, {
      headers: getAuthHeaders(authToken),
    })
    .json();
};

export const sendCampaignApi = sendCampaign;

/* =================================================== */
/* PUBLIC GUEST SELF-BOOKING                           */
/* =================================================== */

export const searchAvailableRoomsApi = async (checkIn, checkOut, guests = 1) => {
  return await apiClient
    .get(`public/booking/available-rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
    .json();
};

export const fetchPublicAvailableRoomsApi = searchAvailableRoomsApi;

export const fetchPublicGuestCouponsApi = async () => {
  return await apiClient.get("public/booking/coupons").json();
};

export const initiateGuestBookingApi = async (payload) => {
  return await apiClient.post("public/booking/initiate", { json: payload }).json();
};

export const verifyGuestPaymentApi = async (payload) => {
  return await apiClient.post("public/booking/verify-payment", { json: payload }).json();
};

export const sendManageBookingOtpApi = async (bookingId, email) => {
  return await apiClient
    .post("public/booking/send-otp", {
      json: { bookingId, email },
    })
    .json();
};

export const verifyManageBookingOtpApi = async (bookingId, email, otp) => {
  return await apiClient
    .post("public/booking/verify-otp", {
      json: { bookingId, email, otp },
    })
    .json();
};

export const cancelGuestBooking = async (bookingId, guestEmail) => {
  return await apiClient
    .patch(`public/booking/cancel/${bookingId}`, {
      searchParams: { email: guestEmail },
    })
    .json();
};