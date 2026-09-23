import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ReceptionistForm = ({
  values,
  errors = {},
  onChange,
  onSubmit,
  onClose,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handle = (field) => (e) => onChange(field, e.target.value);

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 " +
    "shadow-xs transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-[#D96B43]/40 focus:border-[#D96B43] " +
    "hover:border-slate-400";

  const errorClass =
    "border-rose-400 focus:ring-rose-400 focus:border-rose-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditMode ? "Edit Receptionist" : "New Receptionist"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? "Update the account details below."
                : "Fill in the details below to create an account."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white 
                       transition-colors duration-200 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <RxCross1 className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              onChange={handle("email")}
              placeholder="you@hotelparadise.com"
              value={values.email}
              autoFocus
              className={`${inputClass} ${errors.email ? errorClass : ""}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              onChange={handle("username")}
              placeholder="johndoe"
              value={values.username}
              className={`${inputClass} ${
                errors.username ? errorClass : ""
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-rose-500">{errors.username}</p>
            )}
          </div>

          {/* Firstname / Lastname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                First name
              </label>
              <input
                type="text"
                onChange={handle("firstName")}
                placeholder="John"
                value={values.firstName}
                className={`${inputClass} ${
                  errors.firstName ? errorClass : ""
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Last name
              </label>
              <input
                type="text"
                onChange={handle("lastName")}
                placeholder="Doe"
                value={values.lastName}
                className={`${inputClass} ${
                  errors.lastName ? errorClass : ""
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Password with show/hide */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password{" "}
              {isEditMode && (
                <span className="text-slate-400 font-normal">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                onChange={handle("password")}
                placeholder={
                  isEditMode ? "•••••••• (unchanged)" : "••••••••"
                }
                value={values.password}
                className={`${inputClass} pr-11 ${
                  errors.password ? errorClass : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 
                           hover:text-slate-700 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 
                         text-sm font-semibold transition-colors duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-white text-sm font-semibold 
                         bg-[#D96B43] hover:bg-[#c25a34] 
                         shadow-xs hover:shadow-md 
                         active:scale-[0.98] transition-all duration-200 
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating…"
                  : "Creating…"
                : isEditMode
                ? "Update Receptionist"
                : "Create Receptionist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceptionistForm;