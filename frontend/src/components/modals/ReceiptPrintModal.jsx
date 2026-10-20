import React from 'react';
import { FiX, FiPrinter, FiCheckCircle } from 'react-icons/fi';

export default function ReceiptPrintModal({ receipt, booking, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  const formattedDate = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'On File';

  const getPaymentPurpose = () => {
    if (receipt.paymentNote && receipt.paymentNote.trim()) {
      return receipt.paymentNote;
    }
    if (receipt.description && receipt.description.trim()) {
      return receipt.description;
    }

    const type = receipt.paymentType || '';

    if (type.includes('ADVANCE')) {
      return 'Advance Booking Deposit (40%)';
    }

    if (type.includes('FULL')) {
      return 'Full Reservation Settlement';
    }

    const receiptAmt = Math.round(Number(receipt.amountPaid || receipt.amount || 0));
    const services = booking?.selectedExtraServices || [];

    const getServiceTotal = (s) => {
      const price = Number(s.price || 0);
      const taxRate = Number(s.taxRate != null ? s.taxRate : 18) / 100;
      return Math.round(price + price * taxRate);
    };

    const singleMatch = services.find((s) => {
      const withTax = getServiceTotal(s);
      const base = Math.round(Number(s.price || 0));
      return Math.abs(withTax - receiptAmt) <= 2 || Math.abs(base - receiptAmt) <= 2;
    });

    if (singleMatch) {
      return singleMatch.name;
    }

    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        const comboTotal = getServiceTotal(services[i]) + getServiceTotal(services[j]);
        if (Math.abs(comboTotal - receiptAmt) <= 5) {
          return `${services[i].name} & ${services[j].name}`;
        }
      }
    }

    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        for (let k = j + 1; k < services.length; k++) {
          const comboTotal =
            getServiceTotal(services[i]) +
            getServiceTotal(services[j]) +
            getServiceTotal(services[k]);
          if (Math.abs(comboTotal - receiptAmt) <= 5) {
            return `${services[i].name}, ${services[j].name} & ${services[k].name}`;
          }
        }
      }
    }

    return 'Room & Folio Balance Settlement';
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-6 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Official Payment Receipt
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Hotel Letterhead */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#D96B43] tracking-wide">
            HOTEL & SUITES
              </h2>
             
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900 block">
                {receipt.receiptNumber || `#REC-${receipt.id}`}
              </span>
            
            </div>
          </div>

          {/* Guest & Reservation Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Guest Name</span>
              <strong className="text-slate-800 text-sm">
                {booking?.guestName || `${booking?.guest?.firstName || ''} ${booking?.guest?.lastName || ''}`}
              </strong>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {booking?.guestEmail || booking?.guest?.email || ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Stay Reference</span>
              <span className="font-bold text-slate-800 block">Booking #{booking?.id}</span>
              <span className="text-slate-500 block text-[11px]">
                Room {booking?.roomNumber} ({booking?.roomType || 'Standard'})
              </span>
            </div>
          </div>

          {/* Receipt Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2">Payment Description</th>
                  <th className="px-4 py-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 block">{getPaymentPurpose()}</span>
                    <span className="text-[11px] text-slate-500">
                      Method: <strong>{(receipt.paymentMethod || 'CASH').replace('_', ' ')}</strong>
                      {receipt.transactionReference && (
                        <span> • Ref/Slip: <code className="text-blue-700">{receipt.transactionReference}</code></span>
                      )}
                      {receipt.razorpayPaymentId && (
                        <span> • Txn ID: <code className="text-purple-700">{receipt.razorpayPaymentId}</code></span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                    {formatCurrency(receipt.amountPaid || receipt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transaction Status & Total */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FiCheckCircle /> Payment Successful
            </span>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Amount Received</span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatCurrency(receipt.amountPaid || receipt.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition"
          >
            <FiPrinter /> Print Receipt Slip
          </button>
          <button
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