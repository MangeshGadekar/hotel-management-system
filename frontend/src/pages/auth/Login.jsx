import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLogIn,
  FiMail,
  FiLock,
  FiHome,
  FiEye,
  FiEyeOff,
  FiShield,
  FiClock,
} from "react-icons/fi";
import { Athenura_Circle_Logo } from "../../assets";
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
      console.log("vlogin", res);

      // Verify that response and role exist before navigating
      if (res && res.success && res.data?.role) {
        toast.success(res.message || "Login successful!");
        navigate(`/${res.data.role.toLowerCase()}/dashboard`);
      } else {
        const errorMsg = res?.message || "Invalid email or password. Please try again.";
        setServerError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      let errorMsg = "Invalid email or password. Please try again.";
      try {
        if (err?.response) {
          const errorData = await err.response.json();
          errorMsg = errorData.message || errorMsg;
        } else if (err?.message) {
          errorMsg = err.message;
        }
      } catch {
        // Fallback if parsing fails
      }
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-50/70 via-stone-50 to-orange-50/50 relative overflow-hidden">
      {/* Subtle decorative background accents */}
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
              Welcome Back to
              <br />
              <span className="text-amber-400">Hotel Athitya</span>
            </h1>
            <p className="text-stone-300 text-sm lg:text-base mb-8 max-w-sm leading-relaxed">
              Sign in to manage front-desk operations, reservations, guest
              services, and property insights in Nagpur.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiHome className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Real-time room &amp; reservation management
                </span>
              </div>
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiClock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Seamless check-in, billing &amp; service tracking
                </span>
              </div>
              <div className="flex items-center gap-3 text-stone-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
                  <FiShield className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm">
                  Role-based staff &amp; administrator portal
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 pt-6 border-t border-white/10">
            <p className="text-stone-400 text-xs">
              By signing in, you agree to our{" "}
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
            <span className="text-stone-900 text-xl font-bold tracking-tight">
              आतिथ्य
            </span>
            <span className="text-amber-700 text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Hotel Athitya
            </span>
          </div>

          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
              Staff &amp; Admin Access
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-3 mb-1">
              Sign In to Portal
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              Enter your credentials to access the management dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full max-w-sm mx-auto space-y-5"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-stone-700 text-xs font-semibold uppercase tracking-wider block text-left"
              >
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="staff@hotelathitya.com"
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-stone-200 focus:border-amber-600 focus:ring-amber-600/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-600 text-xs text-left">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-stone-700 text-xs font-semibold uppercase tracking-wider block"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-amber-700 text-xs font-semibold hover:text-amber-800 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 group-focus-within:text-amber-600 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 bg-stone-50 border rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-stone-200 focus:border-amber-600 focus:ring-amber-600/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs text-left">
                  {errors.password}
                </p>
              )}
            </div>

            {serverError && (
              <div className="text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 text-left">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <FiLogIn className="w-4 h-4" />
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </span>
            </button>
          </form>

          <p className="text-center text-stone-500 text-xs sm:text-sm mt-7">
            New to Hotel Athitya?{" "}
            <Link
              to="/register"
              className="text-amber-700 font-bold hover:text-amber-800 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;