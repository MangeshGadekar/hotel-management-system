import { useState, useEffect } from 'react';
import BookingForm from '../../components/forms/BookingForm';
import useBookingStore from '../../app/useBookingStore';

const STATUS_BADGES = {
  BOOKED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'CHECKED-IN': 'bg-blue-50 text-blue-700 border-blue-200',
  'CHECKED-OUT': 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

// Map your API status to display status
const STATUS_MAP = {
  BOOKED: 'Confirmed',
  'CHECKED-IN': 'Checked-In',
  'CHECKED-OUT': 'Checked-Out',
  CANCELLED: 'Cancelled',
};

// Reverse map for updating status
const REVERSE_STATUS_MAP = {
  'Confirmed': 'BOOKED',
  'Checked-In': 'CHECKED-IN',
  'Checked-Out': 'CHECKED-OUT',
  'Cancelled': 'CANCELLED',
};

export default function Bookings() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [error, setError] = useState(null);

  const getBookingList = useBookingStore((state) => state.getAllBooking);
  const updateBookingStatus = useBookingStore((state) => state.updateBooking);

  console.log("allBookings", allBookings);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await getBookingList();
        console.log(bookings);
        setAllBookings(bookings);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again.");
      }
    };
    fetchBookings();
  }, [getBookingList]);

  const handleStatusChange = async (bookingId, newDisplayStatus) => {
    try {
      // Convert display status to API status
      const apiStatus = REVERSE_STATUS_MAP[newDisplayStatus];
      await updateBookingStatus(bookingId, apiStatus);
      
      // Update local state to reflect the change
      setAllBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, bookingStatus: apiStatus }
            : booking
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update booking status. Please try again.");
    }
  };

  const refreshBookings = async () => {
    try {
      const bookings = await getBookingList();
      setAllBookings(bookings);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    }
  };

  const filteredBookings = allBookings.filter((b) => {
    const displayStatus = STATUS_MAP[b.bookingStatus] || b.bookingStatus;
    const matchesStatus = filterStatus === 'All' || displayStatus === filterStatus;
    const matchesSearch =
      b.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id?.toString().includes(searchQuery.toLowerCase()) ||
      b.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Booking Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track, update, and manage all guest reservations</p>
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
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const displayStatus = STATUS_MAP[b.bookingStatus] || b.bookingStatus;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">#{b.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{b.guestName}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{b.roomNumber}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          {b.roomType}
                        </span>
                      </td>
                      <td className="px-6 py-4">{b.checkInDate}</td>
                      <td className="px-6 py-4">{b.checkOutDate}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{b.totalAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_BADGES[b.bookingStatus] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={displayStatus}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked-In">Checked-In</option>
                          <option value="Checked-Out">Checked-Out</option>
                          <option value="Cancelled">Cancelled</option>
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

      {/* Full Screen Booking Form Modal with Scroll */}
      {showBookingForm && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBookingForm(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <BookingForm 
                isFullScreen={true}
                onSuccess={() => {
                  refreshBookings();
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