import { useState, useEffect, useCallback } from 'react';
import BookingForm from '../../components/forms/BookingForm';
import useBookingStore from '../../app/useBookingStore';

const STATUS_BADGES = {
  BOOKED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'CHECKED-IN': 'bg-blue-50 text-blue-700 border-blue-200',
  'CHECKED-OUT': 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

// API status -> display label
const STATUS_MAP = {
  BOOKED: 'Confirmed',
  'CHECKED-IN': 'Checked-In',
  'CHECKED-OUT': 'Checked-Out',
  CANCELLED: 'Cancelled',
};

// Display label -> API status (derived so it can never drift)
const REVERSE_STATUS_MAP = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([api, display]) => [display, api])
);

// Single source of truth for the dropdown options
const STATUS_OPTIONS = Object.values(STATUS_MAP);

export default function Bookings() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBookingList = useBookingStore((state) => state.getAllBooking);
  const updateBookingStatus = useBookingStore((state) => state.updateBooking);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const bookings = await getBookingList();
      setAllBookings(Array.isArray(bookings) ? bookings : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  }, [getBookingList]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Close modal on Escape
  useEffect(() => {
    if (!showBookingForm) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowBookingForm(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showBookingForm]);

  const handleStatusChange = async (bookingId, newDisplayStatus) => {
    // 1. Validate the requested status
    const apiStatus = REVERSE_STATUS_MAP[newDisplayStatus];
    if (!apiStatus) {
      setError(`Invalid status: ${newDisplayStatus}`);
      return;
    }

    // 2. Make sure the booking actually exists in local state
    const existing = allBookings.find((b) => b.id === bookingId);
    if (!existing) {
      setError(`Booking #${bookingId} not found.`);
      return;
    }

    // 3. Skip no-op updates
    if (existing.bookingStatus === apiStatus) return;

    try {
      const result = await updateBookingStatus(bookingId, apiStatus);

      // 4. Treat falsy / unsuccessful / 404 responses as failures
      const failed =
        !result ||
        result.success === false ||
        result.status === 404 ||
        result.error;

      if (failed) {
        setError(
          result?.message ||
            `Booking #${bookingId} not found. Status was not updated.`
        );
        return; // do NOT touch local state
      }

      // 5. Only update local state after confirmed success
      setAllBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, bookingStatus: apiStatus } : b
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update booking status. Please try again.');
    }
  };

  const filteredBookings = allBookings.filter((b) => {
    const displayStatus = STATUS_MAP[b.bookingStatus] || b.bookingStatus;
    const matchesStatus =
      filterStatus === 'All' || displayStatus === filterStatus;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(b.guestName ?? '').toLowerCase().includes(q) ||
      String(b.id ?? '').toLowerCase().includes(q) ||
      String(b.roomNumber ?? '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 font-semibold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Booking Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, update, and manage all guest reservations
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBookingForm(true)}
            className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold hover:bg-[#c95a34] transition"
          >
            Add Booking
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
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading bookings…
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const displayStatus =
                    STATUS_MAP[b.bookingStatus] || b.bookingStatus;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        #{b.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {b.guestName}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {b.roomNumber}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          {b.roomType}
                        </span>
                      </td>
                      <td className="px-6 py-4">{b.checkInDate}</td>
                      <td className="px-6 py-4">{b.checkOutDate}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            STATUS_BADGES[b.bookingStatus] ||
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={displayStatus}
                          onChange={(e) =>
                            handleStatusChange(b.id, e.target.value)
                          }
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Screen Booking Form Modal */}
      {showBookingForm && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookingForm(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <BookingForm
                isFullScreen={true}
                onSuccess={() => {
                  fetchBookings();
                  setShowBookingForm(false);
                }}
                onCancel={() => setShowBookingForm(false)}
                showSummary={true}
                submitButtonText="Create Booking"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}