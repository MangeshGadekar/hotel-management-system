import { useEffect, useState } from 'react';
import useCuponesStore from '../../app/useCuponesStore';
import useAuthStore from '../../app/useAuthStore';
import CuponsForm from '../../components/forms/CuponsForm';

export default function Coupons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cuponseList = useCuponesStore((s) => s.cuponseList);
  const getAllCuponse = useCuponesStore((s) => s.getAllCuponse);
  const removeCupon = useCuponesStore((s) => s.removeCupon);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) getAllCuponse(token);
  }, [getAllCuponse, token]);

  const handleDelete = async (id) => {
    await removeCupon(id, token);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Coupons &amp; Promo Codes
          </h1>
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
                  <span className="font-semibold text-slate-700">
                    {c.timesUsed ?? 0}
                  </span>{' '}
                  / {c.usageLimit} times
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
            <h3 className="text-lg font-bold text-slate-800">
              Create New Coupon
            </h3>
            <CuponsForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                if (token) getAllCuponse(token);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}