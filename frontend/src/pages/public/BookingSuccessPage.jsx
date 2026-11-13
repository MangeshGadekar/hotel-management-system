import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaCheckCircle, FaDownload, FaBed, FaCalendarAlt } from "react-icons/fa";
import { downloadCheckInReceiptApi } from "../../apis/api";
import toast from "react-hot-toast";

const BookingSuccessPage = () => {
  const location = useLocation();
  const data = location.state;
  const [downloading, setDownloading] = useState(false);


  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-600">
        <p>No active booking confirmation found.</p>
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="text-[#D96B43] font-semibold hover:underline"
        >
          Browse Rooms
        </button>
      </div>
    );
  }

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    const toastId = toast.loading("Generating your PDF receipt...");
    try {
      await downloadCheckInReceiptApi(data.bookingId);
      toast.success("Receipt opened successfully!", { id: toastId });
    } catch {
      toast.error("Could not download receipt PDF.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          <FaCheckCircle />
        </div>

        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Payment Confirmed
        </span>

        <h1 className="text-2xl font-bold text-slate-800 mt-2">
          Reservation Successful!
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your room has been reserved. A confirmation receipt was dispatched to <strong>{data.email}</strong>.
        </p>

        {/* Booking Card Details */}
        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-left border border-slate-200 space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400">Booking Reference:</span>
            <span className="font-bold text-slate-800">#{data.bookingId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FaBed /> Room Reserved:
            </span>
            <span className="font-semibold text-slate-800">Room {data.roomNumber}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FaCalendarAlt /> Stay Dates:
            </span>
            <span className="font-medium text-slate-700">
              {data.checkInDate} to {data.checkOutDate} ({data.nights} {data.nights === 1 ? "Night" : "Nights"})
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="font-bold text-emerald-600 text-sm">
              ₹{Number(data.amountPaid).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between pt-0.5">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono text-slate-700 text-[11px]">{data.paymentId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadReceipt}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <FaDownload />
            <span>{downloading ? "Opening..." : "Download Booking PDF"}</span>
          </button>

          <Link
            to="/rooms"
            className="flex-1 py-3 px-4 bg-[#D96B43] hover:bg-[#c45a33] text-white rounded-xl text-xs font-semibold flex items-center justify-center transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;