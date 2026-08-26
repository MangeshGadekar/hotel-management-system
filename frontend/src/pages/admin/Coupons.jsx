import { useState } from 'react';

export default function Coupons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [coupons, setCoupons] = useState([
    { code: 'SUMMER20', discount: '20% OFF', type: 'Percentage', usageLimit: 100, timesUsed: 42, expiry: '31 Aug 2026', status: 'Active' },
    { code: 'WELCOME10', discount: '10% OFF', type: 'Percentage', usageLimit: 500, timesUsed: 218, expiry: '31 Dec 2026', status: 'Active' },
    { code: 'FLAT1000', discount: '₹1,000 OFF', type: 'Flat Amount', usageLimit: 50, timesUsed: 50, expiry: '01 May 2026', status: 'Expired' },
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    type: 'Percentage',
    usageLimit: 100,
    expiry: '',
  });

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;

    setCoupons([
      ...coupons,
      {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        discount: newCoupon.type === 'Percentage' ? `${newCoupon.discount}% OFF` : `₹${newCoupon.discount} OFF`,
        timesUsed: 0,
        status: 'Active',
      },
    ]);

    setNewCoupon({ code: '', discount: '', type: 'Percentage', usageLimit: 100, expiry: '' });
    setIsModalOpen(false);
  };

  const handleDelete = (code) => {
    setCoupons(coupons.filter((c) => c.code !== code));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Coupons & Promo Codes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create, manage, and track usage for guest discounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div key={c.code} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-lg font-bold tracking-wider text-[#D96B43]">{c.code}</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-2xl font-bold text-slate-900">{c.discount}</p>
                <p className="text-xs text-slate-500">
                  Used: <span className="font-semibold text-slate-700">{c.timesUsed}</span> / {c.usageLimit} times
                </p>
                <p className="text-xs text-slate-500">Expires on: <span className="font-medium text-slate-700">{c.expiry}</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{c.type}</span>
              <button onClick={() => handleDelete(c.code)} className="text-rose-600 hover:text-rose-800 font-medium">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Flat Amount">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Value</label>
                <input
                  type="number"
                  placeholder={newCoupon.type === 'Percentage' ? '20' : '500'}
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg font-semibold">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}