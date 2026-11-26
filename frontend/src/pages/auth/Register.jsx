import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiHome,
  FiKey,
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { Athenura_Circle_Logo } from "../../assets";
import useAuthStore from "../../app/useAuthStore";
import toast from "react-hot-toast";

const Register = () => {
  const register = useAuthStore((state) => state.register);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const role = "ADMIN";
      const payload = {
        firstName,
        lastName,
        email,
        password,
        secretKey,
        role,
      };
      const res = await register(payload);

      if (res?.success === true) {
        toast.success(res.message);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-50/70 via-stone-50 to-orange-50/50 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-200/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-3xl overflow-hidden bg-white border border-amber-100 shadow-2xl shadow-stone-900/10">
        {/* Left Brand Panel */}
        <div className="hidden md:flex w-full md:w-1/2 p-10 lg:p-12 flex-col justify-between bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center border border-white/10">
                <img
                  src={Athenura_Circle_Logo}
                  alt="Hotel Athitya"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider ml-1 bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Hotel Athitya
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Join the
              <br />
              <span className="text-amber-400">Athitya Team</span>
            </h1>
            <p className="text-stone-300 text-sm lg:text-base mb-8 max-w-sm leading-relaxed">
              Create your account to manage reservations, guest check-ins, and
              hospitality services at Hotel Athitya, Nagpur.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiHome className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Centralized front-desk &amp; room control
                </span>
              </div>
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Instant invoicing, GST receipts &amp; settlements
                </span>
              </div>
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiShield className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Protected administrator registration
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 pt-6 border-t border-white/10">
            <p className="text-stone-400 text-xs">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-amber-400 hover:underline">
                Terms of Service
              </Link>{" "}
              &amp;{" "}
              <Link to="/privacy" className="text-amber-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-6 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-50 p-1.5 flex items-center justify-center border border-amber-200">
              <img
                src={Athenura_Circle_Logo}
                alt="Hotel Athitya"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-stone-900 font-bold text-xl tracking-tight">
              आतिथ्य
            </span>
            <span className="text-amber-700 text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Hotel Athitya
            </span>
          </div>

          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
              Account Setup
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-3 mb-1">
              Create Your Account
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              Register to access the Hotel Athitya management portal
            </p>
          </div>

          <form
            className="w-full max-w-sm mx-auto space-y-4"
            onSubmit={handleRegister}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                  First Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rohan"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                  Last Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@hotelathitya.com"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                Confirm Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left">
                Secret Key{" "}
                <span className="text-amber-700/70 text-[10px] normal-case font-medium">
                  (Optional — Admin only)
                </span>
              </label>
              <div className="relative group">
                <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  type={showSecretKey ? "text" : "password"}
                  placeholder="Enter admin secret key"
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                  aria-label={
                    showSecretKey ? "Hide secret key" : "Show secret key"
                  }
                >
                  {showSecretKey ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-stone-400 text-[11px] text-left">
                * Leave empty to create a regular account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <FiUserPlus className="w-4 h-4" />
                {loading ? "Creating Account..." : "Create Account"}
              </span>
            </button>
          </form>

          <p className="text-center text-stone-500 text-xs sm:text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-700 font-bold hover:text-amber-800 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;