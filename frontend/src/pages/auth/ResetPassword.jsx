import { Link, useParams } from "react-router-dom";
import { FiLock, FiCheckCircle, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { Athenura_Circle_Logo, Bedroom_image_login_Register } from "../../assets";
import { useState } from "react";

const ResetPassword = () => {
  const { token } = useParams(); // If you're using token in URL
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password reset logic here
    if (password === confirmPassword && password.length >= 8) {
      setIsSubmitted(true);
      // API call to reset password with token
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

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <div className="hidden md:flex w-full md:w-1/2 p-8 lg:p-12 flex-col justify-between bg-black/30 backdrop-blur-sm border-r border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-10 lg:mb-12">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg">
                <img src={Athenura_Circle_Logo} alt="Logo" />
              </div>
              <span className="text-white font-bold text-2xl lg:text-2xl tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] lg:text-xs font-semibold uppercase tracking-wider ml-1 lg:ml-2 bg-amber-400/20 px-2 py-1 rounded-full">
                Premium
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight">
              Create New
              <br />
              <span className="text-amber-400">Password</span>
            </h1>
            <p className="text-amber-100/80 text-base lg:text-lg mb-6 lg:mb-8 max-w-sm">
              Your new password must be different from previously used passwords.
              Choose a strong password for security.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiCheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiCheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Must include uppercase & lowercase letters
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiCheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Include at least one number or symbol
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-amber-200/60 text-xs lg:text-sm">
              By resetting your password, you agree to our{" "}
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
                <img src={Athenura_Circle_Logo} alt="Logo" />
              </div>
              <span className="text-white text-2xl font-bold text-lg tracking-tight">
                आतिथ्य
              </span>
              <span className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider ml-1 bg-amber-400/20 px-2 py-0.5 rounded-full">
                Premium
              </span>
            </div>

            {!isSubmitted ? (
              <>
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                    Reset Your Password
                  </h2>
                  <p className="text-amber-200/70 text-xs sm:text-sm">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                      New Password
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

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
                        className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-red-400 text-[10px] sm:text-xs mt-1 text-left">
                        Passwords do not match
                      </p>
                    )}
                    {password && password.length < 8 && (
                      <p className="text-red-400 text-[10px] sm:text-xs mt-1 text-left">
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={password !== confirmPassword || password.length < 8}
                    className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Reset Password
                    </span>
                  </button>
                </form>

                <p className="text-center text-amber-200/60 text-xs sm:text-sm mt-6 sm:mt-8">
                  <Link
                    to="/login"
                    className="text-amber-400 font-semibold hover:text-amber-300 transition-colors hover:underline inline-flex items-center gap-1"
                  >
                    <FiArrowLeft className="w-3 h-3" />
                    Back to Sign In
                  </Link>
                </p>
              </>
            ) : (
              // Success State
              <div className="w-full max-w-sm mx-auto text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                    <FiCheckCircle className="w-10 h-10 text-amber-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-amber-200/70 text-sm mb-6">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <Link
                  to="/login"
                  className="inline-flex w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base items-center justify-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;