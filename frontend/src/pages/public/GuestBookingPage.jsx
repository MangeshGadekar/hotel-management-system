import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaBed,
  FaUsers,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import useRoomStore from "../../app/useRoomStore";
import {
  initiateGuestBookingApi,
  verifyGuestPaymentApi,
  fetchActiveExtraServices,
  fetchPublicGuestCouponsApi,
} from "../../apis/api";

const GuestBookingPage = () => {
  const { id, roomNumber } = useParams();
  const targetRoomKey = roomNumber || id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getRoom = useRoomStore((state) => state.getRoom);
  const rooms = useRoomStore((state) => state.rooms);
  const getRoomsList = useRoomStore((state) => state.getRoomsList);

  const [allocatedRooms, setAllocatedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const qCheckIn = searchParams.get("checkIn");
  const qCheckOut = searchParams.get("checkOut");
  const qGuests = searchParams.get("guests");
  const qRoomIds = searchParams.get("roomIds");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    totalGuests: qGuests ? Number(qGuests) : 2,
    checkInDate: qCheckIn || new Date().toISOString().split("T")[0],
    checkOutDate:
      qCheckOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    serviceIds: [],
    couponCode: "",
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    if (qCheckIn) setForm((prev) => ({ ...prev, checkInDate: qCheckIn }));
    if (qCheckOut) setForm((prev) => ({ ...prev, checkOutDate: qCheckOut }));
    if (qGuests) setForm((prev) => ({ ...prev, totalGuests: Number(qGuests) }));
  }, [qCheckIn, qCheckOut, qGuests]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        let catalog = rooms;
        if (!catalog || catalog.length === 0) {
          if (getRoomsList) {
            catalog = (await getRoomsList()) || [];
          }
        }

        let resolvedRooms = [];

        if (qRoomIds) {
          const idList = qRoomIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          resolvedRooms = (catalog || []).filter((r) =>
            idList.some(
              (idStr) =>
                String(r.id) === idStr ||
                String(r.roomNumber || r.room_number) === idStr
            )
          );
        }

        if (resolvedRooms.length === 0 && targetRoomKey) {
          let singleRoom = null;
          if (getRoom) {
            try {
              singleRoom = await getRoom(targetRoomKey);
            } catch {
             
            }
          }

          if (!singleRoom && catalog && catalog.length > 0) {
            singleRoom = catalog.find(
              (r) =>
                String(r.roomNumber || r.room_number || "") === String(targetRoomKey) ||
                String(r.id || "") === String(targetRoomKey)
            );
          }

          if (singleRoom) {
            resolvedRooms = [singleRoom];
          }
        }

        const [srvData, couponData] = await Promise.all([
          fetchActiveExtraServices().catch(() => []),
          fetchPublicGuestCouponsApi().catch(() => []),
        ]);

        if (active) {
          setAllocatedRooms(resolvedRooms);
          setServices(Array.isArray(srvData) ? srvData : []);
          setAvailableCoupons(Array.isArray(couponData) ? couponData : []);
        }
      } catch (err) {
        console.error("Failed to load checkout details", err);
      } finally {
        if (active) {
          setLoading(false);
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [targetRoomKey, qRoomIds, getRoom, rooms, getRoomsList]);

  const nights = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) return 1;
    const start = new Date(form.checkInDate);
    const end = new Date(form.checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const calculatedNights = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return calculatedNights > 0 ? calculatedNights : 1;
  }, [form.checkInDate, form.checkOutDate]);

  const combinedCapacity = useMemo(() => {
    return allocatedRooms.reduce((acc, r) => acc + (r.capacity || 2), 0);
  }, [allocatedRooms]);

  const roomTotal = useMemo(() => {
    return allocatedRooms.reduce((acc, r) => {
      const perNight = Number(r.pricePerNight ?? r.price ?? 0);
      return acc + perNight * nights;
    }, 0);
  }, [allocatedRooms, nights]);

  const extraServicesTotal = form.serviceIds.reduce((sum, sId) => {
    const item = services.find((s) => s.id === sId);
    return sum + (item ? Number(item.price || 0) : 0);
  }, 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    const isPercent =
      appliedCoupon.discountType === "PERCENTAGE" ||
      appliedCoupon.discountType === "PERCENT" ||
      appliedCoupon.type === "PERCENT";

    if (isPercent) {
      const pct = Number(appliedCoupon.discountValue || appliedCoupon.value || 0);
      couponDiscount = Math.round((roomTotal * pct) / 100);
      if (
        appliedCoupon.maxDiscount &&
        couponDiscount > Number(appliedCoupon.maxDiscount)
      ) {
        couponDiscount = Number(appliedCoupon.maxDiscount);
      }
    } else {
      couponDiscount = Number(
        appliedCoupon.discountValue || appliedCoupon.value || 0
      );
    }
    couponDiscount = Math.min(couponDiscount, roomTotal);
  }

  const subtotal = roomTotal + extraServicesTotal;
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedTotal = Math.max(0, subtotal + estimatedTax - couponDiscount);

  const handleApplyCoupon = (coupon) => {
    if (appliedCoupon?.code?.toUpperCase() === coupon.code?.toUpperCase()) {
      toast("Coupon is already active!");
      return;
    }

    if (coupon.minBookingAmount && roomTotal < Number(coupon.minBookingAmount)) {
      toast.error(`Requires minimum room tariff of ₹${coupon.minBookingAmount}`);
      return;
    }

    setAppliedCoupon(coupon);
    setForm((prev) => ({ ...prev, couponCode: coupon.code }));
    toast.success(`Coupon ${coupon.code} applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setForm((prev) => ({ ...prev, couponCode: "" }));
    toast.success("Coupon removed");
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    const cleanCode = form.couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (appliedCoupon?.code?.toUpperCase() === cleanCode) {
      toast("Coupon is already active!");
      return;
    }

    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode
    );

    if (found) {
      handleApplyCoupon(found);
    } else {
      toast.error("Invalid coupon code or not available for online guests");
    }
  };

  const handleServiceToggle = (serviceId) => {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      toast.error("Please enter all required guest details");
      return;
    }

    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    const headcount = Number(form.totalGuests) || 1;
    if (combinedCapacity < headcount) {
      toast.error(
        `Headcount (${headcount}) exceeds total room capacity (${combinedCapacity}). Please select additional rooms.`
      );
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating secure booking session...");

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay payment gateway failed to load");

      const primaryRoom = allocatedRooms[0];
      const selectedRoomIds = allocatedRooms.map((r) => Number(r.id)).filter(Boolean);
      const selectedRoomNumbers = allocatedRooms.map((r) => String(r.roomNumber || r.room_number));

      const res = await initiateGuestBookingApi({
        roomNumber: String(primaryRoom.roomNumber || primaryRoom.room_number),
        roomNumbers: selectedRoomNumbers,
        roomId: primaryRoom.id,
        roomIds: selectedRoomIds,
        totalGuests: headcount,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        serviceIds: form.serviceIds,
        couponCode: appliedCoupon
          ? appliedCoupon.code
          : form.couponCode.trim() || null,
      });

      toast.dismiss(toastId);

      const roomsDisplay = selectedRoomNumbers.join(", ");

      const options = {
        key: res.razorpayKeyId,
        amount: Math.round(res.amountToPay * 100),
        currency: res.currency || "INR",
        name: "Paradise Hotel & Suites",
        description: `Booking for Room(s) ${roomsDisplay} (${nights} nights)`,
        order_id: res.razorpayOrderId,
        prefill: {
          name: res.guestName,
          email: res.guestEmail,
          contact: res.guestPhone,
        },
        theme: {
          color: "#D96B43",
        },
        handler: async (verifyResponse) => {
          const verifyToast = toast.loading("Confirming your transaction...");
          try {
            await verifyGuestPaymentApi({
              bookingId: res.bookingId,
              razorpayOrderId: verifyResponse.razorpay_order_id,
              razorpayPaymentId: verifyResponse.razorpay_payment_id,
              razorpaySignature: verifyResponse.razorpay_signature,
              paymentType: "FULL",
            });

            toast.success("Booking confirmed!", { id: verifyToast });

            navigate("/booking/success", {
              state: {
                bookingId: res.bookingId,
                roomNumber: roomsDisplay,
                checkInDate: form.checkInDate,
                checkOutDate: form.checkOutDate,
                nights: nights,
                totalGuests: headcount,
                email: form.email,
                amountPaid: res.amountToPay,
                paymentId: verifyResponse.razorpay_payment_id,
              },
            });
          } catch (err) {
            toast.error(err.message || "Payment verification failed", {
              id: verifyToast,
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      toast.error(err.message || "Could not start booking process", {
        id: toastId,
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <BiLoaderAlt className="animate-spin text-4xl text-[#D96B43]" />
        <p className="text-sm">Loading checkout...</p>
      </div>
    );
  }

  if (allocatedRooms.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-xl font-bold text-slate-800">No Room Selected</h2>
        <Link
          to="/rooms"
          className="px-5 py-2.5 bg-[#D96B43] text-white rounded-xl text-sm font-semibold"
        >
          View All Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#D96B43] mb-6 transition cursor-pointer"
        >
          <FaArrowLeft /> Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <span className="text-xs font-semibold text-[#D96B43] uppercase tracking-wider">
                  Reservation Section
                </span>
                <h1 className="text-2xl font-bold text-slate-800 mt-1">
                  Guest Details &amp; Checkout
                </h1>
              </div>

              

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#D96B43] border border-orange-100 flex items-center justify-center text-lg">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Selected Stay Window
                        </span>
                        <p className="text-sm font-extrabold text-slate-800">
                          {form.checkInDate} &rarr; {form.checkOutDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs shadow-2xs">
                        {nights} {nights === 1 ? "Night" : "Nights"}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-xs text-[#D96B43] hover:underline font-semibold cursor-pointer"
                      >
                        Change Dates
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-[#D96B43]" />
                      <span className="text-slate-600 font-medium">No of Guests:</span>
                      <strong className="text-slate-800 font-bold">
                        {form.totalGuests} Guests
                      </strong>
                    </div>

                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      placeholder="Enter first name"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#D96B43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      placeholder="Enter last name"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="stavandalal7@gmail.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#D96B43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>                    
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Enhance Your Stay (Optional)
                    </label>
                    <div className="space-y-2">
                      {services.map((srv) => (
                        <label
                          key={srv.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                            form.serviceIds.includes(srv.id)
                              ? "border-[#D96B43] bg-amber-50/40"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.serviceIds.includes(srv.id)}
                              onChange={() => handleServiceToggle(srv.id)}
                              className="rounded text-[#D96B43] focus:ring-0 w-4 h-4"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {srv.name}
                              </p>
                              {srv.description && (
                                <p className="text-[11px] text-slate-500">
                                  {srv.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            +₹{Number(srv.price).toLocaleString("en-IN")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    Number(form.totalGuests || 1) > combinedCapacity
                  }
                  className="w-full py-4 bg-[#D96B43] hover:bg-[#c45a33] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-sm disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-lg" /> Connecting with Gateway...
                    </>
                  ) : (
                    <>Pay &amp; Confirm Stay (₹{estimatedTotal.toLocaleString("en-IN")})</>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FaTag className="text-[#D96B43]" /> Coupon Codes
                </h3>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <form onSubmit={handleManualApply} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={form.couponCode}
                  onChange={(e) =>
                    setForm({ ...form, couponCode: e.target.value.toUpperCase() })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono outline-none focus:border-[#D96B43]"
                />
                <button
                  type="submit"
                  disabled={
                    !form.couponCode.trim() ||
                    appliedCoupon?.code?.toUpperCase() ===
                      form.couponCode.trim().toUpperCase()
                  }
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </form>

              <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {availableCoupons.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No active online offers available right now.
                  </p>
                ) : (
                  availableCoupons.map((coupon) => {
                    const isApplied = appliedCoupon?.code === coupon.code;
                    const isPercent =
                      coupon.discountType === "PERCENTAGE" ||
                      coupon.discountType === "PERCENT" ||
                      coupon.type === "PERCENT";
                    const discountText = isPercent
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`;

                    return (
                      <div
                        key={coupon.id || coupon.code}
                        className={`p-3 rounded-xl border transition ${
                          isApplied
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#D96B43] bg-amber-100/60 px-2 py-0.5 rounded-md">
                            {coupon.code}
                          </span>
                          {isApplied ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <FaCheckCircle /> Applied
                              </span>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer ml-1"
                              >
                                (Remove)
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(coupon)}
                              className="text-xs font-bold text-[#D96B43] hover:underline cursor-pointer"
                            >
                              APPLY
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {coupon.description || `Get ${discountText} on room tariff`}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 sticky top-6">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Price Breakup
              </h3>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {allocatedRooms.map((r) => {
                  const img = r.images && r.images.length > 0 ? r.images[0] : null;
                  return img ? (
                    <div
                      key={r.id || r.roomNumber}
                      className="h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative"
                    >
                      <img
                        src={img}
                        alt={`Room ${r.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                        Room {r.roomNumber}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-start">
                  <span className="flex items-center gap-1.5">
                    <FaBed className="text-slate-400" /> Accommodation:
                  </span>
                  <div className="text-right">
                    <strong className="text-slate-800 block">
                      {allocatedRooms.length > 1
                        ? allocatedRooms.map((r) => `Room ${r.roomNumber}`).join(", ")
                        : `Room ${allocatedRooms[0].roomNumber} (${allocatedRooms[0].roomType})`}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      ({allocatedRooms.length} {allocatedRooms.length === 1 ? "room" : "rooms"})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaUsers className="text-slate-400" /> Capacity:
                  </span>
                  <strong className="text-slate-800">
                    Max {combinedCapacity} Guests
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Stay Duration:</span>
                  <strong className="text-slate-800">
                    {nights} {nights === 1 ? "Night" : "Nights"}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Rooms Charges Total:</span>
                  <strong className="text-slate-800">
                    ₹{roomTotal.toLocaleString("en-IN")}
                  </strong>
                </div>

                {extraServicesTotal > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Add-on Services:</span>
                    <strong>+₹{extraServicesTotal.toLocaleString("en-IN")}</strong>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({appliedCoupon?.code}):</span>
                    <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxes &amp; GST (18%):</span>
                  <span>₹{estimatedTax.toLocaleString("en-IN")}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800">Total Payable:</span>
                  <span className="font-extrabold text-[#D96B43] text-base">
                    ₹{estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestBookingPage;