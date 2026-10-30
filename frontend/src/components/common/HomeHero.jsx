import React from 'react';
import { BiBed, BiCalendar, BiPhone, BiStar } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { FaMapPin, FaUserSecret, FaUtensils, FaUtensilSpoon } from 'react-icons/fa';
import { FcWiFiLogo } from 'react-icons/fc';
import { Link } from 'react-router-dom';

const HomeHero = () => {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center bg-gradient-to-br from-amber-50 via-white to-amber-50/40 overflow-hidden py-10 lg:py-12">
      {/* Background Decorative Blur */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[28rem] h-[28rem] bg-amber-400 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-amber-600 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Column */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-amber-100/90 border border-amber-200/60 px-4 py-1.5 rounded-full shadow-xs">
              <BiStar className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-xs sm:text-sm font-semibold text-amber-800">
                4.9 Rating • 2,500+ Reviews
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Experience <br />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Luxury Living
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-lg">
              Discover unparalleled comfort and world-class hospitality at Hotel Athitya. 
              Where every detail is crafted to make your stay unforgettable.
            </p>

            {/* Key Stats Row */}
            <div className="flex flex-wrap gap-8 py-1 items-center">
              <div>
                <div className="text-3xl font-extrabold text-slate-900">150+</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Luxury Rooms</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-3xl font-extrabold text-slate-900">4.9★</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Guest Rating</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-3xl font-extrabold text-slate-900">24/7</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Concierge Service</div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Link to="/rooms">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer">
                  Book Your Stay
                  <BsArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/manage-booking">
                <button className="bg-white hover:bg-slate-50 text-slate-700 px-7 py-3.5 rounded-full font-semibold text-sm border-2 border-slate-200 transition-all flex items-center gap-2 shadow-xs cursor-pointer">
                  <BiCalendar className="w-4 h-4 text-amber-600" />
                  Check Availability
                </button>
              </Link>
            </div>

            {/* Features Row */}
            <div className="flex flex-wrap gap-6 pt-2 text-slate-600">
              <div className="flex items-center gap-2">
                <FcWiFiLogo className="w-4 h-4" />
                <span className="text-xs font-semibold">Free WiFi</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUtensilSpoon className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold">Gourmet Dining</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserSecret className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold">Event Spaces</span>
              </div>
            </div>
          </div>

          {/* Right Column - Cards Display */}
          <div className="relative mx-auto max-w-lg lg:max-w-none w-full">
            <div className="relative bg-gradient-to-br from-amber-200/35 to-amber-100/30 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-amber-200/60 shadow-inner">
              <div className="relative">
                {/* Center Glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 bg-amber-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>

                {/* 4 Feature Cards */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5 relative z-10">
                  <div className="bg-white/95 rounded-2xl p-5 shadow-lg shadow-slate-900/5 transform rotate-2 hover:rotate-0 transition-transform border border-slate-100">
                    <div className="w-11 h-11 bg-amber-100/80 rounded-xl flex items-center justify-center mb-3">
                      <BiBed className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Premium Suite</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Ocean view • 65m²</p>
                  </div>

                  <div className="bg-white/95 rounded-2xl p-5 shadow-lg shadow-slate-900/5 transform -rotate-2 mt-6 hover:rotate-0 transition-transform border border-slate-100">
                    <div className="w-11 h-11 bg-amber-100/80 rounded-xl flex items-center justify-center mb-3">
                      <FaUtensils className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Fine Dining</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Michelin starred</p>
                  </div>

                  <div className="bg-white/95 rounded-2xl p-5 shadow-lg shadow-slate-900/5 transform rotate-1 -mt-2 hover:rotate-0 transition-transform border border-slate-100">
                    <div className="w-11 h-11 bg-amber-100/80 rounded-xl flex items-center justify-center mb-3">
                      <FaMapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Prime Location</h4>
                    <p className="text-xs text-slate-500 mt-0.5">City center</p>
                  </div>

                  <div className="bg-white/95 rounded-2xl p-5 shadow-lg shadow-slate-900/5 transform -rotate-1 hover:rotate-0 transition-transform border border-slate-100">
                    <div className="w-11 h-11 bg-amber-100/80 rounded-xl flex items-center justify-center mb-3">
                      <BiPhone className="w-6 h-6 text-amber-600 rotate-12" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">24/7 Service</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Concierge</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Floating Happy Guests Pill */}
            <div className="absolute -top-3.5 -right-2 sm:-right-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 animate-bounce-slow border border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 bg-slate-300 rounded-full border-2 border-white"></div>
                  <div className="w-7 h-7 bg-slate-400 rounded-full border-2 border-white"></div>
                  <div className="w-7 h-7 bg-slate-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">1,200+</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Happy Guests</p>
                </div>
              </div>
            </div>

            {/* Bottom Floating Rating Pill */}
            <div className="absolute -bottom-3.5 -left-2 sm:-left-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-4 py-2.5 border border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <BiStar key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">4.9/5</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeHero;