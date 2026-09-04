import React, { useState } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiMapPin,
  FiHome,
  FiMap,
  FiNavigation,
  FiHash,
  FiCheck,
  FiAward,
} from "react-icons/fi";

import useGuestStore from "../../app/useGuestStore";

const GuestForm = () => {
  const addGuest = useGuestStore((state) => state.addGuest);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    idProofType: "",
    idProofNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const result = await addGuest(formData);
      console.log("Guest created:", result);
    } catch (error) {
      console.error("Failed to create guest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300";

  const selectClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300 appearance-none cursor-pointer";

  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  const sectionIconClass = (color = "[#D96B43]") =>
    `flex h-11 w-11 items-center justify-center rounded-xl bg-${color}/10 text-${color} flex-shrink-0`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
      {/* Personal Information */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D96B43]/10 text-[#D96B43]">
            <FiUser size={20} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">Personal Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enter the guest's basic information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <label className={labelClass}>First Name</label>
            <div className="relative">
              <FiUser
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className={labelClass}>Last Name</label>
            <div className="relative">
              <FiUser
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="relative">
              <FiPhone
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <FiMail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200/60" />

      {/* Identity Information */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiCreditCard size={20} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">Identity Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add valid identification details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ID Proof Type */}
          <div>
            <label className={labelClass}>ID Proof Type</label>
            <div className="relative">
              <FiAward
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                size={17}
              />
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="">Select ID proof</option>
                <option value="AADHAR_CARD">Aadhar Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="VOTER_ID">Voter ID</option>
              </select>
            </div>
          </div>

          {/* ID Number */}
          <div>
            <label className={labelClass}>ID Proof Number</label>
            <div className="relative">
              <FiHash
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                placeholder="Enter ID number"
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200/60" />

      {/* Address Information */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiMapPin size={20} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">Address Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enter the guest's residential address</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Address */}
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <div className="relative">
              <FiHome
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Apt 4B"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>City</label>
            <div className="relative">
              <FiMap
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className={labelClass}>State</label>
            <div className="relative">
              <FiNavigation
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="md:col-span-2 md:max-w-xs">
            <label className={labelClass}>Postal Code</label>
            <div className="relative">
              <FiHash
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="10001"
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

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
};

export default GuestForm;