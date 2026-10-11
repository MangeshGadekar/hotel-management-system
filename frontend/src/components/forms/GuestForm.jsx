import React, { useState, useEffect, useRef } from "react";
import {
  FiUser, FiPhone, FiMail, FiCreditCard, FiMapPin,
  FiHome, FiMap, FiNavigation, FiHash, FiCheck, FiAward,
} from "react-icons/fi";
import useGuestStore from "../../app/useGuestStore";

export default function GuestForm({ onSuccess, initialData = null, token, currentUserId, onClose }) {
  const {
    sendOtp,
    verifyOtpAndSave,
    searchGuests,
    searchResults,
    clearSearchResults,
    loading,
  } = useGuestStore();

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

  const [isExistingGuest, setIsExistingGuest] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        dateOfBirth: initialData.dateOfBirth || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
        idProofType: initialData.idProofType || "AADHAR_CARD",
        idProofNumber: initialData.idProofNumber || "",
      });
      setIsExistingGuest(true);
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let interval = null;
    if (showOtpModal && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, resendTimer]);

  const handleEmailChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
    setIsExistingGuest(false);

    if (value.trim().length >= 2) {
      await searchGuests(value, token);
      setShowDropdown(true);
    } else {
      clearSearchResults();
      setShowDropdown(false);
    }
  };

  const handleSelectExistingGuest = (guest) => {
    setFormData({
      firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      email: guest.email || "",
      phone: guest.phone || "",
      dateOfBirth: guest.dateOfBirth || "",
      address: guest.address || "",
      city: guest.city || "",
      state: guest.state || "",
      postalCode: guest.postalCode || "",
      idProofType: guest.idProofType || "AADHAR_CARD",
      idProofNumber: guest.idProofNumber || "",
    });
    setIsExistingGuest(true);
    setShowDropdown(false);
    clearSearchResults();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitiateSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.firstName) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await sendOtp(formData.email.trim(), token);
      setShowOtpModal(true);
      setResendTimer(30);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    }
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
      setOtpError(err.message || "Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOtpError("");

    if (!otp || otp.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit verification code.");
      setIsSubmitting(false);
      return;
    }

    const cleanedGuestData = {
      ...formData,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
      createdBy: currentUserId || null,
    };

    try {
      const result = await verifyOtpAndSave(cleanedGuestData, otp.trim(), token);

      if (onSuccess) {
        onSuccess(result);
      }
      if (onClose) {
        onClose(result);
      }
      setShowOtpModal(false);
    } catch (err) {
      console.error("Failed to verify code:", err);
      setOtpError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitiateSubmit} className="space-y-4 text-sm text-slate-700">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 fill-current text-red-500" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <div className="relative" ref={dropdownRef}>
          <label className="block font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="Type email to search or register..."
            value={formData.email}
            onChange={handleEmailChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          />

          {showDropdown && searchResults?.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((guest) => (
                <div
                  key={guest.id || guest._id}
                  onClick={() => handleSelectExistingGuest(guest)}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {guest.firstName} {guest.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {guest.email} | {guest.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {isExistingGuest && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 fill-current text-blue-500" viewBox="0 0 20 20">
              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
            </svg>
            <span>Existing guest details auto-filled. Modify details below if required.</span>
          </div>
        )}

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
        </div>

        {/* Phone & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
        </div>

        {/* ID Proof */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">ID Proof Type</label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            >
              <option value="AADHAR_CARD">Aadhaar Card</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVING_LICENSE">Driving License</option>
              <option value="VOTER_ID">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">ID Proof Number</label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#D96B43] text-white font-semibold rounded-lg hover:bg-[#c55e39] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending Code..." : isExistingGuest ? "Update Guest (Send Code)" : "Create Guest (Send Code)"}
          </button>
        </div>
      </form>

      {/* Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Enter Verification Code</h3>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpError("");
                  setOtp("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              A verification code has been sent to <span className="font-semibold text-slate-800">{formData.email}</span>.
            </p>

            {otpError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                {otpError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Didn't receive code?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || isResending}
                  onClick={handleResendOtp}
                  className={`font-semibold text-xs px-2.5 py-1 rounded transition-colors ${
                    resendTimer > 0 || isResending
                      ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                      : "text-[#D96B43] bg-orange-50 hover:bg-orange-100 cursor-pointer"
                  }`}
                >
                  {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpError("");
                    setOtp("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleVerifyOtp}
                  className="px-4 py-2 bg-[#D96B43] text-white text-xs font-semibold rounded-lg hover:bg-[#c55e39] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}