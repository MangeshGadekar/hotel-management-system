import { useState, useEffect, useCallback } from 'react';
import BookingForm from '../../components/forms/BookingForm';
import useBookingStore from '../../app/useBookingStore';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import BookingDetailsModal from '../../components/modals/BookingDetailsModal';

const STATUS_BADGES = {
  BOOKED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CHECKED_IN: 'bg-blue-50 text-blue-700 border-blue-200',
  CHECKED_OUT: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_MAP = {
  BOOKED: 'Confirmed',
  CHECKED_IN: 'Checked-In',
  CHECKED_OUT: 'Checked-Out',
  CANCELLED: 'Cancelled',
};

export default function Bookings() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [confirmCheckoutModal, setConfirmCheckoutModal] = useState({ open: false, booking: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const allBookings = useBookingStore((state) => state.bookingList);
  const getBookingList = useBookingStore((state) => state.getAllBooking);
  const checkInBooking = useBookingStore((state) => state.checkInBooking);
  const checkOutDirect = useBookingStore((state) => state.checkOutDirect);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      await getBookingList();
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [getBookingList]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCheckIn = async (b) => {
    try {
      await checkInBooking(b.id);
      toast.success(`Booking #${b.id} checked in! Room ${b.roomNumber} is now OCCUPIED.`);
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  const handleCheckOutClick = (b) => {
    const remainingBalance = Number(b.balanceDue ?? 0);

    if (remainingBalance > 0) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-slate-800 text-xs">
              Booking #{b.id} has an outstanding balance of ₹{remainingBalance.toLocaleString()}.
            </span>
            <span className="text-[11px] text-slate-600">
              Please collect the remaining balance on the Payments page before checking out.
            </span>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = `/admin/payments?bookingId=${b.id}&amount=${remainingBalance}&guest=${encodeURIComponent(b.guestName || '')}`;
                }}
                className="px-2.5 py-1 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded text-xs font-semibold cursor-pointer transition"
              >
                Go to Payments
              </button>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
      return;
    }

    setConfirmCheckoutModal({ open: true, booking: b });
  };

  // Check-out finalized once balance is verified at 0
  const handleConfirmDirectCheckout = async () => {
    if (!confirmCheckoutModal.booking) return;
    setIsProcessing(true);
    const b = confirmCheckoutModal.booking;

    try {
      await checkOutDirect(b.id);
      toast.success(`Check-out confirmed! Room ${b.roomNumber} is now AVAILABLE.`);
      setConfirmCheckoutModal({ open: false, booking: null });
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to complete check-out');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const filteredBookings = allBookings
    .filter((b) => {
      const rawStatus = (b.bookingStatus || '').replace('-', '_');
      const displayStatus = STATUS_MAP[rawStatus] || b.bookingStatus;
      const matchesStatus = filterStatus === 'All' || displayStatus === filterStatus;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(b.guestName ?? '').toLowerCase().includes(q) ||
        String(b.id ?? '').toLowerCase().includes(q) ||
        String(b.roomNumber ?? '').toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => Number(b.id) - Number(a.id)); // <-- Sorts newest / highest ID first

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Booking Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any booking row to inspect complete stay charges, services, and taxes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBookingForm(true)}
            className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold hover:bg-[#c95a34] transition shadow-xs cursor-pointer"
          >
            + Add Booking
          </button>
          <input
            type="text"
            placeholder="Search by ID, Name or Room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Room Type</th>
                <th className="px-6 py-3">Check-In</th>
                <th className="px-6 py-3">Check-Out</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3">Booking Status</th>
                <th className="px-6 py-3 text-right">Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
  {loading ? (
    <tr>
      <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
        Loading reservations…
      </td>
    </tr>
  ) : filteredBookings.length === 0 ? (
    <tr>
      <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
        No bookings found
      </td>
    </tr>
  ) : (
    filteredBookings.map((b) => {
      const rawStatus = (b.bookingStatus || '').replace('-', '_');
      const displayStatus = STATUS_MAP[rawStatus] || b.bookingStatus;
      const remainingBalance = Number(b.balanceDue ?? 0);

      return (
        <tr
          key={b.id}
          onClick={() => setSelectedBookingId(b.id)}
          className="hover:bg-orange-50/50 cursor-pointer transition select-none group"
          title="Click to view full reservation breakdown & charges"
        >
          {/* Booking ID */}
          <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-[#D96B43]">
            #{b.id}
          </td>

          {/* Guest Name */}
          <td className="px-6 py-4 font-medium text-slate-800 group-hover:text-[#D96B43]">
            {b.guestName}
          </td>

          {/* Room Number */}
          <td className="px-6 py-4 text-xs font-medium text-slate-700">
            {b.roomNumber}
          </td>

          {/* Room Type */}
          <td className="px-6 py-4 text-xs font-medium text-slate-700">
            <span className="px-2 py-1 bg-slate-100 rounded-md">
              {b.roomType}
            </span>
          </td>

          {/* Check-In */}
          <td className="px-6 py-4 text-slate-600">
            {b.checkInDate}
          </td>

          {/* Check-Out */}
          <td className="px-6 py-4 text-slate-600">
            {b.checkOutDate}
          </td>

          {/* Payment Status */}
          <td className="px-6 py-4">
            <span className="font-semibold text-slate-900 block">
              {formatCurrency(b.totalAmount)}
            </span>
            {remainingBalance > 0 ? (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                Due: {formatCurrency(remainingBalance)}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-medium inline-block mt-0.5">
                Fully Paid
              </span>
            )}
          </td>

          <td className="px-6 py-4">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                STATUS_BADGES[rawStatus] || 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {displayStatus}
            </span>
          </td>
          <td
            className="px-6 py-4 text-right cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {rawStatus === 'BOOKED' && (
              <button
                type="button"
                onClick={() => handleCheckIn(b)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                Check-In & Hand Key
              </button>
            )}
            {rawStatus === 'CHECKED_IN' && (
              <button
                type="button"
                onClick={() => handleCheckOutClick(b)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              >
                Checkout
              </button>
            )}
            {rawStatus === 'CHECKED_OUT' && (
              <span className="text-xs text-slate-400 font-medium">Completed</span>
            )}
          </td>
        </tr>
      );
    })
  )}
</tbody>
          </table>
        </div>
      </div>
      {showBookingForm && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookingForm(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <BookingForm
                onSuccess={() => {
                  fetchBookings();
                  setShowBookingForm(false);
                }}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedBookingId && (
  <BookingDetailsModal
    bookingId={selectedBookingId}
    onClose={() => setSelectedBookingId(null)}
    onUpdated={() => fetchBookings()}
  />
)}

      {/* Confirmation Modal for Zero-Balance Departures */}
      {confirmCheckoutModal.open && confirmCheckoutModal.booking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl shrink-0">
                <FiHelpCircle />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Confirm Guest Check-Out</h3>
                <p className="text-xs text-slate-500">Verify guest departure before releasing inventory</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Guest Name:</span>
                <span className="font-semibold text-slate-800">{confirmCheckoutModal.booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room Departing:</span>
                <span className="font-semibold text-slate-800">
                  Room {confirmCheckoutModal.booking.roomNumber} ({confirmCheckoutModal.booking.roomType})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Settled:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(confirmCheckoutModal.booking.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-semibold text-emerald-700">
                <span>Account Status:</span>
                <span className="flex items-center gap-1">
                  <FiCheckCircle className="text-emerald-600" /> Fully Paid (Zero Balance Due)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              Confirming this will mark Booking <strong>#{confirmCheckoutModal.booking.id}</strong> as{' '}
              <strong>CHECKED_OUT</strong> and return Room{' '}
              <strong>{confirmCheckoutModal.booking.roomNumber}</strong> to <strong>AVAILABLE</strong> status.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmCheckoutModal({ open: false, booking: null })}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDirectCheckout}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Checking Out...' : 'Confirm Check-Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}