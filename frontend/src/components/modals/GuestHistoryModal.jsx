import React, { useEffect, useState } from "react";
import { FiX, FiCalendar, FiUser, FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchBookingsByGuestIdApi } from "../../apis/api";

const STATUS_BADGES = {
  BOOKED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-200",
  CHECKED_OUT: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function GuestHistoryModal({ guest, onClose, onSelectBooking }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guest?.id) return;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchBookingsByGuestIdApi(guest.id);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load stay history");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [guest?.id]);

  if (!guest) return null;

  const fullName = `${guest.firstName || ""} ${guest.lastName || ""}`.trim() || guest.name || "Guest";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#D96B43] flex items-center justify-center font-bold text-base">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
                <span className="text-xs text-slate-500 font-mono">Guest ID: #{guest.id}</span>
              </div>
            </div>

            {/* Contact Pills */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
              {guest.email && (
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <FiMail className="text-slate-400" size={13} /> {guest.email}
                </span>
              )}
              {guest.phone && (
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <FiPhone className="text-slate-400" size={13} /> {guest.phone}
                </span>
              )}
              {guest.city && (
                <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <FiMapPin className="text-slate-400" size={13} /> {guest.city}, {guest.state}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Stay History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiClock size={13} /> Reservation History ({bookings.length})
            </h3>
            <span className="text-[11px] text-slate-500">Click any reservation to view full breakdown</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading guest reservation history...</div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              No reservation history found for this guest.
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookings.map((b) => {
                const status = (b.bookingStatus || "").replace("-", "_");
                const amount = Number(b.netPayable || b.totalAmount || 0);
                const balance = Number(b.totalBalanceDue ?? b.balanceDue ?? 0);

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (onSelectBooking) onSelectBooking(b.id);
                    }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#D96B43]/50 hover:bg-orange-50/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-[#D96B43]">
                          Booking #{b.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                            STATUS_BADGES[status] || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {status}
                        </span>
                        {b.previousRoomNumber && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            Switched from Room {b.previousRoomNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span className="font-semibold text-slate-700">
                          Room {b.roomNumber || b.room?.roomNumber} . {b.roomType || b.room?.roomType}
                        </span>
                        <span>.</span>
                        <span className="font-mono">
                          {b.checkInDate} &rarr; {b.checkOutDate}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                      {balance > 0 ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                          Due: ₹{balance.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600">Fully Paid</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}