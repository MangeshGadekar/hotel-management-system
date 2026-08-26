import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiSend } from "react-icons/fi";
import { Athenura_Circle_Logo, Bedroom_image_login_Register } from "../../assets";

const ForgetPassword = () => {
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
              Reset Your
              <br />
              <span className="text-amber-400">Password</span>
            </h1>
            <p className="text-amber-100/80 text-base lg:text-lg mb-6 lg:mb-8 max-w-sm">
              Don't worry! Enter your email address and we'll send you a link to
              reset your password securely.
            </p>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiMail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Secure password reset
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiSend className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  We'll send reset instructions
                </span>
              </div>
              <div className="flex items-center gap-3 text-amber-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <FiArrowLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />
                </div>
                <span className="text-sm lg:text-base">
                  Return to login anytime
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-amber-200/60 text-xs lg:text-sm">
              By continuing, you agree to our{" "}
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

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Forgot Password?
              </h2>
              <p className="text-amber-200/70 text-xs sm:text-sm">
                Enter your registered email to reset your password
              </p>
            </div>

            <form className="w-full max-w-sm mx-auto space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <label className="text-white/80 text-xs sm:text-sm font-medium block text-left">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-amber-300 transition-colors" />
                  <input
                    type="email"
                    placeholder="guest@luxestay.com"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/30 text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                </div>
                <p className="text-amber-200/50 text-[10px] sm:text-xs mt-1 text-left">
                  Enter the email associated with your account
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Reset Link
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;