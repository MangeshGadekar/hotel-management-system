import React, { useState, useEffect } from "react";
import { FiX, FiCreditCard, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";
import usePaymentStore from "../../app/usePaymentStore";

export default function PaymentsForm({ initialData = null, onSuccess = () => {}, onCancel = () => {} }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: initialData?.bookingId || "",
    amount: initialData?.amount || "",
    paymentType: "SPLIT_BALANCE",
    paymentMethod: "CASH",
    transactionReference: "",
  });

  const recordManualPayment = usePaymentStore((state) => state.recordManualPayment);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        bookingId: initialData.bookingId || "",
        amount: initialData.amount || "",
        paymentType: "SPLIT_BALANCE",
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookingId || !formData.amount) {
      toast.error("Booking ID and Amount are required");
      return;
    }

    if (formData.paymentMethod === "CARD_MACHINE" && !formData.transactionReference.trim()) {
      toast.error("Please enter the Card Machine slip Auth code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await recordManualPayment({
        bookingId: Number(formData.bookingId),
        amount: Number(formData.amount),
        paymentType: "SPLIT_BALANCE",
        paymentMethod: formData.paymentMethod,
        transactionReference:
          formData.paymentMethod === "CARD_MACHINE"
            ? formData.transactionReference.trim().toUpperCase()
            : null,
      });

      toast.success(`Payment of ₹${Number(formData.amount).toLocaleString()} recorded!`);
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FiCreditCard className="text-[#D96B43]" /> Record Counter Transaction
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <FiX size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Booking ID <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            readOnly={!!initialData?.bookingId}
            value={formData.bookingId}
            onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm ${
              initialData?.bookingId ? "bg-slate-100 text-slate-600 cursor-not-allowed font-bold" : "bg-white"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            readOnly={!!initialData?.amount}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm ${
              initialData?.amount ? "bg-slate-100 text-slate-800 font-bold cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Payment Policy
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="SPLIT_BALANCE">Remaining Balance</option>
              <option value="FULL">Full Settlement</option>
              <option value="SPLIT_ADVANCE">Advance (40%)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value,
                  transactionReference: "",
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="CASH">Cash (Front Desk)</option>
              <option value="CARD_MACHINE">Card (Swipe Machine)</option>
              <option value="UPI">Counter QR / UPI</option>
            </select>
          </div>
        </div>

        {/*  Card Machine */}
        {formData.paymentMethod === "CARD_MACHINE" && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <FiFileText /> Slip Auth / Reference Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AUTH-482019"
              value={formData.transactionReference}
              onChange={(e) =>
                setFormData({ ...formData, transactionReference: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}