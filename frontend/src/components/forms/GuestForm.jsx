// components/forms/GuestForm.jsx
import React, { useState } from "react";
import {
  FiUser, FiPhone, FiMail, FiCreditCard, FiMapPin,
  FiHome, FiMap, FiNavigation, FiHash, FiCheck, FiAward,
} from "react-icons/fi";
import useGuestStore from "../../app/useGuestStore";

const GuestForm = ({ formClose, onGuestCreated }) => {
  const addGuest = useGuestStore((state) => state.addGuest);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    idProofType: "AADHAR_CARD",
    idProofNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      await sendOtp(formData.email.trim(), token);
      setResendTimer(30);
      setOtp("");
    } catch (err) {
      setOtpError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addGuest(formData);
      console.log("Guest created:", result);

      // ✅ Pass the created guest back to the parent
      if (onGuestCreated) {
        onGuestCreated(result);
      }

      formClose(result);
    } catch (error) {
      console.error("Failed to create guest:", error);
      setError(error.message || "Failed to create guest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300";

  const selectClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300 appearance-none cursor-pointer";

  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60"
    >
      {/* ... ALL YOUR EXISTING FIELDS ... */}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/60">
        <p className="text-xs text-slate-400">
          <span className="text-red-500 font-medium">*</span> Required fields
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg bg-[#D96B43] text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-[#c55e39] hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto min-w-[140px]"
        >
          <FiCheck size={18} />
          {isSubmitting ? "Creating..." : "Create Guest"}
        </button>
      </div>
    </form>
  );
}