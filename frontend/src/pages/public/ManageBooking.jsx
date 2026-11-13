import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaBed,
  FaUsers,
  FaTimesCircle,
  FaCheckCircle,
  FaPrint,
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
  FaLock,
  FaDownload,
} from "react-icons/fa";
import { BiLoaderAlt, BiBuildingHouse } from "react-icons/bi";
import toast from "react-hot-toast";
import useBookingStore from "../../app/useBookingStore";
import {
  downloadCheckInReceiptApi,
  downloadCancellationReceiptPdf,
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

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanId = bookingRef.replace(/^#/, "").trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanId) {
      toast.error("Please enter your Booking Reference ID (e.g. 12)");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid registered email");
      return;
    }

    setLoading(true);
    try {
      await sendBookingOtp(cleanId, cleanEmail);
      toast.success(`Verification code sent to ${cleanEmail}`);
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Could not find booking. Check ID & Email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();

    const cleanId = bookingRef.replace(/^#/, "").trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyBookingOtp(cleanId, cleanEmail, cleanOtp);

      const checkInDate = data.checkInDate || data.checkIn || "";
      const checkOutDate = data.checkOutDate || data.checkOut || "";

      const computedNights =
        data.nights ||
        Math.max(
          1,
          Math.round(
            (new Date(checkOutDate) - new Date(checkInDate)) /
              (1000 * 60 * 60 * 24)
          ) || 1
        );

      const perNight = Number(
        data.roomCharges
          ? data.roomCharges / computedNights
          : data.room?.pricePerNight || 0
      );
      const netTotal = Number(data.totalAmount || data.netPayable || 0);
      const estTaxes = Number(data.taxAmount || 0);

      setBooking({
        id: data.id || cleanId,
        roomNumber: data.room?.roomNumber || data.roomNumber || "N/A",
        roomType: (
          data.room?.roomType ||
          data.roomType ||
          "DELUXE"
        ).replace(/_/g, " "),
        guestName: data.guest
          ? `${data.guest.firstName || ""} ${data.guest.lastName || ""}`.trim()
          : data.guestName || "Valued Guest",
        email: data.guest?.email || data.email || cleanEmail,
        phone: data.guest?.phone || data.phone || "N/A",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: data.totalGuests || data.guests || 2,
        status: (data.bookingStatus || data.status || "CONFIRMED").toUpperCase(),
        pricePerNight: perNight,
        nights: computedNights,
        taxes: estTaxes,
        totalAmount: netTotal,
        paymentStatus: Number(data.balanceDue || 0) === 0 ? "PAID" : "PARTIAL",
        receiptNumber: data.receiptNumber || `ATH-REC-${data.id || cleanId}`,
      });

      setStep(3);
      toast.success("Identity verified! Reservation loaded.");
    } catch (err) {
      toast.error(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };


  const handleCancelBooking = async () => {
    if (!booking?.id) return;

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel reservation #${booking.id}? Cancellation and refund rules will apply.`
    );
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const targetEmail = booking.email || email;
      const response = await cancelBooking(booking.id, targetEmail);
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
    if (!booking?.id) return;

    const isCancelled = booking.status === "CANCELLED";
    setDownloadingPdf(true);
    const toastId = toast.loading(
      isCancelled ? "Preparing Cancellation Slip..." : "Generating Check-In Receipt..."
    );

    try {
      if (isCancelled) {
        await downloadCancellationReceiptPdf(booking.id);
        toast.success("Cancellation Slip ready!", { id: toastId });
      } else {
        await downloadCheckInReceiptApi(booking.id);
        toast.success("Check-In Receipt opened!", { id: toastId });
      }
    } catch {
      toast.error("Could not load PDF document. Please retry.", { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleReset = () => {
    resetBooking();
    setBooking(null);
    setOtp("");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#D96B43] transition"
          >
            <FaArrowLeft /> Back to Rooms
          </Link>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FaShieldAlt className="text-emerald-600 text-xs" /> Secure Guest Portal
          </span>
        </div>

        {/* ── STEP 1: Enter Reference & Registered Email ── */}
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
                  Enter your Booking Reference and registered email. We will send an OTP to securely unlock your details.
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
                  placeholder="e.g. 12 or #12"
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

        {/* ── STEP 2: Enter Verification OTP ── */}
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
                <strong className="text-slate-800 font-semibold">{email}</strong> for Booking{" "}
                <strong className="text-slate-800 font-semibold">
                  #{bookingRef.replace(/^#/, "")}
                </strong>.
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

        {/* ── STEP 3: Reservation Details Unlocked ── */}
        {step === 3 && booking && (
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs print:border-none print:shadow-none">
            {/* Top Summary Header */}
            <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reservation Confirmation
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  #{booking.id}
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
              {/* Grid: Room & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Details */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Room Details
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-800">
                      {booking.roomType} Room {booking.roomNumber}
                    </h3>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <FaUsers className="text-slate-400" /> {booking.guests} Guests
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <FaBed className="text-[#D96B43]" /> Attached bathroom, workspace &amp; hotel amenities
                  </p>
                </div>

                {/* Stay Schedule */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Stay Schedule
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CHECK-IN</span>
                      <strong className="text-slate-800">{booking.checkIn}</strong>
                      <span className="text-[10px] text-slate-400 block">From 2:00 PM</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CHECK-OUT</span>
                      <strong className="text-slate-800">{booking.checkOut}</strong>
                      <span className="text-[10px] text-slate-400 block">Until 12:00 PM</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Total Duration:{" "}
                    <strong>
                      {booking.nights} {booking.nights === 1 ? "Night" : "Nights"}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Guest & Payment Summary */}
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
                      {booking.email} {booking.phone !== "N/A" && `• ${booking.phone}`}
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
                      Room Tariff ({booking.nights} {booking.nights === 1 ? "night" : "nights"})
                    </span>
                    <span>
                      ₹{(booking.pricePerNight * booking.nights).toLocaleString("en-IN")}
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <FaPrint className="text-slate-400" /> Print Summary
                  </button>

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

                {(booking.status === "CONFIRMED" || booking.status === "BOOKED") && (
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
        )}
      </div>
    </div>
  );
}