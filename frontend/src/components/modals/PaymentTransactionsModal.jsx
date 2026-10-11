import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchPaymentsByBookingApi,
  fetchBooking,
  processPaymentApi,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
} from "../../apis/api";
import ReceiptPrintModal from "./ReceiptPrintModal";

const METHOD_BADGES = {
  RAZORPAY_ONLINE: "bg-purple-50 text-purple-700 border-purple-200",
  RAZORPAY: "bg-purple-50 text-purple-700 border-purple-200",
  CARD_MACHINE: "bg-blue-50 text-blue-700 border-blue-200",
  CASH: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function PaymentTransactionsModal({ bookingId, onClose, onPaymentSettled }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionReference, setTransactionReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, pData] = await Promise.all([
        fetchBooking(bookingId),
        fetchPaymentsByBookingApi(bookingId),
      ]);
      setBooking(bData);
      const history = Array.isArray(pData) ? pData : [];
      setPaymentHistory(history);
      if (bData && bData.balanceDue > 0) {
        setPayAmount(bData.balanceDue);
      } else {
        setPayAmount("");
      }
    } catch {
      toast.error("Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) loadData();
  }, [bookingId]);

  const totalBill = Number(booking?.totalAmount || 0);
  const totalPaid = paymentHistory.reduce((acc, p) => acc + Number(p.amountPaid || p.amount || 0), 0);
  const remainingDue = Number(booking?.balanceDue ?? Math.max(0, totalBill - totalPaid));

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (paymentMethod === "CARD_MACHINE" && !transactionReference.trim()) {
      toast.error("POS slip auth code required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentMethod === "RAZORPAY_ONLINE") {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const order = await createRazorpayOrderApi(bookingId, "SPLIT_BALANCE", token);
        const options = {
          key: order.keyId,
          amount: (order.amount || Number(payAmount)) * 100,
          currency: "INR",
          name: "Paradise Hotel",
          description: `Settlement for Booking #${bookingId}`,
          order_id: order.orderId,
          handler: async (resp) => {
            await verifyRazorpayPaymentApi(
              {
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature,
                bookingId: Number(bookingId),
                paymentType: "SPLIT_BALANCE",
              },
              token
            );
            toast.success("Online payment verified!");
            await loadData();
            if (onPaymentSettled) onPaymentSettled();
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      await processPaymentApi({
        bookingId: Number(bookingId),
        amount: Number(payAmount),
        paymentType: "SPLIT_BALANCE",
        paymentMethod: paymentMethod,
        transactionReference: paymentMethod === "CARD_MACHINE" ? transactionReference.trim().toUpperCase() : null,
      });

      toast.success("Payment recorded successfully!");
      setTransactionReference("");
      await loadData();
      if (onPaymentSettled) onPaymentSettled();
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPendingCharges = () => {
    if (!booking || remainingDue <= 0) return [];
    
    const allServices = booking?.selectedExtraServices || [];
    if (allServices.length === 0) return [];

    const getServiceTotal = (s) => {
      const base = Number(s.price || 0);
      const rate = Number(s.taxRate != null ? s.taxRate : 18);
      const tax = Math.round(base * (rate / 100));
      return base + tax;
    };

    const paidAmounts = paymentHistory.map((p) =>
      Math.round(Number(p.amountPaid || p.amount || 0))
    );

    let pool = allServices.map((s, idx) => ({
      ...s,
      _uid: s.id ? `${s.id}-${idx}` : `${idx}`,
      calculatedTotal: getServiceTotal(s),
    }));

  
    paidAmounts.forEach((paidAmt) => {
      const directMatchIdx = pool.findIndex(
        (item) => Math.abs(item.calculatedTotal - paidAmt) <= 2
      );
      if (directMatchIdx !== -1) {
        pool.splice(directMatchIdx, 1);
        return;
      }

      const findCombo = (arr, target) => {
        const n = arr.length;
        for (let size = 2; size <= Math.min(n, 4); size++) {
          const helper = (start, chosen, sum) => {
            if (chosen.length === size) {
              return Math.abs(sum - target) <= 5 ? chosen : null;
            }
            for (let i = start; i < n; i++) {
              const res = helper(i + 1, [...chosen, arr[i]], sum + arr[i].calculatedTotal);
              if (res) return res;
            }
            return null;
          };
          const match = helper(0, [], 0);
          if (match) return match;
        }
        return null;
      };

      const matchedCombo = findCombo(pool, paidAmt);
      if (matchedCombo) {
        const matchedUids = new Set(matchedCombo.map((m) => m._uid));
        pool = pool.filter((item) => !matchedUids.has(item._uid));
      }
    });

    const targetDue = Math.round(remainingDue);
    const exactDueMatch = pool.filter(
      (item) => Math.abs(item.calculatedTotal - targetDue) <= 5
    );

    if (exactDueMatch.length > 0) {
      return [exactDueMatch[0]];
    }

    return pool;
  };

  const pendingServices = getPendingCharges();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FiCreditCard className="text-[#D96B43]" /> BOOKING ID: {bookingId} - Payment Slips
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Guest: <strong>{booking?.guestName}</strong> • {paymentHistory.length} Transactions Recorded
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading payment ledger...</div>
          ) : (
            <>
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[11px] text-slate-500 block">Total Bill</span>
                  <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                    {formatCurrency(totalBill)}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                  <span className="text-[11px] text-emerald-700 block">
                    Total Paid ({paymentHistory.length} times)
                  </span>
                  <span className="text-base font-extrabold text-emerald-700 block mt-0.5">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div
                  className={`rounded-xl p-3.5 border ${
                    remainingDue > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className={`text-[11px] block ${remainingDue > 0 ? "text-amber-700" : "text-slate-500"}`}>
                    Remaining Due
                  </span>
                  <span
                    className={`text-base font-extrabold block mt-0.5 ${
                      remainingDue > 0 ? "text-amber-800" : "text-slate-700"
                    }`}
                  >
                    {formatCurrency(remainingDue)}
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  All Receipts & Timestamps (Click to Print Receipt)
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
                          <th className="px-4 py-2.5 text-right">Amount</th>
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
                              title="Click to print this specific receipt slip"
                            >
                              <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                                {p.receiptNumber || `#${p.id}`}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    METHOD_BADGES[p.paymentMethod] || "bg-slate-100"
                                  }`}
                                >
                                  {(p.paymentMethod || "CASH").replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">{dateDisplay}</td>
                           <td className="px-4 py-3 font-mono text-xs text-slate-600">
  {p.paymentMethod === "RAZORPAY_ONLINE" || p.paymentMethod === "RAZORPAY"
    ? (p.razorpayOrderId || p.razorpayPaymentId || p.transactionReference || "Razorpay Order")
    : (p.transactionReference || (p.paymentMethod === "CASH" ? "Cash Counter" : "—"))}
</td>
                              <td className="px-4 py-2.5 font-bold text-slate-900 text-right">
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

              {/* Outstanding Balance Settlement */}
              {remainingDue > 0 ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                      Collect Balance Due ({formatCurrency(remainingDue)})
                    </h4>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                      Pending
                    </span>
                  </div>

                  {/* Itemized Folio Breakdown - Pending Unsettled Items Only */}
                  <div className="bg-white rounded-lg border border-amber-200/60 p-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                      <span>Pending Charge Details</span>
                      <span>Total (incl. GST)</span>
                    </div>

                    <div className="divide-y divide-slate-50 space-y-1">
                      {pendingServices.length > 0 ? (
                        pendingServices.map((srv, idx) => {
                          const base = Number(srv.price || 0);
                          const rate = Number(srv.taxRate || 18);
                          const tax = Math.round(base * (rate / 100));
                          const total = base + tax;

                          return (
                            <div key={srv.id || idx} className="flex justify-between items-center pt-1 text-xs">
                              <div>
                                <span className="font-semibold text-slate-800">{srv.name}</span>
                                <span className="text-[11px] text-slate-400 block">
                                  Base: ₹{base.toLocaleString("en-IN")} • GST: {rate}% (+₹{tax.toLocaleString("en-IN")})
                                </span>
                              </div>
                              <span className="font-mono font-bold text-amber-900">
                                ₹{total.toLocaleString("en-IN")}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex justify-between items-center pt-1 text-xs text-slate-700">
                          <span>Pending Room Tariff Balance</span>
                          <span className="font-mono font-bold text-amber-900">
                            {formatCurrency(remainingDue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSettle} className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
    Amount to Collect
  </label>
  <input
    type="text"
    readOnly
    value={`₹${Number(payAmount || 0).toLocaleString("en-IN")}`}
    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-700 font-bold cursor-not-allowed select-none focus:outline-none"
    title="Amount is calculated automatically and cannot be modified."
  />
</div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
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
                        placeholder="POS Auth Reference Slip #"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg font-mono uppercase bg-white text-xs"
                      />
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                      >
                        {isSubmitting ? "Processing..." : `Record ${formatCurrency(payAmount || remainingDue)} Payment`}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600 text-base" />
                  <span>This booking is <strong>fully settled</strong>. All payments are complete.</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Individual Slip Print Popup */}
      {selectedReceipt && (
        <ReceiptPrintModal
          receipt={selectedReceipt}
          booking={booking}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}