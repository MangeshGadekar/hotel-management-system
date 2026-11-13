import React, { useState, useEffect, useMemo } from "react";
import {
  FiX,
  FiCheckCircle,
  FiCreditCard,
  FiCheckSquare,
  FiSquare,
  FiHome,
  FiTag,
} from "react-icons/fi";
import { FaCheckDouble } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  fetchPaymentsByBookingApi,
  fetchBooking,
  settlePartialPaymentApi,
  fetchBookingDiscountsApi,
} from "../../apis/api";
import ReceiptPrintModal from "./ReceiptPrintModal";

const METHOD_BADGES = {
  RAZORPAY_ONLINE: "bg-purple-50 text-purple-700 border-purple-200",
  RAZORPAY: "bg-purple-50 text-purple-700 border-purple-200",
  CARD_MACHINE: "bg-blue-50 text-blue-700 border-blue-200",
  CASH: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function PaymentTransactionsModal({
  bookingId,
  onClose,
  onPaymentSettled,
}) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [discountsList, setDiscountsList] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [includeRoomBalance, setIncludeRoomBalance] = useState(true);
  const [selectedServiceUids, setSelectedServiceUids] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionReference, setTransactionReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settlementDiscount, setSettlementDiscount] = useState("");
  const [settlementDiscountReason, setSettlementDiscountReason] = useState("");
  const isCancelled = booking?.bookingStatus === "CANCELLED" || booking?.status === "CANCELLED";

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, pData, dData] = await Promise.all([
        fetchBooking(bookingId),
        fetchPaymentsByBookingApi(bookingId),
        fetchBookingDiscountsApi(bookingId).catch(() => []),
      ]);
      setBooking(bData);
      setPaymentHistory(Array.isArray(pData) ? pData : []);
      setDiscountsList(Array.isArray(dData) ? dData : []);
    } catch {
      toast.error("Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) loadData();
  }, [bookingId]);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  const grossTotalBill = Number(
    booking?.grossTotal ??
      Number(booking?.taxableAmount || 0) + Number(booking?.taxAmount || 0)
  );

  const totalConcessions = Number(
    booking?.totalConcessions ??
      discountsList.reduce((acc, d) => acc + Number(d.calculatedAmount || 0), 0) ??
      booking?.discountAmount ??
      0
  );

  const paymentsSum = paymentHistory
    .filter((p) => p.paymentMethod !== "CONCESSION")
    .reduce((acc, p) => acc + Number(p.amountPaid || p.amount || 0), 0);

  const totalPaid = Number(booking?.totalPaid ?? paymentsSum);

  const remainingDue = Number(
    booking?.remainingDue ?? booking?.balanceDue ?? 0
  );

  const isFullySettled =
    booking?.fullySettled != null ? booking.fullySettled : remainingDue <= 0;

  const pendingServices = useMemo(() => {
    if (!booking) return [];
    const allServices = booking?.selectedExtraServices || [];
    if (allServices.length === 0) return [];

    const getServiceTotal = (s) => {
      const base = Number(s.price || 0);
      const rate = Number(s.taxRate != null ? s.taxRate : 18);
      const tax = Math.round(base * (rate / 100));
      return base + tax;
    };

    return allServices
      .filter((s) => s.paid !== true)
      .map((s, idx) => ({
        ...s,
        _uid: s.id ? `${s.id}-${idx}` : `${idx}`,
        rawId: s.id,
        calculatedTotal: getServiceTotal(s),
        basePrice: Number(s.price || 0),
        gstRate: Number(s.taxRate != null ? s.taxRate : 18),
        gstAmount: Math.round(
          Number(s.price || 0) * (Number(s.taxRate != null ? s.taxRate : 18) / 100)
        ),
      }));
  }, [booking]);

  const unpaidServicesSum = useMemo(() => {
    return pendingServices.reduce((acc, s) => acc + s.calculatedTotal, 0);
  }, [pendingServices]);

  const pendingRoomBalance = useMemo(() => {
    if (remainingDue <= 0) return 0;
    const roomRem = remainingDue - unpaidServicesSum;
    return Math.max(0, Math.round(roomRem));
  }, [remainingDue, unpaidServicesSum]);

  useEffect(() => {
    if (pendingServices.length > 0) {
      setSelectedServiceUids(pendingServices.map((s) => s._uid));
    } else {
      setSelectedServiceUids([]);
    }
    setIncludeRoomBalance(pendingRoomBalance > 0);
  }, [pendingServices, pendingRoomBalance]);

  const payableAmount = useMemo(() => {
    let sum = 0;
    if (includeRoomBalance && pendingRoomBalance > 0) {
      sum += pendingRoomBalance;
    }
    pendingServices.forEach((s) => {
      if (selectedServiceUids.includes(s._uid)) {
        sum += s.calculatedTotal;
      }
    });
    return sum;
  }, [includeRoomBalance, pendingRoomBalance, selectedServiceUids, pendingServices]);

  const netCashToCollect = useMemo(() => {
    const disc = parseFloat(settlementDiscount) || 0;
    return Math.max(0, payableAmount - disc);
  }, [payableAmount, settlementDiscount]);

  const toggleServiceCheckbox = (uid) => {
    setSelectedServiceUids((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = () => {
    setIncludeRoomBalance(pendingRoomBalance > 0);
    setSelectedServiceUids(pendingServices.map((s) => s._uid));
  };

  const handleClearSelection = () => {
    setIncludeRoomBalance(false);
    setSelectedServiceUids([]);
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    const disc = parseFloat(settlementDiscount) || 0;
    const netCash = Math.max(0, payableAmount - disc);

    if (payableAmount <= 0) {
      toast.error("Please select at least one charge to settle.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedIds = pendingServices
        .filter((s) => selectedServiceUids.includes(s._uid) && s.rawId)
        .map((s) => s.rawId);

      await settlePartialPaymentApi(bookingId, {
        amount: netCash,
        paymentMethod: paymentMethod,
        transactionReference:
          paymentMethod === "CARD_MACHINE" ? transactionReference : null,
        serviceIds: selectedIds,
        discountAmount: disc,
        discountReason: settlementDiscountReason || "Desk Concession",
      });

      toast.success("Payment recorded!");
      setSettlementDiscount("");
      setSettlementDiscountReason("");
      setTransactionReference("");
      await loadData();
      if (onPaymentSettled) onPaymentSettled();
    } catch (err) {
      toast.error(err.message || "Failed to process settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FiCreditCard className="text-[#D96B43]" /> BOOKING ID: #{bookingId} Payment Slips
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Guest: <strong>{booking?.guestName || "Guest"}</strong> . {" "}
              {paymentHistory.length}{" "}
              {paymentHistory.length === 1 ? "Transaction Recorded" : "Transactions Recorded"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading payment ledger...</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Total Bill
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5 font-mono">
                    {formatCurrency(grossTotalBill)}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[10px] text-emerald-700 block uppercase font-bold">
                    Total Concessions
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700 block mt-0.5 font-mono">
                    -{formatCurrency(totalConcessions)}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <span className="text-[10px] text-blue-700 block uppercase font-bold">
                    Total Paid
                  </span>
                  <span className="text-sm font-extrabold text-blue-700 block mt-0.5 font-mono">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div
                  className={`rounded-xl p-3 border ${
                    !isFullySettled && remainingDue > 0
                      ? "bg-amber-50 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[10px] block uppercase font-bold ${
                      !isFullySettled && remainingDue > 0
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
                    Remaining Due
                  </span>
                  <span
                    className={`text-sm font-extrabold block mt-0.5 font-mono ${
                      !isFullySettled && remainingDue > 0
                        ? "text-amber-800"
                        : "text-slate-700"
                    }`}
                  >
                    {isFullySettled ? formatCurrency(0) : formatCurrency(remainingDue)}
                  </span>
                </div>
              </div>

              {/* Transactions History Table */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Completed Slips (Click to View Frozen Receipt)
                </h4>
                {paymentHistory.length === 0 ? (
                  <p className="text-slate-400 py-4 bg-slate-50 text-center rounded-lg">
                    No payments recorded yet.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Receipt #</th>
                          <th className="px-4 py-2.5">Method</th>
                          <th className="px-4 py-2.5">Date & Exact Time</th>
                          <th className="px-4 py-2.5">Slip Ref / Txn</th>
                          <th className="px-4 py-2.5 text-right">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentHistory.map((p) => {
                          const dateObj = p.paymentDate ? new Date(p.paymentDate) : null;
                          const dateDisplay = dateObj
                            ? `${dateObj.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })} at ${dateObj.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "—";

                          return (
                            <tr
                              key={p.receiptNumber || p.id}
                              onClick={() => setSelectedReceipt(p)}
                              className="hover:bg-orange-50/60 cursor-pointer transition"
                            >
                              <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                                {p.receiptNumber || `#${p.id}`}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    METHOD_BADGES[p.paymentMethod] ||
                                    "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {(p.paymentMethod || "CASH").replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                                {dateDisplay}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                                {p.transactionReference || "Counter"}
                              </td>
                              <td className="px-4 py-2.5 font-bold text-right text-slate-900 font-mono">
                                {formatCurrency(p.amountPaid || p.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Settlement Section */}
              {!isFullySettled && (remainingDue > 0 || pendingServices.length > 0) ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                        Select Charges to Settle
                      </h4>
                      <p className="text-[11px] text-amber-700">Choose items to pay now</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-md text-[11px] font-bold text-amber-900 hover:bg-amber-100/50 transition cursor-pointer"
                      >
                        <FaCheckDouble size={10} className="text-[#D96B43]" /> Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-white rounded-lg border border-amber-200/60 p-3 space-y-2">
                    {pendingRoomBalance > 0 && (
                      <div
                        onClick={() => setIncludeRoomBalance(!includeRoomBalance)}
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition ${
                          includeRoomBalance
                            ? "bg-orange-50/60 border border-orange-200"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {includeRoomBalance ? (
                            <FiCheckSquare className="text-[#D96B43] text-base" />
                          ) : (
                            <FiSquare className="text-slate-300 text-base" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <FiHome className="text-[#D96B43]" /> Remaining Room Tariff
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Room {booking?.room?.roomNumber || booking?.roomNumber}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-900 text-sm">
                          ₹{pendingRoomBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    {pendingServices.map((srv) => {
                      const isChecked = selectedServiceUids.includes(srv._uid);
                      return (
                        <div
                          key={srv._uid}
                          onClick={() => toggleServiceCheckbox(srv._uid)}
                          className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition ${
                            isChecked
                              ? "bg-orange-50/60 border border-orange-200"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isChecked ? (
                              <FiCheckSquare className="text-[#D96B43] text-base" />
                            ) : (
                              <FiSquare className="text-slate-300 text-base" />
                            )}
                            <div>
                              <span className="font-semibold text-slate-800">{srv.name}</span>
                              <span className="text-[11px] text-slate-400 block">
                                Base: ₹{srv.basePrice} | GST: {srv.gstRate}% (+₹{srv.gstAmount})
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-amber-900 text-sm">
                            ₹{srv.calculatedTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Concession on transaction */}
                  <div className="bg-white border border-amber-200 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <FiTag className="text-[#D96B43]" /> Concession on THIS Payment
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Applied strictly to this settlement slip
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={payableAmount}
                          placeholder="e.g. 200"
                          value={settlementDiscount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            if (val > payableAmount) {
                              toast.error(
                                `Discount cannot exceed settlement amount (₹${payableAmount})`
                              );
                              setSettlementDiscount(String(payableAmount));
                            } else {
                              setSettlementDiscount(e.target.value);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-[#D96B43]"
                        />
                        <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Reason (Optional)"
                        value={settlementDiscountReason}
                        onChange={(e) => setSettlementDiscountReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#D96B43]"
                      />
                    </div>
                  </div>

                  {/* Settle Action Form */}
                  <form onSubmit={handleSettle} className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Cash / Payment to Collect
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formatCurrency(netCashToCollect)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-900 font-extrabold cursor-not-allowed select-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs outline-none"
                        >
                          <option value="CASH">Cash (Desk)</option>
                          <option value="CARD_MACHINE">Card Machine (POS)</option>
                          <option value="RAZORPAY_ONLINE">Razorpay (UPI / Card)</option>
                        </select>
                      </div>
                    </div>

                    {paymentMethod === "CARD_MACHINE" && (
                      <input
                        type="text"
                        required
                        placeholder="POS Auth Slip #"
                        value={transactionReference}
                        onChange={(e) =>
                          setTransactionReference(e.target.value.toUpperCase())
                        }
                        className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg font-mono uppercase bg-white text-xs"
                      />
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
                      <span className="text-[11px] text-slate-500">
                        {settlementDiscount > 0
                          ? `₹${settlementDiscount} concession included on this slip.`
                          : "No concession on this slip."}
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting || payableAmount <= 0}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Processing..."
                          : `Record ${formatCurrency(netCashToCollect)} Payment`}
                      </button>
                    </div>
                  </form>
                </div>
              ) : isCancelled ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <FiCheckCircle className="text-rose-600 text-base" />
                  <span>
                    This reservation has been <strong>cancelled</strong> and payments have been <strong>refunded</strong>.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600 text-base" />
                  <span>
                    This booking is <strong>fully settled</strong>. All payments are complete.
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {selectedReceipt && (
        <ReceiptPrintModal
          receipt={selectedReceipt}
          booking={booking}
          discountsList={discountsList}
          paymentHistory={paymentHistory}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}