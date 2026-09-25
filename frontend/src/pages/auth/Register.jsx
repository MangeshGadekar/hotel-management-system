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
} from "react-icons/fi";
import {
  Athenura_Circle_Logo,
  Bedroom_image_login_Register,
} from "../../assets";
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
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    let role = "ADMIN";
    let payload = {
      firstName, lastName, email, password, secretKey, role
    }
    const res = await register(payload);
    console.log("res : ", res)


    if(res.success && res.success === true) {
      toast.success(res.message)

      navigate(`/login`)
    }

    setLoading(false);
  };

  // Shared input classes (keeps things DRY)
  const inputClasses =
    "w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all autofill-dark";

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4 relative overflow-hidden">
      {/* Fix browser autofill white background */}
      <style>{`
        input.autofill-dark:-webkit-autofill,
        input.autofill-dark:-webkit-autofill:hover,
        input.autofill-dark:-webkit-autofill:focus,
        input.autofill-dark:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.05) inset !important;
          box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.05) inset !important;
          caret-color: #ffffff;
          transition: background-color 9999s ease-in-out 0s;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.75rem !important;
        }
        input.autofill-dark:-webkit-autofill::first-line {
          font-size: inherit;
          color: #ffffff !important;
        }
      `}</style>

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${Bedroom_image_login_Register})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px)",
          transform: "scale(1.08)",
        }}
      />

      <div className="absolute inset-0 z-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <div className="hidden md:flex w-full md:w-1/2 p-8 lg:p-12 flex-col justify-between bg-black/30 backdrop-blur-sm border-r border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-10 lg:mb-12">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg">
                <img src={Athenura_Circle_Logo} alt="" />
              </div>
              <span className="text-white font-bold text-xl lg:text-2xl tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] lg:text-xs font-semibold uppercase tracking-wider ml-1 lg:ml-2 bg-amber-400/20 px-2 py-1 rounded-full">
                Premium
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight">
              Join the
              <br />
              <span className="text-amber-400">Luxury Experience</span>
            </h1>
            <p className="text-amber-100/80 text-base lg:text-lg mb-6 lg:mb-8 max-w-sm">
              Create your account to manage bookings, access premium services,
              and experience world-class hospitality.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Exclusive member benefits
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Priority booking & upgrades
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Personalized concierge services
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-amber-200/60 text-xs lg:text-sm">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-amber-400 hover:underline">
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link to="/privacy" className="text-amber-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-10 lg:p-12 bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col h-full justify-center">
            <div className="flex items-center justify-center gap-2 mb-6 md:hidden">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg">
                <img src={Athenura_Circle_Logo} alt="" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider ml-1 bg-amber-400/20 px-2 py-0.5 rounded-full">
                Premium
              </span>
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Join Us Today
              </h2>
              <p className="text-amber-200/70 text-xs sm:text-sm">
                Join Athenura and experience luxury, comfort, and exceptional
                service
              </p>
            </div>

            <form
              className="w-full max-w-sm mx-auto space-y-4 sm:space-y-5"
              onSubmit={handleRegister}
            >
              {/* First Name */}
              <div className="flex gap-3">
                <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  First Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Last Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={inputClasses}
                  />
                </div>
              </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@luxestay.com"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Confirm Password
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Secret Key{" "}
                  <span className="text-amber-400/50 text-[10px]">
                    (Optional - Admin only)
                  </span>
                </label>
                <div className="relative group">
                  <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
                    aria-label={
                      showSecretKey ? "Hide secret key" : "Show secret key"
                    }
                  >
                    {showSecretKey ? (
                      <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p className="text-amber-200/40 text-[10px] text-left mt-1">
                  * Leave empty to create a regular user account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? "Creating Account..." : "Create Account"}
                </span>
              </button>
            </form>

            <p className="text-center text-amber-200/60 text-xs sm:text-sm mt-6 sm:mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;