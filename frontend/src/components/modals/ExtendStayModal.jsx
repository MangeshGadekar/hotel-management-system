import React, { useState } from "react";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";

export function ExtendStayModal({ isOpen, onClose, booking, onConfirm, isProcessing }) {
  if (!isOpen || !booking) return null;

  const currentCheckOut = booking.checkOutDate;
  const minDate = new Date(new Date(currentCheckOut).getTime() + 86400000)
    .toISOString()
    .split("T")[0];

  const [newDate, setNewDate] = useState(minDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDate || newDate <= currentCheckOut) return;
    onConfirm(booking.id, newDate);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FaCalendarAlt className="text-[#D96B43]" />
              Extend Stay
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Room {booking.room?.roomNumber || booking.roomNumber} • Booking #{booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Current Check-Out</span>
              <span className="font-bold text-slate-700">{currentCheckOut}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Room Rate</span>
              <span className="font-bold text-[#D96B43]">
                ₹{booking.room?.pricePerNight || booking.roomCharges} / night
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select New Check-Out Date
            </label>
            <input
              type="date"
              min={minDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#D96B43]/20 focus:border-[#D96B43]"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            * Extra nights and applicable taxes will be added directly to the guest's folio balance due.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !newDate}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D96B43] hover:bg-[#c25a34] rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {isProcessing ? "Extending..." : "Confirm Extension"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}