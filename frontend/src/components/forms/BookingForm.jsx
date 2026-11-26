import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiCalendar,
  FiPlusCircle,
  FiCreditCard,
  FiCheckCircle,
  FiDownload,
  FiPrinter,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import useBookingStore from "../../app/useBookingStore";
import useGuestStore from "../../app/useGuestStore";
import useRoomStore from "../../app/useRoomStore";
import useAuthStore from "../../app/useAuthStore";

import {
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
  fetchStaffCouponsApi,
  fetchAdminAvailableRoomsByDatesApi,
  downloadCheckInReceiptApi,
} from "../../apis/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingForm({
  onSuccess = () => {},
  onCancel = () => {},
  className = "",
  preSelectedGuest = null,
  currentUserId,
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    useAuthStore((state) => state.token) ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const addBooking = useBookingStore((state) => state.addBooking);
  const checkInBooking = useBookingStore((state) => state.checkInBooking);
  const extraServicesCatalog = useBookingStore((state) => state.extraServices) || [];
  const loadExtraServices = useBookingStore((state) => state.loadExtraServices);

  const {
    sendOtp,
    verifyOtpAndSave,
    searchGuests,
    searchResults,
    clearSearchResults,
    loading: guestLoading,
  } = useGuestStore();

  const [formData, setFormData] = useState({
    firstName: preSelectedGuest?.firstName || preSelectedGuest?.first_name || "",
    lastName: preSelectedGuest?.lastName || preSelectedGuest?.last_name || "",
    email: preSelectedGuest?.email || "",
    phone: preSelectedGuest?.phone || "",
    dateOfBirth: preSelectedGuest?.dateOfBirth || "",
    address: preSelectedGuest?.address || "",
    city: preSelectedGuest?.city || "",
    state: preSelectedGuest?.state || "",
    postalCode: preSelectedGuest?.postalCode || "",
    idProofType: preSelectedGuest?.idProofType || preSelectedGuest?.id_proof_type || "AADHAR_CARD",
    idProofNumber: preSelectedGuest?.idProofNumber || preSelectedGuest?.id_proof_number || "",
  });

  const [verifiedGuestId, setVerifiedGuestId] = useState(preSelectedGuest?.id || null);
  const [isExistingGuest, setIsExistingGuest] = useState(Boolean(preSelectedGuest));
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const dropdownRef = useRef(null);
  const [stayDates, setStayDates] = useState({
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });
  const [totalGuests, setTotalGuests] = useState(2);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [discountDraftVal, setDiscountDraftVal] = useState("");
  const [discountDraftType, setDiscountDraftType] = useState("FLAT");
  const [discountDraftReason, setDiscountDraftReason] = useState("");

  const [appliedDiscountVal, setAppliedDiscountVal] = useState(0);
  const [appliedDiscountType, setAppliedDiscountType] = useState("FLAT");
  const [appliedDiscountReason, setAppliedDiscountReason] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  const [paymentType, setPaymentType] = useState("FULL");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cardMachineAuthCode, setCardMachineAuthCode] = useState("");
  const [completedBooking, setCompletedBooking] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [_, couponsData] = await Promise.all([
          loadExtraServices ? loadExtraServices() : Promise.resolve([]),
          fetchStaffCouponsApi().catch(() => []),
        ]);
        setAvailableCoupons(Array.isArray(couponsData) ? couponsData : []);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, [loadExtraServices]);

  useEffect(() => {
    if (!stayDates.checkInDate || !stayDates.checkOutDate) return;
    if (new Date(stayDates.checkOutDate) <= new Date(stayDates.checkInDate)) {
      setAvailableRooms([]);
      return;
    }

    let active = true;
    setLoadingRooms(true);

    fetchAdminAvailableRoomsByDatesApi(stayDates.checkInDate, stayDates.checkOutDate)
      .then((data) => {
        if (active) {
          const roomList = Array.isArray(data) ? data : [];
          setAvailableRooms(roomList);
          setSelectedRoomIds((prev) => prev.filter((id) => roomList.some((r) => r.id === id)));
        }
      })
      .catch(() => {
        if (active) setAvailableRooms([]);
      })
      .finally(() => {
        if (active) setLoadingRooms(false);
      });

    return () => {
      active = false;
    };
  }, [stayDates.checkInDate, stayDates.checkOutDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let interval = null;
    if (showOtpModal && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, resendTimer]);

  const handleEmailChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    setIsExistingGuest(false);
    setVerifiedGuestId(null);

    if (value.trim().length >= 2) {
      await searchGuests(value, token);
      setShowDropdown(true);
    } else {
      clearSearchResults();
      setShowDropdown(false);
    }
  };

  const handleSelectExistingGuest = (guestItem) => {
    setFormData({
      firstName: guestItem.firstName || "",
      lastName: guestItem.lastName || "",
      email: guestItem.email || "",
      phone: guestItem.phone || "",
      dateOfBirth: guestItem.dateOfBirth || "",
      address: guestItem.address || "",
      city: guestItem.city || "",
      state: guestItem.state || "",
      postalCode: guestItem.postalCode || "",
      idProofType: guestItem.idProofType || "AADHAR_CARD",
      idProofNumber: guestItem.idProofNumber || "",
    });
    setVerifiedGuestId(guestItem.id || guestItem._id);
    setIsExistingGuest(true);
    setShowDropdown(false);
    clearSearchResults();
    toast.success(`Guest loaded: ${guestItem.firstName} ${guestItem.lastName}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    if (name === "phone") {
      const sanitizedPhone = value.replace(/\D/g, "");
      if (sanitizedPhone.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: sanitizedPhone }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return "First Name and Last Name are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return "Please enter a valid 10-digit mobile number.";
    }

    return null;
  };

  const handleInitiateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    const validationError = validateForm();
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
      setResendTimer(30);
      setOtpError("");
      setOtp("");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email address and try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      await sendOtp(formData.email.trim(), token);
      setResendTimer(30);
      setOtp("");
      toast.success("New OTP sent!");
    } catch (err) {
      setOtpError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (!otp || otp.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    const cleanedGuestData = {
      ...formData,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
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
      setOtpError(err.message || "Failed to create/update guest. Invalid OTP or verification failed.");
    }
  };

  const nights = useMemo(() => {
    const diff =
      (new Date(stayDates.checkOutDate) - new Date(stayDates.checkInDate)) /
      (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff) || 1);
  }, [stayDates]);

  const selectedRooms = useMemo(() => {
    return availableRooms.filter((r) => selectedRoomIds.includes(r.id));
  }, [availableRooms, selectedRoomIds]);

  const combinedCapacity = useMemo(() => {
    return selectedRooms.reduce((acc, r) => acc + (r.capacity || 2), 0);
  }, [selectedRooms]);

  const roomCharges = useMemo(() => {
    return selectedRooms.reduce((acc, r) => acc + Number(r.pricePerNight || r.price || 0) * nights, 0);
  }, [selectedRooms, nights]);

  const selectedServices = useMemo(() => {
    return (extraServicesCatalog || []).filter((s) => selectedServiceIds.includes(s.id));
  }, [extraServicesCatalog, selectedServiceIds]);

  const extraServicesTotal = useMemo(() => {
    return selectedServices.reduce((acc, s) => {
      const price = Number(s.price) || 0;
      return acc + (s.priceType === "PER_NIGHT" ? price * nights : price);
    }, 0);
  }, [selectedServices, nights]);

  const subtotal = roomCharges + extraServicesTotal;

  const couponDiscount = useMemo(() => {
    if (!selectedCoupon || roomCharges <= 0) return 0;
    const val = Number(selectedCoupon.discountValue || selectedCoupon.discount || 0);
    const isPercent =
      (selectedCoupon.discountType || selectedCoupon.type) === "PERCENTAGE" ||
      (selectedCoupon.discountType || selectedCoupon.type) === "PERCENT";

    if (isPercent) {
      let discount = Math.round((roomCharges * val) / 100);
      if (selectedCoupon.maxDiscount && discount > selectedCoupon.maxDiscount) {
        discount = Number(selectedCoupon.maxDiscount);
      }
      return discount;
    }
    return Math.min(val, roomCharges);
  }, [selectedCoupon, roomCharges]);

  const handleToggleCoupon = (cpn) => {
    if (selectedCoupon?.id === cpn.id || selectedCoupon?.code === cpn.code) {
      setSelectedCoupon(null);
      toast.success("Coupon removed");
    } else {
      if (cpn.minBookingAmount && roomCharges < cpn.minBookingAmount) {
        toast.error(`Requires minimum room spend of ₹${cpn.minBookingAmount}`);
        return;
      }
      setSelectedCoupon(cpn);
      toast.success(`Coupon ${cpn.code} applied!`);
    }
  };

  const maxEligibleDiscount = Math.max(0, roomCharges - couponDiscount);

  const discretionaryDiscount = useMemo(() => {
    const val = Number(appliedDiscountVal) || 0;
    if (val <= 0) return 0;
    if (appliedDiscountType === "PERCENT") {
      const pct = Math.min(100, Math.max(0, val));
      return Math.round((maxEligibleDiscount * pct) / 100);
    }
    return Math.min(val, maxEligibleDiscount);
  }, [maxEligibleDiscount, appliedDiscountVal, appliedDiscountType]);

  const handleDiscountInputChange = (e) => {
    const inputVal = e.target.value;
    if (inputVal === "") {
      setDiscountDraftVal("");
      return;
    }

    const numericVal = parseFloat(inputVal);

    if (discountDraftType === "PERCENT") {
      if (numericVal > 100) {
        toast.error("You can only give discount below or equal to 100%");
        setDiscountDraftVal("100");
      } else {
        setDiscountDraftVal(inputVal);
      }
    } else {
      if (numericVal > maxEligibleDiscount) {
        toast.error(`You can only give discount below or equal to ₹${maxEligibleDiscount.toLocaleString("en-IN")}`);
        setDiscountDraftVal(String(maxEligibleDiscount));
      } else {
        setDiscountDraftVal(inputVal);
      }
    }
  };

  const handleApplyDiscount = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(discountDraftVal);

    if (!discountDraftVal || isNaN(val) || val <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }

    if (discountDraftType === "FLAT" && val > maxEligibleDiscount) {
      toast.error(`You can only give discount below or equal to ₹${maxEligibleDiscount.toLocaleString("en-IN")}`);
      setDiscountDraftVal(String(maxEligibleDiscount));
      return;
    }

    if (discountDraftType === "PERCENT" && val > 100) {
      toast.error("You can only give discount below or equal to 100%");
      setDiscountDraftVal("100");
      return;
    }

    setAppliedDiscountVal(val);
    setAppliedDiscountType(discountDraftType);
    setAppliedDiscountReason(discountDraftReason);
    setIsDiscountApplied(true);
    toast.success("Discount applied successfully");
  };

  const handleRemoveDiscount = () => {
    setIsDiscountApplied(false);
    setAppliedDiscountVal(0);
    setDiscountDraftVal("");
    setDiscountDraftReason("");
    setAppliedDiscountReason("");
    toast.success("Discount removed");
  };

  const taxableAmount = roomCharges + extraServicesTotal;
  const roomTax = roomCharges * 0.18;
  const servicesTax = selectedServices.reduce((acc, s) => {
    const price = Number(s.price) || 0;
    const itemCost = s.priceType === "PER_NIGHT" ? price * nights : price;
    const rate = Number(s.taxRate != null ? s.taxRate : 18) / 100;
    return acc + itemCost * rate;
  }, 0);
  const taxAmount = Math.round(roomTax + servicesTax);

  const grossBeforeDeductions = taxableAmount + taxAmount;
  const totalDiscount = couponDiscount + discretionaryDiscount;
  const totalAmount = Math.max(0, grossBeforeDeductions - totalDiscount);

  const amountToPayNow = paymentType === "SPLIT_ADVANCE" ? Math.round(totalAmount * 0.4) : totalAmount;
  const balanceDue = totalAmount - amountToPayNow;

  const toggleRoomSelection = (id) => {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinalizeBooking = async (checkInDirectly = false) => {
    if (selectedRooms.length === 0) {
      toast.error("Please select at least one room.");
      return;
    }
    if (combinedCapacity < totalGuests) {
      toast.error(`Guest headcount (${totalGuests}) exceeds combined room capacity (${combinedCapacity}). Please select additional rooms.`);
      return;
    }
    if (paymentMethod === "CARD_MACHINE" && !cardMachineAuthCode.trim()) {
      toast.error("Please enter the physical card machine Auth / Slip code.");
      return;
    }

    setIsSubmitting(true);
    const isOnline = paymentMethod === "RAZORPAY_ONLINE";

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
        roomIds: selectedRoomIds,
        roomId: selectedRoomIds[0], // backward compatibility
        checkInDate: stayDates.checkInDate,
        checkOutDate: stayDates.checkOutDate,
        totalGuests: totalGuests,
        extraServiceIds: selectedServiceIds,
        couponCode: selectedCoupon?.code || null,

        customDiscount: appliedDiscountVal ? parseFloat(appliedDiscountVal) : 0,
        customDiscountType: appliedDiscountType,
        discountReason: appliedDiscountReason.trim() || null,

        paymentType: paymentType,
        paymentMethod: isOnline ? null : paymentMethod,
        transactionReference: paymentMethod === "CARD_MACHINE" ? cardMachineAuthCode.trim() : null,
        amount: isOnline ? 0 : amountToPayNow,
      };

      const bookingRes = await addBooking(payload);

      if (!isOnline) {
        let finalBooking = bookingRes;
        if (checkInDirectly) {
          try {
            finalBooking = await checkInBooking(bookingRes.id);
            toast.success("Guest checked in! Room(s) marked OCCUPIED.");
          } catch (err) {
            console.warn("Check-in notice:", err);
          }
        } else {
          toast.success(`Advance reservation #${bookingRes.id} confirmed! Room(s) marked RESERVED.`);
        }

        setCompletedBooking(finalBooking);
        setStep(4);
        return;
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check internet connection.");
        setIsSubmitting(false);
        return;
      }

      const order = await createRazorpayOrderApi(bookingRes.id, paymentType, token);

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency || "INR",
        name: "Hotel Athenura",
        description: `Reservation Payment - Booking #${bookingRes.id}`,
        order_id: order.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#D96B43",
        },
        handler: async function (response) {
          try {
            await verifyRazorpayPaymentApi(
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: bookingRes.id,
                paymentType: paymentType,
              },
              token
            );

            let finalBooking = bookingRes;
            if (checkInDirectly) {
              try {
                finalBooking = await checkInBooking(bookingRes.id);
              } catch (err) {
                console.warn("Check-in notice:", err);
              }
            }

            setCompletedBooking(finalBooking);
            setStep(4);
            toast.success(
              checkInDirectly
                ? "Payment verified & guest checked in!"
                : "Payment verified & reservation confirmed!"
            );
          } catch {
            toast.error("Signature verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment modal closed. Booking created with pending balance.");
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
  };

  const handleDownloadCheckInPdf = async () => {
    const targetBookingId = completedBooking?.id;
    if (!targetBookingId) {
      toast.error("Booking reference not found for slip download");
      return;
    }

    const toastId = toast.loading("Downloading Check-In Slip...");
    try {
      await downloadCheckInReceiptApi(targetBookingId);
      toast.success("Check-In Slip downloaded!", { id: toastId });
    } catch {
      toast.error("Could not download Check-In Slip.", { id: toastId });
    }
  };

  return (
    <div className={`flex flex-col h-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Desk Walk-In Booking & Check-In</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {step} of 4 —{" "}
            {step === 1 && "Guest Registration & Verification"}
            {step === 2 && "Stay Dates, Room Selection & Extra Services"}
            {step === 3 && "Billing Breakdown, Coupons, Discount & Payment"}
            {step === 4 && "Confirmation & Key Handover"}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {/* STEP 1: Guest Verification */}
        {step === 1 && (
          <form onSubmit={handleInitiateSubmit} className="space-y-4 text-sm text-slate-700">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 fill-current text-red-500" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <label className="block font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
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
                <svg className="w-4 h-4 shrink-0 fill-current text-blue-500" viewBox="0 0 20 20">
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                </svg>
                <span>Existing guest details auto-filled. Modify details below if required.</span>
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
                  maxLength={10}
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
                <label className="block font-medium mb-1">ID Proof Number</label>
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

        {/* STEP 2: Dates, Dynamic Overlap Multi-Room Selection & Headcount */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FiCalendar className="text-[#D96B43]" /> 2. Dates, Headcount & Room Selection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={stayDates.checkInDate}
                    onChange={(e) => setStayDates({ ...stayDates, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Check-out Date</label>
                  <input
                    type="date"
                    min={stayDates.checkInDate}
                    value={stayDates.checkOutDate}
                    onChange={(e) => setStayDates({ ...stayDates, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Total Guests</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="2"
                    value={totalGuests}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setTotalGuests(val === "" ? "" : parseInt(val, 10));
                    }}
                    onBlur={() => {
                      if (!totalGuests || totalGuests < 1) setTotalGuests(1);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-2">
                  <span>Available Rooms ({availableRooms.length} Free)</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    combinedCapacity >= totalGuests ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Capacity: {combinedCapacity} / {totalGuests} Guests
                  </span>
                </label>
                {loadingRooms && <FaSpinner className="animate-spin text-xs text-[#D96B43]" />}
              </div>

              {availableRooms.length === 0 && !loadingRooms ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No rooms free for the selected dates.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableRooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    const isCapacityFull = combinedCapacity >= totalGuests;
                    const isDisabled = isCapacityFull && !isSelected;

                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          if (isDisabled) {
                            toast.error(`Guest capacity (${totalGuests}) is already fulfilled. Unselect a room first if you want to switch.`);
                            return;
                          }
                          toggleRoomSelection(room.id);
                        }}
                        className={`p-3.5 border rounded-xl transition flex justify-between items-center ${
                          isDisabled
                            ? "opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed select-none"
                            : isSelected
                            ? "border-[#D96B43] bg-orange-50/50 ring-1 ring-[#D96B43] cursor-pointer"
                            : "border-slate-200 hover:border-slate-300 cursor-pointer bg-white"
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Room {room.roomNumber}</h4>
                          <p className="text-xs text-slate-500">{room.roomType} | Max {room.capacity || 2} Guests</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-[#D96B43] text-sm block">
                            ₹{room.pricePerNight || room.price}
                          </span>
                          {isSelected && <span className="text-[10px] text-emerald-600 font-bold">✓ Picked</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <FiPlusCircle className="text-[#D96B43]" /> Add Extra Services to Stay
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-44 overflow-y-auto">
                {extraServicesCatalog.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer transition ${
                      selectedServiceIds.includes(service.id)
                        ? "border-[#D96B43] bg-orange-50/40 ring-1 ring-[#D96B43]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-500">
                        {service.description || service.category} ({service.taxRate != null ? service.taxRate : 18}% GST)
                      </p>
                    </div>
                    <span className="font-bold text-sm text-slate-700">
                      ₹{service.price}
                      {service.priceType === "PER_NIGHT" && <span className="text-[10px] text-slate-400">/nt</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Live Billing & Role-Aware Coupon Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiCreditCard className="text-[#D96B43]" /> 3. Live Billing & Counter Payment
            </h3>

            {/* Billing Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Rooms Tariff ({selectedRooms.map((r) => r.roomNumber).join(", ")} × {nights}N):</span>
                <span className="font-semibold">₹{roomCharges.toLocaleString("en-IN")}</span>
              </div>

              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between text-slate-500">
                  <span>{s.name} ({s.taxRate != null ? s.taxRate : 18}% GST)</span>
                  <span>₹{(s.priceType === "PER_NIGHT" ? s.price * nights : s.price).toLocaleString("en-IN")}</span>
                </div>
              ))}

              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-700">
                <span>Subtotal (Base Charges)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span className="font-semibold">₹{taxableAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Itemized GST (18% on full base)</span>
                <span>₹{taxAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                <span>Total Before Deductions</span>
                <span>₹{grossBeforeDeductions.toLocaleString("en-IN")}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({selectedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {discretionaryDiscount > 0 && (
                <div className="flex justify-between items-start text-emerald-700 font-semibold bg-emerald-50/90 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <div>
                    <span>
                      Discount ({appliedDiscountType === "PERCENT" ? `${appliedDiscountVal}%` : `₹${appliedDiscountVal}`})
                    </span>
                    {appliedDiscountReason && (
                      <span className="text-[11px] font-normal text-emerald-800 block italic">
                        Reason: {appliedDiscountReason}
                      </span>
                    )}
                  </div>
                  <span>-₹{discretionaryDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-800">
                <span>Total Amount (Net Payable)</span>
                <span className="text-[#D96B43]">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Side-by-Side Coupons & Discounts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* LEFT COLUMN: Role-Filtered Coupons */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <FiTag className="text-[#D96B43]" /> Applicable Coupons (Role-Aware)
                  </h4>
                  {availableCoupons.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-6 text-center">No active promotions available for this role.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableCoupons.map((cpn) => {
                        const isSelected = selectedCoupon?.code === cpn.code;
                        const isPercent = (cpn.discountType || cpn.type) === "PERCENTAGE" || (cpn.discountType || cpn.type) === "PERCENT";
                        const discountText = isPercent
                          ? `${cpn.discountValue}% OFF`
                          : `₹${cpn.discountValue} OFF`;

                        return (
                          <div
                            key={cpn.id || cpn.code}
                            onClick={() => handleToggleCoupon(cpn)}
                            className={`p-2.5 border rounded-lg cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-slate-800 text-white rounded text-[10px] font-mono font-bold uppercase">
                                  {cpn.code}
                                </span>
                                {cpn.targetAudience && (
                                  <span className="px-1 py-0.2 bg-amber-100 text-[#D96B43] rounded text-[9px] font-semibold">
                                    {cpn.targetAudience}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                                {discountText}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                                isSelected ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {isSelected ? "Remove" : "Apply"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Front Desk Concession */}
              <div
                className={`border rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition ${
                  isDiscountApplied
                    ? "bg-slate-50 border-emerald-300"
                    : "bg-amber-50/70 border-amber-200/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FiTag className="text-[#D96B43]" /> Custom Concession
                      {isDiscountApplied && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          Locked & Applied
                        </span>
                      )}
                    </span>

                    <div
                      className={`flex items-center bg-white border border-amber-200 rounded-lg p-0.5 text-xs font-semibold ${
                        isDiscountApplied ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isDiscountApplied}
                        onClick={() => {
                          setDiscountDraftType("FLAT");
                          if (parseFloat(discountDraftVal) > maxEligibleDiscount) {
                            setDiscountDraftVal(String(maxEligibleDiscount));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          discountDraftType === "FLAT"
                            ? "bg-[#D96B43] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        ₹ Flat
                      </button>
                      <button
                        type="button"
                        disabled={isDiscountApplied}
                        onClick={() => {
                          setDiscountDraftType("PERCENT");
                          if (parseFloat(discountDraftVal) > 100) {
                            setDiscountDraftVal("100");
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          discountDraftType === "PERCENT"
                            ? "bg-[#D96B43] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        % Percent
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {discountDraftType === "FLAT"
                          ? `Discount Value (Max ₹${maxEligibleDiscount.toLocaleString("en-IN")})`
                          : "Discount Value (%)"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          disabled={isDiscountApplied}
                          placeholder={discountDraftType === "FLAT" ? `Max ₹${maxEligibleDiscount}` : "Max 100%"}
                          value={discountDraftVal}
                          onChange={handleDiscountInputChange}
                          className={`w-full px-3 py-1.5 border rounded-lg text-xs font-bold transition focus:outline-none ${
                            isDiscountApplied
                              ? "bg-slate-100 text-slate-500 border-slate-300 cursor-not-allowed select-none"
                              : "bg-white text-slate-800 border-amber-200 focus:ring-1 focus:ring-[#D96B43]"
                          }`}
                        />
                        <span className="absolute right-3 top-1.5 text-xs font-bold text-slate-400">
                          {discountDraftType === "FLAT" ? "₹" : "%"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        disabled={isDiscountApplied}
                        placeholder="Reason (Optional)"
                        value={discountDraftReason}
                        onChange={(e) => setDiscountDraftReason(e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs transition focus:outline-none ${
                          isDiscountApplied
                            ? "bg-slate-100 text-slate-500 border-slate-300 cursor-not-allowed select-none"
                            : "bg-white text-slate-800 border-amber-200 focus:ring-1 focus:ring-[#D96B43]"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2 pt-1 border-t border-amber-200/50">
                  {isDiscountApplied ? (
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="px-4 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                    >
                      Remove Discount
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!discountDraftVal || parseFloat(discountDraftVal) <= 0}
                      onClick={handleApplyDiscount}
                      className="px-4 py-1.5 bg-[#D96B43] hover:bg-[#c45b34] text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Apply Discount
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Split & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Payment Split Policy</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="FULL">100% Full Payment (₹{totalAmount.toLocaleString("en-IN")})</option>
                  <option value="SPLIT_ADVANCE">40% Advance Split (₹{Math.round(totalAmount * 0.4).toLocaleString("en-IN")})</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setCardMachineAuthCode("");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="CASH">Cash (Front Desk Counter)</option>
                  <option value="CARD_MACHINE">Physical Card Machine (POS EDC Swipe)</option>
                  <option value="RAZORPAY_ONLINE">Online Payment (Razorpay Dynamic QR / Web UPI / Card)</option>
                </select>
              </div>
            </div>

            {paymentMethod === "CARD_MACHINE" && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FiFileText /> POS Machine Slip Auth / Approval Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-482019 or RRN-948123"
                  value={cardMachineAuthCode}
                  onChange={(e) => setCardMachineAuthCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[11px] text-blue-700">
                  Swipe/tap card on the hotel's terminal first. Enter the Auth code from the printed paper slip to link the transaction.
                </p>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-xs border border-amber-200">
              Amount to collect right now: <strong className="text-sm">₹{amountToPayNow.toLocaleString("en-IN")}</strong>
              {paymentType === "SPLIT_ADVANCE" && ` (Remaining Balance Due at Check-out: ₹{balanceDue.toLocaleString("en-IN")})`}
            </div>
          </div>
        )}

        {/* STEP 4: Receipt Confirmation */}
        {step === 4 && completedBooking && (
          <div className="space-y-6">
            <div className="text-center py-2 print:hidden">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
                <FiCheckCircle />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {completedBooking.bookingStatus === "CHECKED_IN" ? "Check-In Successful!" : "Reservation Confirmed!"}
              </h3>
              <p className="text-xs text-slate-500">
                Rooms <strong>{completedBooking.allocatedRoomsDisplay || selectedRooms.map(r => r.roomNumber).join(", ")}</strong> are now marked as{" "}
                <strong>{completedBooking.bookingStatus === "CHECKED_IN" ? "OCCUPIED" : "RESERVED"}</strong>.
              </p>
            </div>

            <div
              id="printable-receipt"
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-800 font-sans shadow-xs max-w-2xl mx-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">HOTEL ATHENURA</h2>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold tracking-widest uppercase">
                    {completedBooking.bookingStatus === "CHECKED_IN" ? "CHECK-IN RECEIPT" : "BOOKING CONFIRMATION"}
                  </span>
                  <p className="text-xs font-mono font-semibold text-slate-700 mt-2">
                    Invoice: INV-{completedBooking.id}-{new Date().getFullYear()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
                      ID: {formData.idProofType.replace("_", " ")} ({formData.idProofNumber})
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Reservation Particulars
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedRooms.map(r => `Room ${r.roomNumber}`).join(", ")}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Check-In: <strong>{stayDates.checkInDate}</strong>
                  </p>
                  <p className="text-slate-600">
                    Check-Out: <strong>{stayDates.checkOutDate}</strong> ({nights} {nights === 1 ? "Night" : "Nights"})
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
                    {selectedRooms.map((room) => (
                      <tr key={room.id}>
                        <td className="py-2.5 font-medium text-slate-800">
                          Room {room.roomNumber} ({room.roomType})
                        </td>
                        <td className="py-2.5 text-center">{nights} nights</td>
                        <td className="py-2.5 text-right font-mono">₹{Number(room.pricePerNight || room.price).toLocaleString("en-IN")}</td>
                        <td className="py-2.5 text-right font-mono font-medium">₹{(Number(room.pricePerNight || room.price) * nights).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}

                    {selectedServices.map((srv) => (
                      <tr key={srv.id}>
                        <td className="py-2.5">
                          {srv.name}{" "}
                          <span className="text-[10px] text-slate-400">({srv.taxRate != null ? srv.taxRate : 18}% GST)</span>
                        </td>
                        <td className="py-2.5 text-center">
                          {srv.priceType === "PER_NIGHT" ? `${nights} nights` : "1 time"}
                        </td>
                        <td className="py-2.5 text-right font-mono">₹{Number(srv.price).toLocaleString("en-IN")}</td>
                        <td className="py-2.5 text-right font-mono font-medium">
                          ₹{(srv.priceType === "PER_NIGHT" ? srv.price * nights : srv.price).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200 text-xs">
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Payment Record
                  </p>
                  <p className="text-slate-600">
                    Mode: <strong className="text-slate-800">{paymentMethod.replace("_", " ")}</strong>
                  </p>
                  <p className="text-slate-600">
                    Policy: <strong className="text-slate-800">{paymentType.replace("_", " ")}</strong>
                  </p>

                  {paymentMethod === "CARD_MACHINE" && cardMachineAuthCode && (
                    <p className="text-blue-700 font-mono font-medium pt-1">
                      Slip Auth/RRN: <strong>{cardMachineAuthCode}</strong>
                    </p>
                  )}

                  {paymentMethod === "RAZORPAY_ONLINE" && (
                    <p className="text-emerald-700 font-mono text-[11px] pt-1">
                      Gateway Status: Verified Online
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span className="font-mono font-semibold">₹{taxableAmount.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & GST (18% on full base):</span>
                    <span className="font-mono">₹{taxAmount.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                    <span>Gross Total:</span>
                    <span className="font-mono">₹{grossBeforeDeductions.toLocaleString("en-IN")}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount ({selectedCoupon?.code}):</span>
                      <span className="font-mono">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {discretionaryDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>
                        Discount:
                        {appliedDiscountReason && <span className="text-[10px] text-slate-400 block italic">({appliedDiscountReason})</span>}
                      </span>
                      <span className="font-mono">-₹{discretionaryDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-black text-slate-900">
                    <span>Net Total Payable:</span>
                    <span className="font-mono text-[#D96B43]">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between font-bold text-emerald-700 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">₹{amountToPayNow.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between font-bold text-amber-700">
                    <span>Balance Due:</span>
                    <span className="font-mono">₹{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Thank you for choosing Hotel Athenura! We wish you a delightful stay.
                </p>
              </div>
            </div>

            <div className="text-center print:hidden">
              <button
                onClick={handleDownloadCheckInPdf}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
              >
                <FiPrinter /> Print check-in receipt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-100 pt-4">
        {step > 1 && step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <button
            type="button"
            disabled={
              step === 1
                ? !formData.firstName || !formData.email || !formData.phone || guestLoading
                : step === 2 && (selectedRoomIds.length === 0 || combinedCapacity < totalGuests)
            }
            onClick={() => {
              if (step === 1) {
                handleInitiateSubmit();
              } else {
                if (combinedCapacity < totalGuests) {
                  toast.error(`Selected rooms capacity (${combinedCapacity}) is less than total guests (${totalGuests}). Please select more rooms.`);
                  return;
                }
                setStep(step + 1);
              }
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

        {step === 3 && (() => {
          const todayStr = new Date().toISOString().split("T")[0];
          const isCheckInToday = stayDates.checkInDate === todayStr;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalizeBooking(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? "Processing..." : "Confirm Advance Reservation"}
              </button>

              {isCheckInToday && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalizeBooking(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shadow-xs transition cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : "Hand Key & Check In Now"}
                </button>
              )}
            </div>
          );
        })()}

        {step === 4 && (
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            className="px-6 py-2.5 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            {completedBooking?.bookingStatus === "CHECKED_IN"
              ? "Close & Hand Over Key"
              : "Close & Reservation Saved"}
          </button>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Enter OTP Code</h3>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpError("");
                  setOtp("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              OTP has been sent to <span className="font-semibold text-slate-800">{formData.email}</span>. Please verify to complete {isExistingGuest ? "update" : "registration"}.
            </p>

            {otpError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 fill-current text-red-500" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Didn't receive code or expired?</span>
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
                  disabled={guestLoading}
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