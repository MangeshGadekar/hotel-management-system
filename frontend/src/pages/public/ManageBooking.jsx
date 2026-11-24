import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaBed,
  FaUsers,
  FaTimesCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
  FaLock,
  FaDownload,
  FaStar,
  FaPenFancy,
  FaTrashAlt,
} from "react-icons/fa";
import { BiLoaderAlt, BiBuildingHouse } from "react-icons/bi";
import toast from "react-hot-toast";
import useBookingStore from "../../app/useBookingStore";
import {
  downloadCheckInReceiptApi,
  downloadCancellationReceiptPdf,
  fetchManagedBookingApi,
  submitPublicReviewApi,
  deletePublicReviewByBookingApi,
} from "../../apis/api";

const STATUS_BADGES = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BOOKED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function ManageBooking() {
  const sendBookingOtp = useBookingStore((state) => state.sendBookingOtp);
  const verifyBookingOtp = useBookingStore((state) => state.verifyBookingOtp);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [booking, setBooking] = useState(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const mapBookingData = useCallback((data, fallbackRef, fallbackEmail) => {
    const bookingData = data.booking || data;
    const checkInDate = bookingData.checkInDate || bookingData.checkIn || "";
    const checkOutDate = bookingData.checkOutDate || bookingData.checkOut || "";

    const computedNights =
      bookingData.nights ||
      Math.max(
        1,
        Math.round(
          (new Date(checkOutDate) - new Date(checkInDate)) /
            (1000 * 60 * 60 * 24)
        ) || 1
      );

    const perNight = Number(
      bookingData.roomCharges
        ? bookingData.roomCharges / computedNights
        : bookingData.room?.pricePerNight || 0
    );

    const netTotal = Number(
      bookingData.totalAmount ??
        bookingData.totalPrice ??
        bookingData.netPayable ??
        0
    );

    const estTaxes = Number(bookingData.taxAmount || 0);
    const resolvedReference = bookingData.bookingReference || fallbackRef;

    return {
      id: bookingData.id,
      bookingReference: resolvedReference,
      roomNumber: bookingData.room?.roomNumber || bookingData.roomNumber || "N/A",
      roomType: (
        bookingData.room?.roomType ||
        bookingData.roomType ||
        "DELUXE"
      ).replace(/_/g, " "),
      guestName: bookingData.guest
        ? `${bookingData.guest.firstName || ""} ${bookingData.guest.lastName || ""}`.trim()
        : bookingData.guestName || "Valued Guest",
      email: bookingData.guest?.email || bookingData.email || fallbackEmail,
      phone: bookingData.guest?.phone || bookingData.phone || "N/A",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: bookingData.totalGuests || bookingData.guests || 2,
      status: (
        bookingData.bookingStatus ||
        bookingData.status ||
        "CONFIRMED"
      ).toUpperCase(),
      pricePerNight: perNight,
      nights: computedNights,
      taxes: estTaxes,
      totalAmount: netTotal,
      paymentStatus: Number(bookingData.balanceDue || 0) === 0 ? "PAID" : "PARTIAL",
      receiptNumber: bookingData.receiptNumber || `ATH-REC-${resolvedReference}`,
    };
  }, []);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("guestAccessToken");
    const savedBookingRef =
      sessionStorage.getItem("guestBookingRef") ||
      sessionStorage.getItem("guestBookingId");
    const savedEmail = sessionStorage.getItem("guestEmail");

    if (savedToken && savedBookingRef) {
      setBookingRef(savedBookingRef);
      if (savedEmail) setEmail(savedEmail);
      if (sessionStorage.getItem(`reviewed_${savedBookingRef}`) === "true") {
        setReviewSubmitted(true);
      }

      fetchManagedBookingApi(savedBookingRef, savedToken)
        .then((data) => {
          setBooking(mapBookingData(data, savedBookingRef, savedEmail));
          setStep(3);
        })
        .catch(() => {
          sessionStorage.removeItem("guestAccessToken");
          sessionStorage.removeItem("guestBookingRef");
          sessionStorage.removeItem("guestBookingId");
          sessionStorage.removeItem("guestEmail");
          setStep(1);
        });
    }
  }, [mapBookingData]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanRef = bookingRef.replace(/^#/, "").trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanRef) {
      toast.error(
        "Please enter your Booking Reference ID (e.g. BOOKING-F3CD85C1)"
      );
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid registered email");
      return;
    }

    setLoading(true);
    try {
      await sendBookingOtp(cleanRef, cleanEmail);
      toast.success(`Verification code sent to ${cleanEmail}`);
      setStep(2);
    } catch (err) {
      toast.error(
        err.message || "Could not find booking. Check Reference & Email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanRef = bookingRef.replace(/^#/, "").trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyBookingOtp(cleanRef, cleanEmail, cleanOtp);
      const mapped = mapBookingData(response, cleanRef, cleanEmail);
      const resolvedRef = mapped.bookingReference || cleanRef;

      if (response.token) {
        sessionStorage.setItem("guestAccessToken", response.token);
        sessionStorage.setItem("guestBookingRef", resolvedRef);
        sessionStorage.setItem("guestEmail", cleanEmail);
      }

      setReviewSubmitted(
        sessionStorage.getItem(`reviewed_${resolvedRef}`) === "true"
      );
      setBooking(mapped);
      setStep(3);
      toast.success("Identity verified! Reservation loaded.");
    } catch (err) {
      toast.error(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const identifier = booking?.bookingReference || booking?.id;
    if (!identifier) return;

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel reservation ${identifier}? Cancellation and refund rules will apply.`
    );
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const targetEmail = booking.email || email;
      const response = await cancelBooking(
        booking.id || identifier,
        targetEmail
      );
      setBooking((prev) => ({ ...prev, status: "CANCELLED" }));
      toast.success(
        typeof response === "string"
          ? response
          : response?.message || "Reservation cancelled successfully"
      );
    } catch (err) {
      toast.error(err.message || "Failed to cancel reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdfSlip = async () => {
    const identifier = booking?.bookingReference || booking?.id;
    if (!identifier) return;

    const isCancelled = booking.status === "CANCELLED";
    const guestToken = sessionStorage.getItem("guestAccessToken");
    setDownloadingPdf(true);
    const toastId = toast.loading(
      isCancelled
        ? "Preparing Cancellation Slip..."
        : "Generating Check-In Receipt..."
    );

    try {
      if (isCancelled) {
        await downloadCancellationReceiptPdf(identifier, guestToken);
        toast.success("Cancellation Slip ready!", { id: toastId });
      } else {
        await downloadCheckInReceiptApi(identifier, guestToken);
        toast.success("Check-In Receipt opened!", { id: toastId });
      }
    } catch {
      toast.error("Could not load PDF document. Please retry.", { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const guestToken = sessionStorage.getItem("guestAccessToken");
    if (!guestToken) {
      toast.error("Session expired. Please verify your booking again.");
      return;
    }

    if (booking.status !== "CHECKED_OUT") {
      toast.error("Reviews can only be submitted after checkout.");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write your review before submitting.");
      return;
    }

    setSubmittingReview(true);
    try {
      await submitPublicReviewApi(
        {
          guestName: booking.guestName || "Verified Guest",
          rating: reviewRating,
          comment: reviewComment.trim(),
          bookingReference: booking.bookingReference,
        },
        guestToken
      );

      if (booking.bookingReference) {
        sessionStorage.setItem(`reviewed_${booking.bookingReference}`, "true");
      }
      setReviewSubmitted(true);
      setReviewComment("");
      toast.success("Thank you! Your verified review is now live.");
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    const guestToken = sessionStorage.getItem("guestAccessToken");
    if (!guestToken || !booking?.bookingReference) {
      toast.error("Session expired. Please verify your booking again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove your review?"
    );
    if (!confirmed) return;

    setDeletingReview(true);
    try {
      await deletePublicReviewByBookingApi(booking.bookingReference, guestToken);
      sessionStorage.removeItem(`reviewed_${booking.bookingReference}`);
      setReviewSubmitted(false);
      setReviewComment("");
      setReviewRating(5);
      toast.success("Your review has been removed.");
    } catch (err) {
      toast.error(err.message || "Failed to remove review");
    } finally {
      setDeletingReview(false);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem("guestAccessToken");
    sessionStorage.removeItem("guestBookingRef");
    sessionStorage.removeItem("guestBookingId");
    sessionStorage.removeItem("guestEmail");
    resetBooking();
    setBooking(null);
    setOtp("");
    setReviewComment("");
    setReviewRating(5);
    setReviewSubmitted(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#D96B43] transition"
          >
            <FaArrowLeft /> Back to Rooms
          </Link>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FaShieldAlt className="text-emerald-600 text-xs" /> Secure Guest
            Portal
          </span>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#D96B43] flex items-center justify-center text-xl border border-orange-100">
                <BiBuildingHouse />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Manage Your Reservation
                </h1>
                <p className="text-xs text-slate-500">
                  Enter your Booking Reference and registered email. We will
                  send an OTP to securely unlock your details.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSendOtp}
              className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Booking Reference ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BOOKING-F3CD85C1"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#D96B43] focus:ring-1 focus:ring-[#D96B43] transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#D96B43] focus:ring-1 focus:ring-[#D96B43] transition"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#D96B43] hover:bg-[#c45a33] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? (
                    <BiLoaderAlt className="animate-spin text-sm" />
                  ) : (
                    <span>Send OTP →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-lg mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 text-[#D96B43] border border-orange-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
                <FaLock />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Check Your Email
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We sent a 6-digit access code to{" "}
                <strong className="text-slate-800 font-semibold">{email}</strong>{" "}
                for Booking{" "}
                <strong className="text-slate-800 font-mono font-semibold">
                  {bookingRef.replace(/^#/, "")}
                </strong>
                .
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1.5">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-xl tracking-[0.4em] font-mono font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-[#D96B43] focus:ring-1 focus:ring-[#D96B43] transition"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D96B43] hover:bg-[#c45a33] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <BiLoaderAlt className="animate-spin text-sm" />
                ) : (
                  <span>Verify &amp; View Reservation</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Change Email / ID
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#D96B43] hover:underline font-bold cursor-pointer disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && booking && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs print:border-none print:shadow-none">
              <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reservation Confirmation
                  </span>
                  <h2 className="text-lg font-mono font-black text-slate-900 mt-0.5">
                    {booking.bookingReference || `#${booking.id}`}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      STATUS_BADGES[booking.status] || STATUS_BADGES.CONFIRMED
                    }`}
                  >
                    {booking.status}
                  </span>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {booking.paymentStatus}
                  </span>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-2 text-xs font-semibold text-slate-400 hover:text-slate-600 print:hidden cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Room Details
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-slate-800">
                        {booking.roomType} Room {booking.roomNumber}
                      </h3>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <FaUsers className="text-slate-400" /> {booking.guests}{" "}
                        Guests
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <FaBed className="text-[#D96B43]" /> Attached bathroom,
                      workspace &amp; hotel amenities
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Stay Schedule
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          CHECK-IN
                        </span>
                        <strong className="text-slate-800">
                          {booking.checkIn}
                        </strong>
                        <span className="text-[10px] text-slate-400 block">
                          From 2:00 PM
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          CHECK-OUT
                        </span>
                        <strong className="text-slate-800">
                          {booking.checkOut}
                        </strong>
                        <span className="text-[10px] text-slate-400 block">
                          Until 12:00 PM
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Total Duration:{" "}
                      <strong>
                        {booking.nights}{" "}
                        {booking.nights === 1 ? "Night" : "Nights"}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Lead Guest
                      </span>
                      <strong className="text-sm text-slate-800">
                        {booking.guestName}
                      </strong>
                      <span className="text-xs text-slate-500 block">
                        {booking.email}{" "}
                        {booking.phone !== "N/A" && `• ${booking.phone}`}
                      </span>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <span>Receipt No.</span>
                      <p className="font-mono font-semibold text-slate-600">
                        {booking.receiptNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>
                        Room Tariff ({booking.nights}{" "}
                        {booking.nights === 1 ? "night" : "nights"})
                      </span>
                      <span>
                        ₹
                        {(
                          booking.pricePerNight * booking.nights
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {booking.taxes > 0 && (
                      <div className="flex justify-between">
                        <span>GST &amp; Taxes</span>
                        <span>₹{booking.taxes.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-slate-900 text-sm">
                      <span>Total Settled</span>
                      <span className="text-[#D96B43]">
                        ₹{booking.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={downloadingPdf}
                      onClick={handleDownloadPdfSlip}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <FaDownload />
                      <span>
                        {downloadingPdf
                          ? "Opening..."
                          : booking.status === "CANCELLED"
                          ? "Download Cancellation Slip"
                          : "Download Check-In Receipt"}
                      </span>
                    </button>
                  </div>

                  {(booking.status === "CONFIRMED" ||
                    booking.status === "BOOKED") && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleCancelBooking}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <FaTimesCircle />
                      <span>Cancel Reservation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {booking.status !== "CANCELLED" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs print:hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-base">
                      <FaPenFancy />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Rate Your Experience at Hotel Athitya
                      </h3>
                      <p className="text-xs text-slate-500">
                        Verified feedback from{" "}
                        <strong className="text-slate-700">
                          {booking.guestName}
                        </strong>{" "}
                        ({booking.bookingReference})
                      </p>
                    </div>
                  </div>

                  {booking.status === "CHECKED_OUT" && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <FaCheckCircle /> Verified Stay
                    </span>
                  )}
                </div>

                {booking.status !== "CHECKED_OUT" ? (
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                    Reviews unlock automatically once you have completed your
                    stay and checked out.
                  </div>
                ) : reviewSubmitted ? (
                  <div className="mt-5 p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-4 text-emerald-800">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-xl text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">
                          Review Submitted — Thank You!
                        </p>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Your verified stay review has been published on Hotel
                          Athitya’s homepage.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingReview}
                      onClick={handleDeleteReview}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      {deletingReview ? (
                        <BiLoaderAlt className="animate-spin text-sm" />
                      ) : (
                        <FaTrashAlt className="text-[11px]" />
                      )}
                      <span>
                        {deletingReview ? "Removing..." : "Remove Review"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Overall Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                          >
                            <FaStar
                              className={
                                star <= reviewRating
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-600 ml-2">
                          {reviewRating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Your Review *
                      </label>
                      <textarea
                        rows="3"
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts on the room, hospitality, and stay..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#D96B43] focus:ring-1 focus:ring-[#D96B43] transition resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 bg-[#D96B43] hover:bg-[#c45a33] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <BiLoaderAlt className="animate-spin text-sm" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        <span>
                          {submittingReview
                            ? "Submitting..."
                            : "Submit Verified Review"}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}