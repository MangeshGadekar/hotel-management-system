import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  FiCalendar,
  FiPlusCircle,
  FiCreditCard,
  FiCheckCircle,
  FiPrinter,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useBookingStore from "../../app/useBookingStore";
import useGuestStore from "../../app/useGuestStore";
import useRoomStore from "../../app/useRoomStore";
import useAuthStore from "../../app/useAuthStore";
import {
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
} from "../../apis/api";
import useCuponesStore from "../../app/useCuponesStore";

// ---------------- Constants ----------------
const STEPS = [
  { id: 1, label: "Guest Registration & Verification" },
  { id: 2, label: "Stay Dates & Available Room" },
  { id: 3, label: "Extra Services & Available Promotions" },
  { id: 4, label: "Live Billing Breakdown & Payment" },
  { id: 5, label: "Confirmation & Key Handover" },
];

const PAYMENT_METHODS = {
  CASH: "CASH",
  CARD_MACHINE: "CARD_MACHINE",
  RAZORPAY_ONLINE: "RAZORPAY_ONLINE",
};

const PAYMENT_TYPES = {
  FULL: "FULL",
  SPLIT_ADVANCE: "SPLIT_ADVANCE",
};

const ADVANCE_RATE = 0.4;
const GST_RATE = 0.18;
const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 30;
const PHONE_LENGTH = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const emptyGuestForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  idProofType: "AADHAR_CARD",
  idProofNumber: "",
};

// ---------------- Helpers ----------------
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const toDateInputValue = (date) => {
  const d = new Date(date);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split("T")[0];
};

const nightsBetween = (checkIn, checkOut) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 1;
  const diff = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(diff) || 1);
};

const guestToForm = (guest) => {
  if (!guest) return { ...emptyGuestForm };
  return {
    firstName: guest.firstName || guest.first_name || "",
    lastName: guest.lastName || guest.last_name || "",
    email: guest.email || "",
    phone: guest.phone || "",
    dateOfBirth: guest.dateOfBirth || "",
    address: guest.address || "",
    city: guest.city || "",
    state: guest.state || "",
    postalCode: guest.postalCode || "",
    idProofType: guest.idProofType || guest.id_proof_type || "AADHAR_CARD",
    idProofNumber: guest.idProofNumber || guest.id_proof_number || "",
  };
};

const validateGuestForm = (data) => {
  if (!data.firstName.trim() || !data.lastName.trim()) {
    return "First Name and Last Name are required.";
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!PHONE_REGEX.test(data.phone.trim())) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return null;
};

const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || subtotal <= 0) return 0;
  const value = Number(
    coupon.discountValue ?? coupon.discount ?? coupon.value ?? 0,
  );
  if (!Number.isFinite(value) || value <= 0) return 0;

  const type = String(coupon.discountType || coupon.type || "").toUpperCase();

  if (type === "PERCENTAGE") {
    return Math.min(Math.round((subtotal * value) / 100), subtotal);
  }
  // default to flat amount
  return Math.min(Math.round(value), subtotal);
};

