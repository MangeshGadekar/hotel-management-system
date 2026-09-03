import { useState } from 'react';
import GuestForm from '../../components/forms/GuestForm';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const [customers] = useState([
    {
      id: 'CUST-001',
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      phone: '+91 98765 43210',
      totalStays: 3,
      totalSpend: '₹28,500',
      lastStay: '14 May 2026',
      status: 'Active',
    },
    {
      id: 'CUST-002',
      name: 'Neha Verma',
      email: 'neha.v@gmail.com',
      phone: '+91 98765 43211',
      totalStays: 1,
      totalSpend: '₹6,500',
      lastStay: '13 May 2026',
      status: 'Active',
    },
    {
      id: 'CUST-003',
      name: 'Amit Patel',
      email: 'amit.patel@gmail.com',
      phone: '+91 98765 43212',
      totalStays: 5,
      totalSpend: '₹42,000',
      lastStay: '13 May 2026',
      status: 'VIP',
    },
    {
      id: 'CUST-004',
      name: 'Priya Singh',
      email: 'priya.s@gmail.com',
      phone: '+91 98765 43213',
      totalStays: 2,
      totalSpend: '₹14,000',
      lastStay: '12 May 2026',
      status: 'Active',
    },
  ]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">View guest profiles, stay history, and lifetime value</p>
        </div>

        {/* Search */}
        <button
          onClick={() => setShowGuestForm(true)}
          className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold"
        >
         Add Guest
        </button>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43] w-full sm:w-72"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Customer ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Total Stays</th>
                <th className="px-6 py-3">Total Spend</th>
                <th className="px-6 py-3">Last Stay</th>
                <th className="px-6 py-3">Tier</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{cust.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{cust.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-800">{cust.email}</p>
                      <p className="text-slate-400">{cust.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{cust.totalStays}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{cust.totalSpend}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{cust.lastStay}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        cust.status === 'VIP'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="text-xs font-semibold text-[#D96B43] hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  selectedCustomer.status === 'VIP'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {selectedCustomer.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Customer ID:</span> {selectedCustomer.id}</p>
              <p><span className="font-semibold text-slate-800">Email:</span> {selectedCustomer.email}</p>
              <p><span className="font-semibold text-slate-800">Phone:</span> {selectedCustomer.phone}</p>
              <p><span className="font-semibold text-slate-800">Total Stays:</span> {selectedCustomer.totalStays}</p>
              <p><span className="font-semibold text-slate-800">Lifetime Spend:</span> {selectedCustomer.totalSpend}</p>
              <p><span className="font-semibold text-slate-800">Last Stay Date:</span> {selectedCustomer.lastStay}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showGuestForm && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Add Guest
        </h3>

        <button
          onClick={() => setShowGuestForm(false)}
          className="text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

      <GuestForm />

    </div>
  </div>
)}
    </div>
  );
}