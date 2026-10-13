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


import React, { useState, useEffect, useMemo } from "react";
import {
  FiUser,
  FiCalendar,
  FiPlusCircle,
  FiCreditCard,
  FiCheckCircle,
  FiPrinter,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useBookingStore from "../../app/useBookingStore";
import useGuestStore from "../../app/useGuestStore";
import useRoomStore from "../../app/useRoomStore";
import useAuthStore from "../../app/useAuthStore";
import {
  fetchCouponsApi,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
} from "../../apis/api";

export default function BookingForm({
  onSuccess = () => {},
  onCancel = () => {},
  className = "",
  preSelectedGuest = null,
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
  const getRoomsList = useRoomStore((state) => state.getRoomsList);

  const guestList = useGuestStore((state) => state.guestList) || [];
  const getGuestList = useGuestStore((state) => state.getGuestList);

  // Guest Details
  const [guest, setGuest] = useState({
    guestId: preSelectedGuest?.id || null,
    firstName: preSelectedGuest?.firstName || preSelectedGuest?.first_name || "",
    lastName: preSelectedGuest?.lastName || preSelectedGuest?.last_name || "",
    email: preSelectedGuest?.email || "",
    phone: preSelectedGuest?.phone || "",
    idProofType: preSelectedGuest?.idProofType || preSelectedGuest?.id_proof_type || "AADHAR_CARD",
    idProofNumber: preSelectedGuest?.idProofNumber || preSelectedGuest?.id_proof_number || "",
  });

  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Stay Dates & Rooms
  const [stayDates, setStayDates] = useState({
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  // Promotional Coupons
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Billing & Payment Selection
  const [paymentType, setPaymentType] = useState("FULL");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cardMachineAuthCode, setCardMachineAuthCode] = useState("");
  const [completedBooking, setCompletedBooking] = useState(null);

  // Fetch Rooms, Services, Guests & Coupons on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [roomsData, _, __, couponsData] = await Promise.all([
          getRoomsList(),
          loadExtraServices ? loadExtraServices() : Promise.resolve([]),
          getGuestList ? getGuestList(token) : Promise.resolve([]),
          fetchCouponsApi ? fetchCouponsApi().catch(() => []) : Promise.resolve([]),
        ]);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setAvailableCoupons(Array.isArray(couponsData) ? couponsData : []);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, [getRoomsList, loadExtraServices, getGuestList, token]);

  // Real-time Guest Autocomplete Filter
  const filteredGuests = useMemo(() => {
    const q = guestSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return (guestList || []).filter((g) => {
      const fullName = `${g.firstName || g.first_name || ""} ${g.lastName || g.last_name || ""}`.toLowerCase();
      const email = (g.email || "").toLowerCase();
      const phone = (g.phone || "").toString();
      return fullName.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [guestList, guestSearchQuery]);

  const handleSelectExistingGuest = (selected) => {
    const guestId = selected.id || selected._id;
    const fName = selected.firstName || selected.first_name || "";
    const lName = selected.lastName || selected.last_name || "";

    setGuest({
      guestId: guestId,
      firstName: fName,
      lastName: lName,
      email: selected.email || "",
      phone: selected.phone || "",
      idProofType: selected.idProofType || selected.id_proof_type || "AADHAR_CARD",
      idProofNumber: selected.idProofNumber || selected.id_proof_number || "",
    });

    setGuestSearchQuery(`${fName} ${lName}`.trim());
    setShowGuestDropdown(false);
    toast.success(`Guest profile loaded (#${guestId})`);
  };

  const nights = useMemo(() => {
    const diff =
      (new Date(stayDates.checkOutDate) - new Date(stayDates.checkInDate)) /
      (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff) || 1);
  }, [stayDates]);

  const availableRooms = useMemo(() => {
    return rooms.filter((r) => (r.roomStatus || r.status) === "AVAILABLE");
  }, [rooms]);

  const roomCharges = selectedRoom ? Number(selectedRoom.pricePerNight) * nights : 0;

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

  // Toggle Coupon Selection Card
  const handleToggleCoupon = (cpn) => {
    if (selectedCoupon?.id === cpn.id || selectedCoupon?.code === cpn.code) {
      setSelectedCoupon(null);
      setCouponDiscount(0);
      toast.success("Coupon removed");
    } else {
      let discount = 0;
      const val = Number(cpn.discountValue || cpn.discount || cpn.value || 0);
      const isPercent =
        (cpn.discountType || cpn.type) === "PERCENTAGE" ||
        cpn.code?.includes("20") ||
        val <= 100;

      if (isPercent) {
        discount = Math.round((subtotal * val) / 100);
      } else {
        discount = Math.min(val, subtotal);
      }

      setSelectedCoupon(cpn);
      setCouponDiscount(discount);
      toast.success(`Coupon ${cpn.code} applied! Saved ₹${discount}`);
    }
  };

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const discountRatio = subtotal > 0 && couponDiscount > 0 ? 1 - couponDiscount / subtotal : 1;
  const roomTax = roomCharges * discountRatio * 0.18;
  const servicesTax = selectedServices.reduce((acc, s) => {
    const price = Number(s.price) || 0;
    const itemCost = s.priceType === "PER_NIGHT" ? price * nights : price;
    const rate = (Number(s.taxRate) || 18) / 100;
    return acc + itemCost * discountRatio * rate;
  }, 0);

  const taxAmount = Math.round(roomTax + servicesTax);
  const totalAmount = taxableAmount + taxAmount;
  const amountToPayNow = paymentType === "SPLIT_ADVANCE" ? Math.round(totalAmount * 0.4) : totalAmount;
  const balanceDue = totalAmount - amountToPayNow;

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinalizeBooking = async () => {
    if (paymentMethod === "CARD_MACHINE" && !cardMachineAuthCode.trim()) {
      toast.error("Please enter the physical card machine Auth / Slip code.");
      return;
    }

    setIsSubmitting(true);
    const isOnline = paymentMethod === "RAZORPAY_ONLINE";

    try {
      const payload = {
        guestId: guest.guestId || null,
        guest: guest.guestId
          ? null
          : {
              firstName: guest.firstName.trim(),
              lastName: guest.lastName.trim(),
              email: guest.email.trim(),
              phone: guest.phone.trim(),
              idProofType: guest.idProofType,
              idProofNumber: guest.idProofNumber.trim(),
            },
        roomId: selectedRoom.id,
        checkInDate: stayDates.checkInDate,
        checkOutDate: stayDates.checkOutDate,
        extraServiceIds: selectedServiceIds,
        couponCode: selectedCoupon?.code || null,
        paymentType: paymentType,
        paymentMethod: isOnline ? null : paymentMethod,
        transactionReference: paymentMethod === "CARD_MACHINE" ? cardMachineAuthCode.trim() : null,
        amount: isOnline ? 0 : amountToPayNow,
      };

      const bookingRes = await addBooking(payload);

      // Path A: Desk Direct Settlement (Cash or Physical EDC Machine)
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
          paymentMethod === "CARD_MACHINE"
            ? `Card payment recorded (Auth: ${cardMachineAuthCode}) & checked in!`
            : "Cash received & guest checked in!"
        );
        return;
      }

      // Path B: Online Razorpay Flow (UPI / QR / Web Cards)
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      const order = await createRazorpayOrderApi(bookingRes.id, paymentType, token);
      
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency || "INR",
        name: "Athenura Grand Hotel",
        description: `Desk Settlement - Booking #${bookingRes.id}`,
        order_id: order.orderId,
        prefill: {
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          contact: guest.phone,
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

  return (
    <div className={`flex flex-col h-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Desk Walk-In Booking & Check-In</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {step} of 5 —{" "}
            {step === 1 && "Guest Registration & Search"}
            {step === 2 && "Stay Dates & Available Room"}
            {step === 3 && "Extra Services & Available Promotions"}
            {step === 4 && "Live Billing Breakdown & Payment"}
            {step === 5 && "Confirmation & Key Handover"}
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
        {/* STEP 1: Guest Identification (Clean, Green Line Removed) */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiUser className="text-[#D96B43]" /> 1. Guest Identification
            </h3>

            <div className="relative">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Search Registered Guests (by Name, Email, or Phone)
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type to search existing customers..."
                  value={guestSearchQuery}
                  onChange={(e) => {
                    setGuestSearchQuery(e.target.value);
                    setShowGuestDropdown(true);
                  }}
                  onFocus={() => setShowGuestDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              {showGuestDropdown && filteredGuests.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  {filteredGuests.map((g) => {
                    const gId = g.id || g._id;
                    const fName = g.firstName || g.first_name || "";
                    const lName = g.lastName || g.last_name || "";
                    return (
                      <div
                        key={gId}
                        onClick={() => handleSelectExistingGuest(g)}
                        className="p-3 hover:bg-orange-50/60 cursor-pointer border-b border-slate-100 last:border-b-0 transition"
                      >
                        <p className="text-sm font-semibold text-slate-800">
                          {fName} {lName} <span className="text-xs font-normal text-slate-400">(#{gId})</span>
                        </p>
                        <p className="text-xs text-slate-500">{g.email} • {g.phone}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guest.firstName}
                  onChange={(e) => setGuest({ ...guest, firstName: e.target.value, guestId: null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guest.lastName}
                  onChange={(e) => setGuest({ ...guest, lastName: e.target.value, guestId: null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value, guestId: null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value, guestId: null })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">ID Proof Type</label>
                <select
                  value={guest.idProofType}
                  onChange={(e) => setGuest({ ...guest, idProofType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="AADHAR_CARD">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">ID Proof Number</label>
                <input
                  type="text"
                  value={guest.idProofNumber}
                  onChange={(e) => setGuest({ ...guest, idProofNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Dates & Room Inventory */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiCalendar className="text-[#D96B43]" /> 2. Dates & Available Rooms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  value={stayDates.checkOutDate}
                  onChange={(e) => setStayDates({ ...stayDates, checkOutDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

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
                      <h4 className="font-bold text-slate-800 text-sm">Room {room.roomNumber}</h4>
                      <p className="text-xs text-slate-500">{room.roomType} • Capacity: {room.capacity}</p>
                    </div>
                    <span className="font-extrabold text-[#D96B43] text-sm">
                      ₹{room.pricePerNight}<span className="text-[10px] text-slate-400 font-normal">/nt</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Extra Services & Selectable Promotion Cards */}
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
                      <p className="font-bold text-sm text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.description || service.category} ({service.taxRate}% GST)</p>
                    </div>
                    <span className="font-bold text-sm text-slate-700">
                      ₹{service.price}{service.priceType === "PER_NIGHT" && <span className="text-[10px] text-slate-400">/nt</span>}
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
                    const isSelected = selectedCoupon?.code === cpn.code;
                    const discountText =
                      (cpn.discountType || cpn.type) === "PERCENTAGE" ||
                      cpn.code?.includes("20")
                        ? `${cpn.discountValue || cpn.discount || 20}% OFF`
                        : `₹${cpn.discountValue || cpn.discount} OFF`;

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
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cpn.description || "Stay Promotion"}</p>
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

        {/* STEP 4: Live Billing & Payment Policy */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiCreditCard className="text-[#D96B43]" /> 4. Live Billing & Counter Payment
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Room Charges ({selectedRoom?.roomType} × {nights} nights)</span>
                <span className="font-semibold">₹{roomCharges.toLocaleString()}</span>
              </div>
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between text-slate-500">
                  <span>{s.name} ({s.taxRate}% GST)</span>
                  <span>₹{(s.priceType === "PER_NIGHT" ? s.price * nights : s.price).toLocaleString()}</span>
                </div>
              ))}
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
                <label className="text-xs font-medium text-slate-600 block mb-1">Payment Split Policy</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="FULL">100% Full Payment (₹{totalAmount.toLocaleString()})</option>
                  <option value="SPLIT_ADVANCE">40% Advance Split (₹{Math.round(totalAmount * 0.4).toLocaleString()})</option>
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

            {/* Input specifically restricted to CARD_MACHINE only */}
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
              Amount to collect right now: <strong className="text-sm">₹{amountToPayNow.toLocaleString()}</strong>
              {paymentType === "SPLIT_ADVANCE" && ` (Remaining Balance Due at Check-out: ₹${balanceDue.toLocaleString()})`}
            </div>
          </div>
        )}

       {/* STEP 5: Professional Key Slip & Tax Invoice */}
{step === 5 && completedBooking && (
  <div className="space-y-6">
    {/* Screen-only Success Notification */}
    <div className="text-center py-2 print:hidden">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
        <FiCheckCircle />
      </div>
      <h3 className="text-lg font-bold text-slate-800">Check-In Successful!</h3>
      <p className="text-xs text-slate-500">
        Room <strong>{selectedRoom?.roomNumber}</strong> is now marked as <strong>OCCUPIED</strong>.
      </p>
    </div>

    {/* Printable Hotel Receipt Container */}
    <div
      id="printable-receipt"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-800 font-sans shadow-xs max-w-2xl mx-auto"
    >
      {/* 1. Hotel Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            HOTEL
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
            Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* 2. Guest & Reservation Information */}
      <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-100 text-xs">
        <div>
          <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
            Guest Details
          </p>
          <p className="font-bold text-slate-900 text-sm">
            {guest.firstName} {guest.lastName}
          </p>
          <p className="text-slate-600 mt-0.5">Phone: {guest.phone}</p>
          <p className="text-slate-600">Email: {guest.email}</p>
          {guest.idProofNumber && (
            <p className="text-slate-500 mt-1">
              ID: {guest.idProofType.replace("_", " ")} ({guest.idProofNumber})
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
            Check-Out: <strong>{stayDates.checkOutDate}</strong> ({nights} {nights === 1 ? "Night" : "Nights"})
          </p>
          <p className="text-slate-500 mt-1 font-mono">
            Booking ID: #{completedBooking.id}
          </p>
        </div>
      </div>

      {/* 3. Itemized Charges Table */}
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
              <td className="py-2.5 text-right font-mono">₹{Number(selectedRoom?.pricePerNight).toLocaleString()}</td>
              <td className="py-2.5 text-right font-mono font-medium">₹{roomCharges.toLocaleString()}</td>
            </tr>

            {selectedServices.map((srv) => (
              <tr key={srv.id}>
                <td className="py-2.5">
                  {srv.name}{" "}
                  <span className="text-[10px] text-slate-400">({srv.taxRate}% GST)</span>
                </td>
                <td className="py-2.5 text-center">
                  {srv.priceType === "PER_NIGHT" ? `${nights} nights` : "1 time"}
                </td>
                <td className="py-2.5 text-right font-mono">₹{Number(srv.price).toLocaleString()}</td>
                <td className="py-2.5 text-right font-mono font-medium">
                  ₹{(srv.priceType === "PER_NIGHT" ? srv.price * nights : srv.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Calculations & Settlement Details */}
      <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200 text-xs">
        {/* Payment Metadata */}
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

          {/* Machine Auth Code (Only for Card Swipe) */}
          {paymentMethod === "CARD_MACHINE" && cardMachineAuthCode && (
            <p className="text-blue-700 font-mono font-medium pt-1">
              Slip Auth/RRN: <strong>{cardMachineAuthCode}</strong>
            </p>
          )}

          {/* Razorpay Online Indicator */}
          {paymentMethod === "RAZORPAY_ONLINE" && (
            <p className="text-emerald-700 font-mono text-[11px] pt-1">
              Gateway Status: Verified Online
            </p>
          )}
        </div>

        {/* Totals Summary */}
        <div className="space-y-1.5 text-right">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount ({selectedCoupon?.code}):</span>
              <span className="font-mono">-₹{couponDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span className="font-mono">₹{taxableAmount.toLocaleString()}</span>
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
            <span className="font-mono">₹{amountToPayNow.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold text-amber-700">
            <span>Balance Due:</span>
            <span className="font-mono">₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 5. Hotel Policies & Thank You Note */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-1">
        <p className="text-xs font-semibold text-slate-800">
          Thank you for choosing Athenura Grand Hotel! We wish you a delightful stay.
        </p>
      
      </div>
    </div>

    {/* Screen-only Print Trigger Button */}
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
            onClick={() => setStep(step - 1)}
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
                ? !guest.firstName || !guest.email || !guest.phone
                : step === 2 && !selectedRoom
            }
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
          >
            Next Step <FiArrowRight />
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
              : paymentMethod === "CASH"
              ? `Collect ₹${amountToPayNow.toLocaleString()} Cash & Check In`
              : paymentMethod === "CARD_MACHINE"
              ? `Confirm Card Swipe (₹${amountToPayNow.toLocaleString()}) & Check In`
              : `Open Razorpay (₹${amountToPayNow.toLocaleString()}) & Check In`}
          </button>
        )}

        {step === 5 && (
          <button
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            className="px-6 py-2.5 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close & Hand Over Key
          </button>
        )}
      </div>
    </div>
  );
}