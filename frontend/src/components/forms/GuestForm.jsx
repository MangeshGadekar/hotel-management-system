import { useState, useEffect, useRef } from "react";
import useGuestStore from "../../app/useGuestStore";

export default function GuestForm({ onSuccess, initialData = null, token }) {
  const { sendOtp, verifyOtpAndSave, searchGuests, searchResults, clearSearchResults, loading } = useGuestStore();

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
  
  // Resend OTP State & Timer State
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  
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

  // Countdown timer logic when OTP modal is open
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
    setError("");

    if (name === "phone") {
      const sanitizedPhone = value.replace(/\D/g, "");
      if (sanitizedPhone.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: sanitizedPhone }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return "First Name and Last Name are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return "Please enter a valid 10-digit mobile number.";
    }

    return null;
  };

  const handleInitiateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await sendOtp(formData.email.trim(), token);
      setShowOtpModal(true);
      setResendTimer(30);
      setOtpError("");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email address and try again.");
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
      setOtpError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (!otp || otp.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    const cleanedGuestData = {
      ...formData,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
    };

    const payload = {
      email: formData.email.trim(),
      otp: otp.trim(),
      guestData: cleanedGuestData,
    };

    try {
      await verifyOtpAndSave(payload, token);
      setShowOtpModal(false);
      setOtp("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setOtpError(err.message || "Failed to create/update guest. Invalid OTP or verification failed.");
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

          {showDropdown && searchResults.length > 0 && (
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
            <label className="block font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              maxLength={10}
              placeholder="10 digit mobile number"
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

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#D96B43] text-white font-semibold rounded-lg hover:bg-[#c55e39] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending OTP..." : isExistingGuest ? "Update Guest (Send OTP)" : "Create Guest (Send OTP)"}
          </button>
        </div>
      </form>

      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Enter OTP Code</h3>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpError("");
                  setOtp("");
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              OTP has been sent to <span className="font-semibold text-slate-800">{formData.email}</span>. Please verify to complete {isExistingGuest ? "update" : "registration"}.
            </p>

            {otpError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 fill-current text-red-500" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>

              {/* Resend OTP Section */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Didn't receive code or expired?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || isResending}
                  onClick={handleResendOtp}
                  className={`font-semibold text-xs px-2.5 py-1 rounded transition-colors ${
                    resendTimer > 0 || isResending
                      ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                      : "text-[#D96B43] bg-orange-50 hover:bg-orange-100 cursor-pointer active:scale-95"
                  }`}
                >
                  {isResending
                    ? "Sending..."
                    : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP"}
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
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#D96B43] text-white text-xs font-semibold rounded-lg hover:bg-[#c55e39] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}