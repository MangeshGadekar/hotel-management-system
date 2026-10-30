import React, { useState } from 'react';
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
  targetAudience: 'ALL',
};

const CuponsForm = ({ onClose, onSuccess }) => {
  const [newCoupon, setNewCoupon] = useState(initialCoupon);

  const addCuponse = useCuponesStore((s) => s.addCuponse);
  const token = useAuthStore((state) => state.token);

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
      discountType: newCoupon.discountType,
      discountValue: Number(newCoupon.discountValue),
      minBookingAmount: Number(newCoupon.minBookingAmount) || 0,
      validFrom: newCoupon.validFrom,
      validUntil: newCoupon.validUntil,
      usageLimit: Number(newCoupon.usageLimit) || 100,
      active: newCoupon.active,
      applicableRoomTypes: newCoupon.applicableRoomTypes,
      targetAudience: newCoupon.targetAudience,
    };

    await addCuponse(payload, token);

    setNewCoupon(initialCoupon);
    onSuccess?.();
    onClose?.();
  };

  return (
    <form onSubmit={handleCreateCoupon} className="space-y-3 text-sm">
      {/* Code */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Coupon Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. SUMMER20"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43] uppercase font-mono"
          required
        />
      </div>

      {/* Target Audience Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Available To (Target Audience) <span className="text-red-500">*</span>
        </label>
        <select
          value={newCoupon.targetAudience}
          onChange={(e) =>
            setNewCoupon({ ...newCoupon, targetAudience: e.target.value })
          }
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43] bg-white text-xs font-medium"
        >
          <option value="ALL">All Platforms & Desk (Guests, Desk, & Admin)</option>
          <option value="GUEST">Online Guests Only (Website Checkout & Admin)</option>
          <option value="RECEPTIONIST">Desk Walk-In Only (Front Desk Staff & Admin)</option>
        </select>
        <p className="text-[11px] text-slate-400 mt-1">
          {newCoupon.targetAudience === 'GUEST' && 'Visible on public guest checkout page. Hidden from desk staff.'}
          {newCoupon.targetAudience === 'RECEPTIONIST' && 'Exclusive to front desk reservations. Hidden from website guests.'}
          {newCoupon.targetAudience === 'ALL' && 'Usable everywhere across online checkout and front desk.'}
        </p>
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
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43] bg-white text-xs"
        >
          <option value="PERCENTAGE">Percentage (%)</option>
          <option value="FLAT">Flat Amount (₹)</option>
        </select>
      </div>

      {/* Discount Value */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Discount Value <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
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
          min="0"
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
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43] text-xs"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Valid Until
          </label>
          <input
            type="date"
            min={newCoupon.validFrom}
            value={newCoupon.validUntil}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, validUntil: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43] text-xs"
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
          min="1"
          value={newCoupon.usageLimit}
          onChange={(e) =>
            setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
        />
      </div>

      {/* Applicable Room Types */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Applicable Room Types (Leave empty for All)
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
        <span className="text-xs font-semibold text-slate-600">Active</span>
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
          onClick={onClose}
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
  );
};

export default CuponsForm;