import { useState, useEffect, useMemo, useCallback } from "react";
import usePaymentStore from "../../app/usePaymentStore";
import PaymentsForm from "../../components/forms/PaymentsForm";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiTag,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import PaymentTransactionsModal from "../../components/modals/PaymentTransactionsModal";
import { fetchAllBooking } from "../../apis/api";

const METHOD_BADGES = {
  RAZORPAY_ONLINE: "bg-purple-50 text-purple-700 border-purple-200",
  RAZORPAY: "bg-purple-50 text-purple-700 border-purple-200",
  CARD_MACHINE: "bg-blue-50 text-blue-700 border-blue-200",
  CASH: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showManualFormModal, setShowManualFormModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingsList, setBookingsList] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Reset to page 1 whenever search query or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

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

  const groupedBookings = useMemo(() => {
    const map = {};

    const bookingLookup = {};
    (bookingsList || []).forEach((b) => {
      bookingLookup[b.id] = b;
    });

    (payments || []).forEach((p) => {
      const bId = p.bookingId || p.booking?.id;
      if (!bId) return;

      const bk = bookingLookup[bId];

      const guestName =
        bk?.guestName ||
        (bk?.guest
          ? `${bk.guest.firstName || ""} ${bk.guest.lastName || ""}`.trim()
          : p.guestName || "Guest");

      const grossBill = Number(
        bk?.grossTotal ??
          (Number(bk?.taxableAmount || 0) + Number(bk?.taxAmount || 0))
      );
      const concessions = Number(
        bk?.totalConcessions ?? bk?.discountAmount ?? 0
      );
      const remainingDue =
        bk?.remainingDue != null
          ? Number(bk.remainingDue)
          : Number(bk?.balanceDue ?? 0);
      const isSettled =
        bk?.fullySettled != null ? bk.fullySettled : remainingDue <= 0;

      const isCancelled =
        bk?.bookingStatus === "CANCELLED" ||
        bk?.status === "CANCELLED" ||
        p.paymentStatus === "REFUNDED";

      if (!map[bId]) {
        map[bId] = {
          bookingId: bId,
          guestName: guestName,
          latestReceipt: p.receiptNumber || `#${p.id}`,
          totalPaid: 0,
          grossBill: grossBill,
          totalConcessions: concessions,
          remainingDue: remainingDue,
          isSettled: isSettled,
          isCancelled: isCancelled,
          slipsCount: 0,
          latestDate: p.paymentDate,
        };
      }

      map[bId].totalPaid += Number(p.amount || p.amountPaid || 0);
      map[bId].slipsCount += 1;

      if (grossBill > 0) map[bId].grossBill = grossBill;
      if (concessions > 0) map[bId].totalConcessions = concessions;
      if (bk) {
        map[bId].remainingDue = remainingDue;
        map[bId].isSettled = isSettled;
        map[bId].isCancelled = isCancelled;
      }

      if (p.paymentDate) {
        map[bId].latestDate = p.paymentDate;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        settlementStatus: item.isCancelled
          ? "REFUNDED"
          : item.isSettled
          ? "PAID"
          : "PENDING",
      }))
      .sort((a, b) => Number(b.bookingId) - Number(a.bookingId));
  }, [payments, bookingsList]);

  const filteredList = useMemo(() => {
    return groupedBookings.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        String(item.bookingId).toLowerCase().includes(q) ||
        String(item.latestReceipt).toLowerCase().includes(q) ||
        (item.guestName || "").toLowerCase().includes(q)
      );
    });
  }, [groupedBookings, searchQuery]);

  // Pagination calculations
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safeCurrentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (safeCurrentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        safeCurrentPage - 1,
        safeCurrentPage,
        safeCurrentPage + 1,
        "...",
        totalPages
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Payments & Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect receipts, discounts, and settle individual extra services
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              placeholder="Search Booking #, Guest, Receipt..."
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
                <th className="px-6 py-3">Guest Particulars</th>
                <th className="px-6 py-3">Latest Receipt</th>
                <th className="px-6 py-3">Receipts Count</th>
                <th className="px-6 py-3">Total Paid</th>
                <th className="px-6 py-3">Concession / Discount</th>
                <th className="px-6 py-3">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading payments…
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr
                    key={item.bookingId}
                    onClick={() => setSelectedBookingId(item.bookingId)}
                    className="hover:bg-orange-50/40 transition cursor-pointer group"
                    title="Click to view all receipts, attached services & settle balance"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-[#D96B43]">
                      #{item.bookingId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 text-xs block">
                        {item.guestName || "Guest"}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Total Bill: {formatCurrency(item.grossBill)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {item.latestReceipt}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {item.slipsCount} {item.slipsCount === 1 ? "Receipt" : "Receipts"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(item.totalPaid)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-600">
                      {item.totalConcessions > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <FiTag size={11} /> -{formatCurrency(item.totalConcessions)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.isCancelled || item.settlementStatus === "REFUNDED" ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Refunded
                        </span>
                      ) : item.settlementStatus === "PAID" ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid Fully
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Pending ({formatCurrency(item.remainingDue)})
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingId(item.bookingId);
                            }}
                            className="px-2.5 py-1 bg-[#D96B43] hover:bg-[#c95a34] text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <FiCreditCard size={12} /> Settle / Discount
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalItems > 0 && (
          <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                Showing{" "}
                <strong className="text-slate-700">{startIndex + 1}</strong>–
                <strong className="text-slate-700">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </strong>{" "}
                of <strong className="text-slate-700">{totalItems}</strong>{" "}
                transactions
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-slate-200 rounded-md bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B43] cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                aria-label="Previous page"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-xs text-slate-400 select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[30px] px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      safeCurrentPage === page
                        ? "bg-[#D96B43] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                aria-label="Next page"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedBookingId && (
        <PaymentTransactionsModal
          bookingId={selectedBookingId}
          onClose={() => {
            setSelectedBookingId(null);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }}
          onPaymentSettled={() => {
            fetchData();
          }}
        />
      )}

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