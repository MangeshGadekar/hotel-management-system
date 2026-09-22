import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn, FiMail, FiLock, FiHome, FiEye, FiEyeOff } from "react-icons/fi";
import {
  Athenura_Circle_Logo,
  Bedroom_image_login_Register,
} from "../../assets";
import useAuthStore from "../../app/useAuthStore";
import toast from "react-hot-toast";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!formData.password) {
      next.password = "Password is required";
    } else if (formData.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await login(payload);
      console.log("res", res)
      if(res.success && res.success === true) {
        toast.success(` ${res.message}`);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4 relative overflow-hidden">
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
              <span className="text-white font-bold text-2xl lg:text-2xl tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] lg:text-xs font-semibold uppercase tracking-wider ml-1 lg:ml-2 bg-amber-400/20 px-2 py-1 rounded-full">
                Premium
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight">
              Welcome Back to
              <br />
              <span className="text-amber-400">Luxury Living</span>
            </h1>
            <p className="text-amber-100/80 text-base lg:text-lg mb-6 lg:mb-8 max-w-sm">
              Sign in to manage your bookings, access premium services, and
              experience world-class hospitality.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Manage your reservations
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  24/7 concierge services
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiHome className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Instant support & assistance
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-amber-200/60 text-xs lg:text-sm">
              By signing in, you agree to our{" "}
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
              <span className="text-white text-2xl font-bold text-lg tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider ml-1 bg-amber-400/20 px-2 py-0.5 rounded-full">
                Premium
              </span>
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Welcome to the Hotel Portal
              </h2>
              <p className="text-amber-200/70 text-xs sm:text-sm">
                Enter your credentials to continue to the hotel management
                portal
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="w-full max-w-sm mx-auto space-y-4 sm:space-y-5"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-white/80 text-xs sm:text-sm font-medium block text-left"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="guest@luxestay.com"
                    className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-transparent backdrop-blur-sm border rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30"
                        : "border-white/10 focus:border-amber-400 focus:ring-amber-400/30"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-xs text-left">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="text-white/80 text-xs sm:text-sm font-medium block"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-amber-400 text-xs sm:text-sm hover:text-amber-300 transition-colors hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-11 py-2.5 sm:py-3 bg-transparent backdrop-blur-sm border rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30"
                        : "border-white/10 focus:border-amber-400 focus:ring-amber-400/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 focus:outline-none focus:text-amber-300 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-xs text-left">
                    {errors.password}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="text-red-300 text-xs sm:text-sm bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2 text-left">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiLogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? "Signing In..." : "Sign In to Dashboard"}
                </span>
              </button>
            </form>

            <p className="text-center text-amber-200/60 text-xs sm:text-sm mt-6 sm:mt-8">
              New to LuxeStay?{" "}
              <Link
                to="/register"
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;