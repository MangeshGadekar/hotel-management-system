import React, { useMemo } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { openReceiptByNumberPdfApi } from "../../apis/api";
import toast from "react-hot-toast";

export default function ReceiptPrintModal({ receipt, booking, onClose }) {
  if (!receipt) return null;

  const isAdvancePayment = (receipt.paymentType || "").includes("ADVANCE");
  const isRefund =
    receipt.paymentStatus === "REFUNDED" ||
    String(receipt.transactionReference || "").includes("REFUND") ||
    String(receipt.receiptNumber || "").startsWith("REF-");

  const handlePrintReceiptSlip = async () => {
    const toastId = toast.loading("Opening official receipt...");
    try {
      const receiptNum = receipt?.receiptNumber || receipt?.receiptNo;
      if (!receiptNum) {
        throw new Error("Receipt number not found on slip.");
      }
      await openReceiptByNumberPdfApi(receiptNum);
      toast.success("Receipt opened in new tab!", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Could not open receipt PDF.", { id: toastId });
    }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Number(amt) || 0);

  const formattedDate = receipt.transactionTime || receipt.paymentDate
    ? new Date(receipt.transactionTime || receipt.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "On File";

  
  const grossAmount = Number(receipt.grossAmount || receipt.amountPaid || receipt.amount || 0);
  const couponDiscount = Number(receipt.couponDeducted || 0);
  const deskDiscount = Number(receipt.discountDeducted || 0);
  const thisPaid = isRefund ? 0 : Number(receipt.amountPaid ?? receipt.amount ?? 0);
  const refundAmount = Number(receipt.amountPaid ?? receipt.amount ?? 0);
  const balanceRemaining = Number(receipt.balanceRemaining ?? 0);
  const currentReceiptNo = receipt.receiptNumber || `#${receipt.id}`;

  const displayDescription = useMemo(() => {
    if (isRefund) {
      return "Cancellation Refund Reversal (Full Settlement Reversal)";
    }
    if (isAdvancePayment) {
      return "Total Booking Amount (Room Tariff & Attached Services)";
    }
    if (receipt.settledItems && receipt.settledItems.trim() !== "") {
      return receipt.settledItems.split("|")[0].replace(/\s*\(₹[0-9,.]+\)/g, "").trim();
    }
    return "Room Stay & Services Settlement";
  }, [isRefund, isAdvancePayment, receipt.settledItems]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden border border-slate-200 flex flex-col relative font-sans">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-6 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Transaction Receipt Slip
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Printable Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white overflow-y-auto flex-1">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#D96B43] tracking-wide">
                HOTEL PARADISE &amp; SUITES
              </h2>
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold tracking-wider uppercase mt-1">
                {isRefund
                  ? "REFUND & CREDIT ADVICE"
                  : isAdvancePayment
                  ? "BOOKING DEPOSIT SLIP"
                  : "SETTLEMENT RECEIPT SLIP"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900 block">
                {currentReceiptNo}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Guest Name</span>
              <strong className="text-slate-800 text-sm">
                {booking?.guestName || `${booking?.guest?.firstName || ""} ${booking?.guest?.lastName || ""}`.trim() || "Guest"}
              </strong>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {booking?.guestEmail || booking?.guest?.email || "—"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Stay Reference</span>
              <span className="font-bold text-slate-800 block">Booking #{booking?.id || receipt.bookingId}</span>
              <span className="text-slate-500 block text-[11px]">
                Room {booking?.roomNumber || booking?.room?.roomNumber || "—"}
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">
                    {isRefund ? "Particulars" : isAdvancePayment ? "Booking Particulars" : "Items Settled in This Slip"}
                  </th>
                  <th className="px-4 py-2.5 text-right">Gross Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {displayDescription}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(grossAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>{isAdvancePayment ? "Total Booking Charges (Gross):" : "Gross Charge (This Slip):"}</span>
              <span className="font-mono font-semibold">{formatCurrency(grossAmount)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-blue-700 font-medium">
                <span>Less Coupon Discount:</span>
                <span className="font-mono font-bold">-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {deskDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Less Approved Concession / Discount:</span>
                <span className="font-mono font-bold">-{formatCurrency(deskDiscount)}</span>
              </div>
            )}

            {isRefund ? (
              <>
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Refund Credited to Source:</span>
                  <span className="font-mono font-bold">-{formatCurrency(refundAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5 text-sm">
                  <span>Paid in this Transaction:</span>
                  <span className="font-mono">{formatCurrency(0)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-1.5 text-sm">
                <span>{isAdvancePayment ? "Advance Deposit Paid:" : "Paid in this Transaction:"}</span>
                <span className="font-mono">{formatCurrency(thisPaid)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-black text-slate-900">
              <span>Remaining Balance After Slip:</span>
              <span className="font-mono text-slate-600">
                {formatCurrency(balanceRemaining)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
            {isRefund ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <FiCheckCircle className="text-rose-600" /> Refund Processed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FiCheckCircle className="text-emerald-600" /> Payment Received
              </span>
            )}
            <div className="text-right text-[11px] text-slate-500">
              <span>
                Payment Mode:{" "}
                <strong className="text-slate-700">
                  {(receipt.paymentMethod || "CASH").replace("_", " ")}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 print:hidden">
          <button
            type="button"
            onClick={handlePrintReceiptSlip}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
          >
            Print Receipt Slip
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}