// ---------------- Receipt Sub-component ----------------
function ReceiptView({
  completedBooking,
  selectedRoom,
  formData,
  stayDates,
  nights,
  selectedServices,
  roomCharges,
  subtotal,
  couponDiscount,
  selectedCoupon,
  taxableAmount,
  taxAmount,
  totalAmount,
  amountToPayNow,
  balanceDue,
  paymentMethod,
  paymentType,
  cardMachineAuthCode,
}) {
  const safePaymentMethod = paymentMethod || PAYMENT_METHODS.CASH;
  const safePaymentType = paymentType || PAYMENT_TYPES.FULL;

  return (
    <div
      id="printable-receipt"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-800 font-sans shadow-xs max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-start border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            ATHENURA GRAND
          </h2>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold tracking-widest uppercase">
            CHECK-IN RECEIPT
          </span>
          <p className="text-xs font-mono font-semibold text-slate-700 mt-2">
            Invoice: INV-{completedBooking.id}-{new Date().getFullYear()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Date:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-100 text-xs">
        <div>
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
            Guest Details
          </p>
          <p className="font-bold text-slate-900 text-sm">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-slate-600 mt-0.5">Phone: {formData.phone}</p>
          <p className="text-slate-600">Email: {formData.email}</p>
          {formData.idProofNumber && (
            <p className="text-slate-500 mt-1">
              ID: {formData.idProofType.replace("_", " ")} (
              {formData.idProofNumber})
            </p>
          )}
        </div>

        <div>
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
            Reservation Particulars
          </p>
          <p className="font-bold text-slate-900 text-sm">
            Room {selectedRoom?.roomNumber}{" "}
            <span className="text-xs font-medium text-slate-500">
              ({selectedRoom?.roomType})
            </span>
          </p>
          <p className="text-slate-600 mt-0.5">
            Check-In: <strong>{stayDates.checkInDate}</strong>
          </p>
          <p className="text-slate-600">
            Check-Out: <strong>{stayDates.checkOutDate}</strong> ({nights}{" "}
            {nights === 1 ? "Night" : "Nights"})
          </p>
          <p className="text-slate-500 mt-1 font-mono">
            Booking ID: #{completedBooking.id}
          </p>
        </div>
      </div>

      <div className="py-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] text-left">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-center">Qty / Duration</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-2.5 font-medium text-slate-800">
                Room Stay ({selectedRoom?.roomType})
              </td>
              <td className="py-2.5 text-center">{nights} nights</td>
              <td className="py-2.5 text-right font-mono">
                ₹{Number(selectedRoom?.pricePerNight || 0).toLocaleString()}
              </td>
              <td className="py-2.5 text-right font-mono font-medium">
                ₹{roomCharges.toLocaleString()}
              </td>
            </tr>

            {selectedServices.map((srv) => {
              const lineAmount =
                srv.priceType === "PER_NIGHT"
                  ? Number(srv.price) * nights
                  : Number(srv.price);
              return (
                <tr key={srv.id || srv.name}>
                  <td className="py-2.5">
                    {srv.name}{" "}
                    <span className="text-[10px] text-slate-400">
                      ({srv.taxRate}% GST)
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    {srv.priceType === "PER_NIGHT" ? `${nights} nights` : "1 time"}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    ₹{Number(srv.price).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium">
                    ₹{lineAmount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200 text-xs">
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Payment Record
          </p>
          <p className="text-slate-600">
            Mode:{" "}
            <strong className="text-slate-800">
              {safePaymentMethod.replace(/_/g, " ")}
            </strong>
          </p>
          <p className="text-slate-600">
            Policy:{" "}
            <strong className="text-slate-800">
              {safePaymentType.replace(/_/g, " ")}
            </strong>
          </p>

          {safePaymentMethod === PAYMENT_METHODS.CARD_MACHINE &&
            cardMachineAuthCode && (
              <p className="text-blue-700 font-mono font-medium pt-1">
                Slip Auth/RRN: <strong>{cardMachineAuthCode}</strong>
              </p>
            )}

          {safePaymentMethod === PAYMENT_METHODS.RAZORPAY_ONLINE && (
            <p className="text-emerald-700 font-mono text-[11px] pt-1">
              Gateway Status: Verified Online
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-right">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount ({selectedCoupon?.code}):</span>
              <span className="font-mono">
                -₹{couponDiscount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span className="font-mono">
              ₹{taxableAmount.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Taxes & GST:</span>
            <span className="font-mono">₹{taxAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-black text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono">₹{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold text-emerald-700 pt-1">
            <span>Amount Paid:</span>
            <span className="font-mono">
              ₹{amountToPayNow.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between font-bold text-amber-700">
            <span>Balance Due:</span>
            <span className="font-mono">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-1">
        <p className="text-xs font-semibold text-slate-800">
          Thank you for choosing Athenura Grand Hotel! We wish you a delightful
          stay.
        </p>
      </div>
    </div>
  );
}

// ---------------- Main Component ----------------
export default function BookingForm({
  onSuccess = () => {},
  onCancel = () => {},
  className = "",
  preSelectedGuest = null,
  currentUserId,
  roomId = null,
  guestMode = false,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth
  const token =
    useAuthStore((state) => state.token) ||
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("token") || localStorage.getItem("authToken")));

  // Stores
  const addBooking = useBookingStore((state) => state.addBooking);
  const checkInBooking = useBookingStore((state) => state.checkInBooking);
  const extraServicesCatalog =
    useBookingStore((state) => state.extraServices) || [];
  const loadExtraServices = useBookingStore((state) => state.loadExtraServices);
  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  const getRoomById = useRoomStore((state) => state.getRoomById);
  const getAllCuponse = useCuponesStore((state) => state.getAllCuponse);

  // Guest store
  const {
    sendOtp,
    verifyOtpAndSave,
    searchGuests,
    searchResults = [],
    clearSearchResults = () => {},
    loading: guestLoading = false,
  } = useGuestStore();

  // Step 1 — guest form
  const [formData, setFormData] = useState(() => guestToForm(preSelectedGuest));
  const [verifiedGuestId, setVerifiedGuestId] = useState(
    preSelectedGuest?.id || null,
  );
  const [isExistingGuest, setIsExistingGuest] = useState(
    Boolean(preSelectedGuest),
  );
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const dropdownRef = useRef(null);
  const otpInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Step 2 — dates & rooms
  const [stayDates, setStayDates] = useState(() => ({
    checkInDate: toDateInputValue(new Date()),
    checkOutDate: toDateInputValue(Date.now() + 86400000),
  }));
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [roomLoading, setRoomLoading] = useState(Boolean(roomId));
  const [roomError, setRoomError] = useState("");

  // Step 4 — billing
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.FULL);
  const [paymentMethod, setPaymentMethod] = useState(
    guestMode ? PAYMENT_METHODS.RAZORPAY_ONLINE : PAYMENT_METHODS.CASH,
  );
  const [cardMachineAuthCode, setCardMachineAuthCode] = useState("");
  const [completedBooking, setCompletedBooking] = useState(null);

  // Sync preSelectedGuest prop changes
  useEffect(() => {
    if (preSelectedGuest) {
      setFormData(guestToForm(preSelectedGuest));
      setVerifiedGuestId(preSelectedGuest.id || preSelectedGuest._id || null);
      setIsExistingGuest(true);
    }
  }, [preSelectedGuest]);

  // ---------------- Initialization ----------------
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const [roomsData, , couponsData] = await Promise.all([
          getRoomsList ? getRoomsList() : Promise.resolve([]),
          loadExtraServices ? loadExtraServices() : Promise.resolve([]),
          getAllCuponse ? getAllCuponse().catch(() => []) : Promise.resolve([]),
        ]);
        if (cancelled) return;

        const roomsArray = Array.isArray(roomsData) ? roomsData : [];
        setRooms(roomsArray);
        setAvailableCoupons(Array.isArray(couponsData) ? couponsData : []);

        if (roomId) {
          setRoomLoading(true);
          setRoomError("");

          let room = null;
          if (typeof getRoomById === "function") {
            try {
              room = await getRoomById(roomId);
            } catch (err) {
              console.warn("getRoomById failed, falling back to list:", err);
            }
          }
          if (!room) {
            room =
              roomsArray.find(
                (r) =>
                  String(r.id) === String(roomId) ||
                  String(r.roomNumber) === String(roomId),
              ) || null;
          }
          if (cancelled) return;

          if (room) {
            setSelectedRoom(room);
          } else {
            setRoomError(
              `Room #${roomId} could not be found. Please pick a different room.`,
            );
          }
          setRoomLoading(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if (!cancelled) {
          setRoomLoading(false);
          if (roomId) {
            setRoomError("Failed to load room details. Please try again.");
          }
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [getRoomsList, loadExtraServices, getAllCuponse, getRoomById, roomId]);

  // Outside click for guest search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // OTP resend countdown
  useEffect(() => {
    if (!showOtpModal || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, resendTimer]);

  // Auto-focus OTP input when modal opens
  useEffect(() => {
    if (showOtpModal) {
      const raf = requestAnimationFrame(() => {
        otpInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [showOtpModal]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ---------------- Guest handlers ----------------
  const handleEmailChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, email: value }));
      setIsExistingGuest(false);
      setVerifiedGuestId(null);

      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.trim().length >= 2) {
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            await searchGuests(value, token);
            setShowDropdown(true);
          } catch {
            setShowDropdown(false);
          }
        }, 400);
      } else {
        clearSearchResults();
        setShowDropdown(false);
      }
    },
    [searchGuests, clearSearchResults, token],
  );

  const handleSelectExistingGuest = useCallback(
    (guestItem) => {
      setFormData(guestToForm(guestItem));
      setVerifiedGuestId(guestItem.id || guestItem._id);
      setIsExistingGuest(true);
      setShowDropdown(false);
      clearSearchResults();
      toast.success(
        `Guest loaded: ${guestItem.firstName} ${guestItem.lastName}`,
      );
    },
    [clearSearchResults],
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setError("");
    if (name === "phone") {
      const sanitized = value.replace(/\D/g, "");
      if (sanitized.length <= PHONE_LENGTH) {
        setFormData((prev) => ({ ...prev, phone: sanitized }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleInitiateSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      setError("");

      const validationError = validateGuestForm(formData);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (isExistingGuest && verifiedGuestId) {
        setStep(2);
        return;
      }

      try {
        await sendOtp(formData.email.trim(), token);
        setShowOtpModal(true);
        setResendTimer(OTP_RESEND_SECONDS);
        setOtpError("");
        setOtp("");
      } catch (err) {
        setError(
          err.message ||
            "Failed to send OTP. Please check your email address and try again.",
        );
      }
    },
    [formData, isExistingGuest, verifiedGuestId, sendOtp, token],
  );

  const handleResendOtp = useCallback(async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      await sendOtp(formData.email.trim(), token);
      setResendTimer(OTP_RESEND_SECONDS);
      setOtp("");
      toast.success("New OTP sent!");
    } catch (err) {
      setOtpError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [resendTimer, isResending, sendOtp, formData.email, token]);

  const handleVerifyOtp = useCallback(
    async (e) => {
      e.preventDefault();
      setOtpError("");

      if (!otp || otp.trim().length !== OTP_LENGTH) {
        setOtpError(`Please enter a valid ${OTP_LENGTH}-digit OTP.`);
        return;
      }

      const cleanedGuestData = {
        ...formData,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        createdBy: currentUserId || null,
      };

      const payload = {
        email: formData.email.trim(),
        otp: otp.trim(),
        guestData: cleanedGuestData,
      };

      try {
        const savedGuest = await verifyOtpAndSave(payload, token);
        const guestId = savedGuest.id || savedGuest._id;
        setVerifiedGuestId(guestId);
        setIsExistingGuest(true);
        setShowOtpModal(false);
        setOtp("");
        toast.success("Guest verified and registered!");
        setStep(2);
      } catch (err) {
        setOtpError(
          err.message ||
            "Failed to create/update guest. Invalid OTP or verification failed.",
        );
      }
    },
    [otp, formData, currentUserId, verifyOtpAndSave, token],
  );

  // ---------------- Calculations ----------------
  const nights = useMemo(
    () => nightsBetween(stayDates.checkInDate, stayDates.checkOutDate),
    [stayDates.checkInDate, stayDates.checkOutDate],
  );

  const availableRooms = useMemo(
    () => rooms.filter((r) => (r.roomStatus || r.status) === "AVAILABLE"),
    [rooms],
  );

  const roomCharges = selectedRoom
    ? Number(selectedRoom.pricePerNight || 0) * nights
    : 0;

  const selectedServices = useMemo(
    () =>
      (extraServicesCatalog || []).filter((s) =>
        selectedServiceIds.includes(s.id),
      ),
    [extraServicesCatalog, selectedServiceIds],
  );

  const extraServicesTotal = useMemo(
    () =>
      selectedServices.reduce((acc, s) => {
        const price = Number(s.price) || 0;
        return acc + (s.priceType === "PER_NIGHT" ? price * nights : price);
      }, 0),
    [selectedServices, nights],
  );

  const subtotal = roomCharges + extraServicesTotal;

  const couponDiscount = useMemo(
    () => calculateCouponDiscount(selectedCoupon, subtotal),
    [selectedCoupon, subtotal],
  );

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const discountRatio =
    subtotal > 0 && couponDiscount > 0 ? 1 - couponDiscount / subtotal : 1;

  const taxAmount = useMemo(() => {
    const roomTax = roomCharges * discountRatio * GST_RATE;
    const servicesTax = selectedServices.reduce((acc, s) => {
      const price = Number(s.price) || 0;
      const itemCost = s.priceType === "PER_NIGHT" ? price * nights : price;
      const rate = (Number(s.taxRate) || 18) / 100;
      return acc + itemCost * discountRatio * rate;
    }, 0);
    return Math.round(roomTax + servicesTax);
  }, [roomCharges, discountRatio, selectedServices, nights]);

  const totalAmount = Math.round(taxableAmount + taxAmount);
  const amountToPayNow =
    paymentType === PAYMENT_TYPES.SPLIT_ADVANCE
      ? Math.round(totalAmount * ADVANCE_RATE)
      : totalAmount;
  const balanceDue = totalAmount - amountToPayNow;

  const toggleService = useCallback((id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleToggleCoupon = useCallback(
    (cpn) => {
      const isSame =
        (selectedCoupon?.id && selectedCoupon.id === cpn.id) ||
        (selectedCoupon?.code && selectedCoupon.code === cpn.code);

      if (isSame) {
        setSelectedCoupon(null);
        toast.success("Coupon removed");
      } else {
        setSelectedCoupon(cpn);
        const discount = calculateCouponDiscount(cpn, subtotal);
        toast.success(
          `Coupon ${cpn.code} applied! Saved ₹${discount.toLocaleString()}`,
        );
      }
    },
    [selectedCoupon, subtotal],
  );

  // ---------------- Finalize booking ----------------
  const handleFinalizeBooking = useCallback(async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (
      paymentMethod === PAYMENT_METHODS.CARD_MACHINE &&
      !cardMachineAuthCode.trim()
    ) {
      toast.error("Please enter the physical card machine Auth / Slip code.");
      return;
    }

    const bookingRoomId = roomId || selectedRoom?.id;
    if (!bookingRoomId) {
      toast.error("Please select a room before proceeding.");
      return;
    }

    setIsSubmitting(true);
    const isOnline = paymentMethod === PAYMENT_METHODS.RAZORPAY_ONLINE;

    try {
      const payload = {
        guestId: verifiedGuestId || null,
        guest: verifiedGuestId
          ? null
          : {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              idProofType: formData.idProofType,
              idProofNumber: formData.idProofNumber.trim(),
            },
        roomId: bookingRoomId,
        checkInDate: stayDates.checkInDate,
        checkOutDate: stayDates.checkOutDate,
        extraServiceIds: selectedServiceIds,
        couponCode: selectedCoupon?.code || null,
        paymentType,
        paymentMethod: isOnline ? null : paymentMethod,
        transactionReference:
          paymentMethod === PAYMENT_METHODS.CARD_MACHINE
            ? cardMachineAuthCode.trim()
            : null,
        amount: isOnline ? 0 : amountToPayNow,
      };

      const bookingRes = await addBooking(payload);
      if (!isOnline) {
        let checkedInRes = bookingRes;
        try {
          checkedInRes = await checkInBooking(bookingRes.id);
        } catch (err) {
          console.warn("Check-in note:", err);
        }
        setCompletedBooking(checkedInRes);
        setStep(5);
        toast.success(
          paymentMethod === PAYMENT_METHODS.CARD_MACHINE
            ? `Card payment recorded (Auth: ${cardMachineAuthCode}) & checked in!`
            : "Cash received & guest checked in!",
        );
        return;
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error(
          "Failed to load Razorpay SDK. Please check your internet connection.",
        );
        setIsSubmitting(false);
        return;
      }

      const order = await createRazorpayOrderApi(
        bookingRes.id,
        paymentType,
        token,
      );

      const options = {
        key: order.keyId,
        amount: order.amount, // API already returns paise
        currency: order.currency || "INR",
        name: "Athenura Grand Hotel",
        description: `Desk Settlement - Booking #${bookingRes.id}`,
        order_id: order.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#D96B43" },
        handler: async function (response) {
          try {
            await verifyRazorpayPaymentApi(
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: bookingRes.id,
                paymentType,
              },
              token,
            );

            let checkedInRes = bookingRes;
            try {
              checkedInRes = await checkInBooking(bookingRes.id);
            } catch (err) {
              console.warn("Check-in note:", err);
            }

            setCompletedBooking(checkedInRes);
            setStep(5);
            toast.success("Online payment verified & guest checked in!");
          } catch {
            toast.error("Signature verification failed.");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error(
              "Payment modal closed. Booking created with pending balance.",
            );
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        toast.error(`Payment failed: ${resp.error.description}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.message || "Failed to finalize booking");
      setIsSubmitting(false);
    }
  }, [
    paymentMethod,
    cardMachineAuthCode,
    roomId,
    selectedRoom,
    verifiedGuestId,
    formData,
    stayDates.checkInDate,
    stayDates.checkOutDate,
    selectedServiceIds,
    selectedCoupon,
    paymentType,
    amountToPayNow,
    addBooking,
    checkInBooking,
    token,
  ]);

  // Validation for step 1 next button
  const canSubmitStep1 = useMemo(() => {
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) return false;
    if (!formData.email?.trim()) return false;
    if (!PHONE_REGEX.test(formData.phone?.trim() || "")) return false;
    return !guestLoading;
  }, [
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.phone,
    guestLoading,
  ]);

  const canProceedFromStep2 = Boolean(roomId || selectedRoom) && !roomLoading;

  const currentStepMeta = STEPS[step - 1];

  return (
    <div className={`flex flex-col h-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Desk Walk-In Booking & Check-In
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {step} of {STEPS.length} — {currentStepMeta?.label}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {/* STEP 1 */}
        {step === 1 && (
          <form
            onSubmit={handleInitiateSubmit}
            className="space-y-4 text-sm text-slate-700"
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 fill-current text-red-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email search */}
            <div className="relative" ref={dropdownRef}>
              <label className="block font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="off"
                placeholder="Type email to search or register..."
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((guestItem) => (
                    <div
                      key={guestItem.id || guestItem._id}
                      onClick={() => handleSelectExistingGuest(guestItem)}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {guestItem.firstName} {guestItem.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {guestItem.email} | {guestItem.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isExistingGuest && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 fill-current text-blue-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                </svg>
                <span>
                  Existing guest details auto-filled. Modify details below if
                  required.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={PHONE_LENGTH}
                  inputMode="numeric"
                  placeholder="10 digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">ID Proof Type</label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                >
                  <option value="AADHAR_CARD">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  ID Proof Number
                </label>
                <input
                  type="text"
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiCalendar className="text-[#D96B43]" /> 2. Dates & Available
              Rooms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={stayDates.checkInDate}
                  min={toDateInputValue(new Date())}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    setStayDates((prev) => ({
                      checkInDate: newCheckIn,
                      checkOutDate:
                        prev.checkOutDate <= newCheckIn
                          ? toDateInputValue(
                              new Date(newCheckIn).getTime() + 86400000,
                            )
                          : prev.checkOutDate,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={stayDates.checkOutDate}
                  min={toDateInputValue(
                    new Date(stayDates.checkInDate).getTime() + 86400000,
                  )}
                  onChange={(e) =>
                    setStayDates((prev) => ({
                      ...prev,
                      checkOutDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {roomId ? (
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Selected Room
                </label>
                {roomLoading ? (
                  <div className="p-4 border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    Loading room details for #{roomId}...
                  </div>
                ) : roomError ? (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-red-600 text-xs">
                    {roomError}
                  </div>
                ) : selectedRoom ? (
                  <div className="p-4 border border-[#D96B43] bg-orange-50/50 ring-1 ring-[#D96B43] rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Room {selectedRoom.roomNumber}{" "}
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                          ({selectedRoom.roomType})
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Capacity: {selectedRoom.capacity} • Status:{" "}
                        {selectedRoom.roomStatus || selectedRoom.status}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#D96B43] text-sm">
                      ₹{selectedRoom.pricePerNight}
                      <span className="text-[10px] text-slate-400 font-normal">
                        /nt
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="p-4 border border-slate-200 rounded-xl text-slate-400 text-xs">
                    Room not loaded.
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Available Rooms ({availableRooms.length} Ready for Check-In)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition flex justify-between items-center ${
                        selectedRoom?.id === room.id
                          ? "border-[#D96B43] bg-orange-50/50 ring-1 ring-[#D96B43]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          Room {room.roomNumber}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {room.roomType} | Capacity: {room.capacity}
                        </p>
                      </div>
                      <span className="font-extrabold text-[#D96B43] text-sm">
                        ₹{room.pricePerNight}
                        <span className="text-[10px] text-slate-400 font-normal">
                          /nt
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                <FiPlusCircle className="text-[#D96B43]" /> Extra Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {extraServicesCatalog.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-3.5 border rounded-xl flex justify-between items-center cursor-pointer transition ${
                      selectedServiceIds.includes(service.id)
                        ? "border-[#D96B43] bg-orange-50/40 ring-1 ring-[#D96B43]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        {service.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {service.description || service.category} (
                        {service.taxRate}% GST)
                      </p>
                    </div>
                    <span className="font-bold text-sm text-slate-700">
                      ₹{service.price}
                      {service.priceType === "PER_NIGHT" && (
                        <span className="text-[10px] text-slate-400">/nt</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                <FiTag className="text-[#D96B43]" /> Promotional Coupons
              </h3>

              {availableCoupons.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  No active promotions available at this time.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto">
                  {availableCoupons.map((cpn) => {
                    const isSelected =
                      (selectedCoupon?.code &&
                        selectedCoupon.code === cpn.code) ||
                      (selectedCoupon?.id && selectedCoupon.id === cpn.id);
                    const type = String(
                      cpn.discountType || cpn.type || "",
                    ).toUpperCase();
                    const value =
                      cpn.discountValue ?? cpn.discount ?? cpn.value ?? 0;
                    const discountText =
                      type === "PERCENTAGE"
                        ? `${value}% OFF`
                        : `₹${value} OFF`;

                    return (
                      <div
                        key={cpn.id || cpn.code}
                        className={`p-3.5 border rounded-xl flex flex-col justify-between transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[11px] font-mono font-bold tracking-wider uppercase">
                              {cpn.code}
                            </span>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {cpn.description || "Stay Promotion"}
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full shrink-0">
                            {discountText}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(cpn)}
                          className={`mt-2 py-1 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isSelected ? "Remove Coupon" : "Apply Coupon"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiCreditCard className="text-[#D96B43]" /> 4. Live Billing &
              Counter Payment
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>
                  Room Charges ({selectedRoom?.roomType} × {nights} nights)
                </span>
                <span className="font-semibold">
                  ₹{roomCharges.toLocaleString()}
                </span>
              </div>
              {selectedServices.map((s) => {
                const amount =
                  s.priceType === "PER_NIGHT"
                    ? Number(s.price) * nights
                    : Number(s.price);
                return (
                  <div
                    key={s.id}
                    className="flex justify-between text-slate-500"
                  >
                    <span>
                      {s.name} ({s.taxRate}% GST)
                    </span>
                    <span>₹{amount.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-700">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({selectedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>₹{taxableAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Itemized GST</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-800">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Payment Split Policy
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value={PAYMENT_TYPES.FULL}>
                    100% Full Payment (₹{totalAmount.toLocaleString()})
                  </option>
                  <option value={PAYMENT_TYPES.SPLIT_ADVANCE}>
                    40% Advance Split (₹
                    {Math.round(totalAmount * ADVANCE_RATE).toLocaleString()})
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setCardMachineAuthCode("");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  {guestMode ? (
                    <option value={PAYMENT_METHODS.RAZORPAY_ONLINE}>
                      Online Payment (Razorpay Dynamic QR / Web UPI / Card)
                    </option>
                  ) : (
                    <>
                      <option value={PAYMENT_METHODS.CASH}>
                        Cash (Front Desk Counter)
                      </option>
                      <option value={PAYMENT_METHODS.CARD_MACHINE}>
                        Physical Card Machine (POS EDC Swipe)
                      </option>
                      <option value={PAYMENT_METHODS.RAZORPAY_ONLINE}>
                        Online Payment (Razorpay Dynamic QR / Web UPI / Card)
                      </option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {paymentMethod === PAYMENT_METHODS.CARD_MACHINE && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FiFileText /> POS Machine Slip Auth / Approval Code{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-482019 or RRN-948123"
                  value={cardMachineAuthCode}
                  onChange={(e) =>
                    setCardMachineAuthCode(e.target.value.toUpperCase())
                  }
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[11px] text-blue-700">
                  Swipe/tap card on the hotel's terminal first. Enter the Auth
                  code from the printed paper slip to link the transaction.
                </p>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs border border-amber-200">
              Amount to collect right now:{" "}
              <strong className="text-sm">
                ₹{amountToPayNow.toLocaleString()}
              </strong>
              {paymentType === PAYMENT_TYPES.SPLIT_ADVANCE &&
                ` (Remaining Balance Due at Check-out: ₹${balanceDue.toLocaleString()})`}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && completedBooking && (
          <div className="space-y-6">
            <div className="text-center py-2 print:hidden">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
                <FiCheckCircle />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Check-In Successful!
              </h3>
              <p className="text-xs text-slate-500">
                Room <strong>{selectedRoom?.roomNumber}</strong> is now marked
                as <strong>OCCUPIED</strong>.
              </p>
            </div>

            <ReceiptView
              completedBooking={completedBooking}
              selectedRoom={selectedRoom}
              formData={formData}
              stayDates={stayDates}
              nights={nights}
              selectedServices={selectedServices}
              roomCharges={roomCharges}
              subtotal={subtotal}
              couponDiscount={couponDiscount}
              selectedCoupon={selectedCoupon}
              taxableAmount={taxableAmount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              amountToPayNow={amountToPayNow}
              balanceDue={balanceDue}
              paymentMethod={paymentMethod}
              paymentType={paymentType}
              cardMachineAuthCode={cardMachineAuthCode}
            />

            <div className="text-center print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
              >
                <FiPrinter /> Print Guest Key Slip / Bill
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-100 pt-4">
        {step > 1 && step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 && (
          <button
            type="button"
            disabled={
              step === 1
                ? !canSubmitStep1
                : step === 2
                  ? !canProceedFromStep2
                  : false
            }
            onClick={() => {
              if (step === 1) handleInitiateSubmit();
              else setStep((s) => s + 1);
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
          >
            {step === 1 && guestLoading
              ? "Sending OTP..."
              : step === 1 && !isExistingGuest
                ? "Verify Guest (Send OTP)"
                : "Next Step"}{" "}
            <FiArrowRight />
          </button>
        )}

        {step === 4 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalizeBooking}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shadow-xs transition cursor-pointer"
          >
            {isSubmitting
              ? "Processing..."
              : paymentMethod === PAYMENT_METHODS.CASH
                ? `Collect ₹${amountToPayNow.toLocaleString()} Cash & Check In`
                : paymentMethod === PAYMENT_METHODS.CARD_MACHINE
                  ? `Confirm Card Swipe (₹${amountToPayNow.toLocaleString()}) & Check In`
                  : `Open Razorpay (₹${amountToPayNow.toLocaleString()}) & Check In`}
          </button>
        )}

        {step === 5 && (
          <button
            type="button"
            onClick={() => onSuccess()}
            className="px-6 py-2.5 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            {guestMode ? "Close" : "Close & Hand Over Key"}
          </button>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Enter OTP Code
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpError("");
                  setOtp("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              OTP has been sent to{" "}
              <span className="font-semibold text-slate-800">
                {formData.email}
              </span>
              . Please verify to complete{" "}
              {isExistingGuest ? "update" : "registration"}.
            </p>

            {otpError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 fill-current text-red-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {OTP_LENGTH}-Digit Verification Code
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH),
                    )
                  }
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">
                  Didn't receive code or expired?
                </span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || isResending}
                  onClick={handleResendOtp}
                  className={`font-semibold text-xs px-2.5 py-1 rounded transition-colors ${
                    resendTimer > 0 || isResending
                      ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                      : "text-[#D96B43] bg-orange-50 hover:bg-orange-100 cursor-pointer active:scale-95"
                  }`}
                >
                  {isResending
                    ? "Sending..."
                    : resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend OTP"}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpError("");
                    setOtp("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={guestLoading || otp.length !== OTP_LENGTH}
                  className="px-4 py-2 bg-[#D96B43] text-white text-xs font-semibold rounded-lg hover:bg-[#c55e39] disabled:opacity-50 cursor-pointer"
                >
                  {guestLoading ? "Verifying..." : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}