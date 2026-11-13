import React from "react";
import { FiX, FiPrinter, FiCheckCircle } from "react-icons/fi";
import { downloadMasterFolioReceiptApi } from "../../apis/api";
import toast from "react-hot-toast";

export default function MasterFolioModal({ booking, payments = [], onClose }) {
  const handlePrintMasterReceipt = async () => {
    const toastId = toast.loading("Generating Master Folio PDF...");
    try {
      await downloadMasterFolioReceiptApi(booking.id);
      toast.success("Master Folio downloaded!", { id: toastId });
    } catch {
      toast.error("Could not download Master Folio PDF.", { id: toastId });
    }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
        (1000 * 60 * 60 * 24)
    ) || 1
  );

  const roomCharges = Number(booking.roomCharges || 0);
  const roomTax = Math.round(roomCharges * 0.18);
  const roomTotal = roomCharges + roomTax;

  const servicesList = booking.selectedExtraServices || [];
  const servicesBase = servicesList.reduce(
    (acc, s) => acc + Number(s.price || 0),
    0
  );

  const subtotalBase = roomCharges + servicesBase;
  const initialGst = Number(booking.taxAmount || 0);

  const grossInvoiceTotal = Number(
    booking.grossTotal ?? subtotalBase + initialGst
  );
  const couponDiscount = Number(booking.couponDiscount || 0);
  const deskConcession = Number(booking.deskConcession || 0);
  const totalConcessions = Number(
    booking.totalConcessions ?? (booking.discountAmount || 0)
  );

  const netInvoiceTotal = Number(
    booking.netPayable ?? booking.totalAmount ?? 0
  );

  const paymentsSum = (payments || []).reduce(
    (acc, p) => acc + Number(p.amountPaid ?? p.amount ?? p.paidAmount ?? 0),
    0
  );
  const totalPaid =
    booking.totalPaid != null
      ? Number(booking.totalPaid)
      : paymentsSum > 0
      ? paymentsSum
      : Number(booking.advancePayment || 0);

  const remainingDue =
    booking.remainingDue != null
      ? Number(booking.remainingDue)
      : Number(booking.balanceDue || 0);

  const isSettled =
    booking.fullySettled != null ? booking.fullySettled : remainingDue <= 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Controls */}
        <div className="flex justify-between items-center px-6 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Official Receipt & Tax Invoice
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        <div
          id="master-folio-document"
          className="p-8 space-y-6 text-slate-800 bg-white overflow-y-auto"
        >
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-black text-[#D96B43] tracking-wide">
                HOTEL ATHENURA
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Station Road, Civil Lines, Nagpur, MH 440001
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-mono font-bold text-xs rounded-md border border-slate-200">
                BOOKING ID: #{booking.id}
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Date:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-[11px] text-slate-500">
                Status:{" "}
                <strong className="text-slate-800 uppercase">
                  {booking.bookingStatus}
                </strong>
              </p>
            </div>
          </div>

          {/* Guest & Reservation Header */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Guest Information
              </span>
              <p className="text-sm font-bold text-slate-800">
                {booking.guestName ||
                  `${booking.guest?.firstName || ""} ${booking.guest?.lastName || ""}`.trim()}
              </p>
              <p className="text-slate-600 mt-0.5">
                {booking.guestEmail || booking.guest?.email || "No email on record"}
              </p>
              <p className="text-slate-600">
                {booking.guestPhone || booking.guest?.phone || "No contact on record"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Stay Details
              </span>
              <p className="font-semibold text-slate-800">
                Room {booking.roomNumber || booking.room?.roomNumber} (
                {booking.roomType || booking.room?.roomType})
              </p>
              <p className="text-slate-600 mt-0.5">
                Check-In: <strong>{booking.checkInDate}</strong>
              </p>
              <p className="text-slate-600">
                Check-Out: <strong>{booking.checkOutDate}</strong> ({nights}{" "}
                {nights === 1 ? "Night" : "Nights"})
              </p>
            </div>
          </div>

          {/* Itemized Folio Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Itemized Stay & Consumable Charges
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-center">Type / Date</th>
                    <th className="px-4 py-2.5 text-right">Taxable Base</th>
                    <th className="px-4 py-2.5 text-right">GST</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">
                      Room Tariff ({nights} {nights === 1 ? "Night" : "Nights"} stay)
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-500 font-mono text-[11px]">
                      {booking.checkInDate}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {formatCurrency(roomCharges)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                      18% ({formatCurrency(roomTax)})
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(roomTotal)}
                    </td>
                  </tr>

                  {servicesList.map((srv, idx) => {
                    const price = Number(srv.price || 0);
                    const rate = Number(srv.taxRate != null ? srv.taxRate : 18);
                    const tax = Math.round(price * (rate / 100));
                    const total = price + tax;

                    return (
                      <tr key={srv.id ? `${srv.id}-${idx}` : idx}>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {srv.name}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-500 font-mono text-[11px]">
                          {srv.createdAt
                            ? new Date(srv.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )
                            : "Stay Order"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                          {formatCurrency(price)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                          {rate}% ({formatCurrency(tax)})
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal (Room + Services):</span>
                <strong className="text-slate-800 font-mono">
                  {formatCurrency(subtotalBase)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Total GST Assessed:</span>
                <strong className="text-slate-800 font-mono">
                  {formatCurrency(initialGst)}
                </strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                <span>Total Bill (Gross):</span>
                <span className="font-mono text-slate-900">
                  {formatCurrency(grossInvoiceTotal)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon ({booking.couponCode || "COUPON"}):</span>
                  <span className="font-mono">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}

              {deskConcession > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desk Concession:</span>
                  <span className="font-mono">-{formatCurrency(deskConcession)}</span>
                </div>
              )}

              {totalConcessions > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-100 pt-1">
                  <span>Total Concessions:</span>
                  <span className="font-mono">-{formatCurrency(totalConcessions)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm text-slate-900">
                <span>Net Invoice Total:</span>
                <span className="text-[#D96B43] font-mono">
                  {formatCurrency(netInvoiceTotal)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Paid:</span>
                <span className="font-mono">{formatCurrency(totalPaid)}</span>
              </div>

              <div
                className={`flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm ${
                  !isSettled && remainingDue > 0 ? "text-amber-800" : "text-emerald-700"
                }`}
              >
                <span>Remaining Due:</span>
                <span className="font-mono">
                  {isSettled ? formatCurrency(0) : formatCurrency(remainingDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Sign-off Footer */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-6 text-[11px] text-slate-400">
            <div>
              {isSettled && (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <FiCheckCircle /> Account Fully Settled
                </span>
              )}
            </div>
            <div className="text-right space-y-8 ml-auto">
              <div className="w-40 border-b border-slate-300"></div>
              <p className="text-slate-600 font-semibold">
                Authorized Signatory / Cashier
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center print:hidden">
          <button
            type="button"
            onClick={handlePrintMasterReceipt}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg font-medium text-xs transition cursor-pointer"
          >
            <FiPrinter size={14} /> Print Master Receipt
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