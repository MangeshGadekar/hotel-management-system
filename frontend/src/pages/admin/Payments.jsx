import { useState } from 'react';

const METHOD_BADGES = {
  'UPI / QR Code': 'bg-purple-50 text-purple-700 border-purple-200',
  'Credit / Debit Card': 'bg-blue-50 text-blue-700 border-blue-200',
  'Net Banking': 'bg-amber-50 text-amber-700 border-amber-200',
  Cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');

  const [payments] = useState([
    { id: 'TXN-88401', bookingId: 'HM10254', guestName: 'Rahul Sharma', amount: '₹11,164', method: 'UPI / QR Code', date: '12 May 2026', status: 'Completed' },
    { id: 'TXN-88402', bookingId: 'HM10253', guestName: 'Neha Verma', amount: '₹6,500', method: 'Credit / Debit Card', date: '12 May 2026', status: 'Completed' },
    { id: 'TXN-88403', bookingId: 'HM10252', guestName: 'Amit Patel', amount: '₹9,000', method: 'Net Banking', date: '11 May 2026', status: 'Completed' },
    { id: 'TXN-88404', bookingId: 'HM10251', guestName: 'Priya Singh', amount: '₹4,500', method: 'Cash', date: '11 May 2026', status: 'Completed' },
  ]);

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.guestName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payments & Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Audit transaction history, payment channels, and totals</p>
        </div>

        <input
          type="text"
          placeholder="Search by Txn ID, Booking ID, or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43] w-full sm:w-72"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{p.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{p.bookingId}</td>
                  <td className="px-6 py-4">{p.guestName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${METHOD_BADGES[p.method]}`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{p.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}