import { useEffect, useState } from 'react';
import useCuponesStore from '../../app/useCuponesStore';
import useAuthStore from '../../app/useAuthStore';

const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'DELUXE', 'SUITE'];

const initialCoupon = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minBookingAmount: '',
  validFrom: '',
  validUntil: '',
  usageLimit: 100,
  active: true,
  applicableRoomTypes: [],
};

export default function Coupons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState(initialCoupon);

  const cuponseList = useCuponesStore((s) => s.cuponseList);
  const getAllCuponse = useCuponesStore((s) => s.getAllCuponse);
  const addCuponse = useCuponesStore((s) => s.addCuponse);
  const removeCupon = useCuponesStore((s) => s.removeCupon);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) getAllCuponse(token);
  }, [getAllCuponse, token]);

  const toggleRoomType = (room) => {
    setNewCoupon((prev) => ({
      ...prev,
      applicableRoomTypes: prev.applicableRoomTypes.includes(room)
        ? prev.applicableRoomTypes.filter((r) => r !== room)
        : [...prev.applicableRoomTypes, room],
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) return;

    const payload = {
      code: newCoupon.code.toUpperCase().trim(),
      discountType: newCoupon.discountType, // 'PERCENTAGE' | 'FLAT'
      discountValue: Number(newCoupon.discountValue),
      minBookingAmount: Number(newCoupon.minBookingAmount) || 0,
      validFrom: newCoupon.validFrom,
      validUntil: newCoupon.validUntil,
      usageLimit: Number(newCoupon.usageLimit) || 100,
      active: newCoupon.active,
      applicableRoomTypes: newCoupon.applicableRoomTypes,
    };

    const res = await addCuponse(payload, token);
    console.log('res, ', res);

    setNewCoupon(initialCoupon);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    await removeCupon(id, token);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Coupons &amp; Promo Codes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage, and track usage for guest discounts
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cuponseList?.map((c) => (
          <div
            key={c.id ?? c.code}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-lg font-bold tracking-wider text-[#D96B43]">
                  {c.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    c.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {c.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-2xl font-bold text-slate-900">
                  {c.discountType === 'PERCENTAGE'
                    ? `${c.discountValue}% OFF`
                    : `₹${c.discountValue} OFF`}
                </p>
                <p className="text-xs text-slate-500">
                  Min booking:{' '}
                  <span className="font-medium text-slate-700">
                    ₹{c.minBookingAmount}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Used:{' '}
                  <span className="font-semibold text-slate-700">{c.timesUsed ?? 0}</span> /{' '}
                  {c.usageLimit} times
                </p>
                <p className="text-xs text-slate-500">
                  Valid:{' '}
                  <span className="font-medium text-slate-700">
                    {c.validFrom} → {c.validUntil}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Rooms:{' '}
                  <span className="font-medium text-slate-700">
                    {c.applicableRoomTypes?.join(', ') || 'All'}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{c.discountType}</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-rose-600 hover:text-rose-800 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-sm">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Discount Type
                </label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discountType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  placeholder={newCoupon.discountType === 'PERCENTAGE' ? '20' : '500'}
                  value={newCoupon.discountValue}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, discountValue: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>

              {/* Min Booking Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Minimum Booking Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={newCoupon.minBookingAmount}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, minBookingAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              {/* Valid From / Until */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={newCoupon.validFrom}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, validFrom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={newCoupon.validUntil}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, validUntil: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                    required
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              {/* Applicable Room Types */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Applicable Room Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_TYPES.map((room) => (
                    <label
                      key={room}
                      className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={newCoupon.applicableRoomTypes.includes(room)}
                        onChange={() => toggleRoomType(room)}
                        className="accent-[#D96B43]"
                      />
                      {room}
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-600">
                  Active
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setNewCoupon({ ...newCoupon, active: !newCoupon.active })
                  }
                  className={`relative w-10 h-5 rounded-full transition ${
                    newCoupon.active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      newCoupon.active ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg font-semibold"
                >
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