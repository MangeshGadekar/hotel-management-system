import { useState, useEffect, useMemo, useCallback } from "react";
import usePaymentStore from "../../app/usePaymentStore";
import PaymentsForm from "../../components/forms/PaymentsForm";
import { FiSearch, FiRefreshCw, FiPlus } from "react-icons/fi";
import PaymentTransactionsModal from "../../components/modals/PaymentTransactionsModal";
import { fetchAllBooking } from "../../apis/api";

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showManualFormModal, setShowManualFormModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingsList, setBookingsList] = useState([]);

  const payments = usePaymentStore((state) => state.payments);
  const loading = usePaymentStore((state) => state.loading);
  const getAllPayments = usePaymentStore((state) => state.getAllPayments);

  const fetchData = useCallback(async () => {
    getAllPayments();
    try {
      const bks = await fetchAllBooking();
      setBookingsList(Array.isArray(bks) ? bks : []);
    } catch (e) {
      console.warn("Failed to load booking list in payments:", e);
    }
  }, [getAllPayments]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal if URL has ?bookingId=XX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bkId = params.get("bookingId");
    if (bkId) {
      setSelectedBookingId(bkId);
    }
  }, []);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  // Group all individual payment slips by Booking ID and correlate with the true Booking record
  const groupedBookings = useMemo(() => {
    const map = {};

    // Create lookup map for bookings so we have accurate totalAmount & balanceDue
    const bookingLookup = {};
    (bookingsList || []).forEach((b) => {
      bookingLookup[b.id] = b;
    });

    (payments || []).forEach((p) => {
      const bId = p.bookingId || p.booking?.id;
      if (!bId) return;

      const bk = bookingLookup[bId];
      const realTotal = bk ? Number(bk.totalAmount || 0) : Number(p.bookingTotal || 0);
      const realBalance = bk ? Number(bk.balanceDue || 0) : Number(p.balanceDue || 0);

      if (!map[bId]) {
        map[bId] = {
          bookingId: bId,
          latestReceipt: p.receiptNumber || `#${p.id}`,
          totalPaid: 0,
          totalBill: realTotal,
          balanceDue: realBalance,
          slipsCount: 0,
          latestDate: p.paymentDate,
        };
      }

      map[bId].totalPaid += Number(p.amount || p.amountPaid || 0);
      map[bId].slipsCount += 1;

      if (realTotal > 0) map[bId].totalBill = realTotal;
      if (bk) map[bId].balanceDue = realBalance;

      if (p.paymentDate) {
        map[bId].latestDate = p.paymentDate;
      }
    });

    return Object.values(map)
      .map((item) => {
        // True settlement condition:
        const remainingDue =
          item.balanceDue > 0
            ? item.balanceDue
            : Math.max(0, item.totalBill - item.totalPaid);

        const isPending = remainingDue > 1;

        return {
          ...item,
          settlementStatus: isPending ? "PENDING" : "PAID",
          remainingDue: remainingDue,
        };
      })
      .sort((a, b) => Number(b.bookingId) - Number(a.bookingId));
  }, [payments, bookingsList]);

  // Search filter definition
  const filteredList = useMemo(() => {
    return groupedBookings.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        String(item.bookingId).toLowerCase().includes(q) ||
        String(item.latestReceipt).toLowerCase().includes(q)
      );
    });
  }, [groupedBookings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payments & Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any row to inspect all receipts, extra services, and settle balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualFormModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FiPlus /> Record Transaction
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh transactions"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          </button>
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Booking # or Receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43] w-full sm:w-72"
            />
          </div>
        </div>
      </div>

      {/* Streamlined Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Latest Receipt</th>
                <th className="px-6 py-3">Payments Made</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Paid</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Loading payments…
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const dateStr = item.latestDate
                    ? new Date(item.latestDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={item.bookingId}
                      onClick={() => setSelectedBookingId(item.bookingId)}
                      className="hover:bg-orange-50/40 transition cursor-pointer group"
                      title="Click to view all receipts, attached services & settle balance"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-[#D96B43]">
                        #{item.bookingId}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {item.latestReceipt}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.slipsCount} {item.slipsCount === 1 ? "Receipt" : "Receipts"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(item.totalPaid)}
                      </td>
                      <td className="px-6 py-4">
                        {item.settlementStatus === "PAID" ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Pending {item.remainingDue > 0 && `(${formatCurrency(item.remainingDue)})`}
                          </span>
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

      {selectedBookingId && (
        <PaymentTransactionsModal
          bookingId={selectedBookingId}
          onClose={() => {
            setSelectedBookingId(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
          onPaymentSettled={() => {
            fetchData();
          }}
        />
      )}

      {/* Manual Counter Payment Slip Entry */}
      {showManualFormModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowManualFormModal(false);
          }}
        >
          <PaymentsForm
            onSuccess={() => {
              setShowManualFormModal(false);
              fetchData();
            }}
            onCancel={() => setShowManualFormModal(false)}
          />
        </div>
      )}
    </div>
  );
}