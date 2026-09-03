import React from 'react';
import { BiBed, BiCalendar, BiPhone, BiStar } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { FaMapPin, FaUserSecret, FaUtensils, FaUtensilSpoon } from 'react-icons/fa';
import { FcWiFiLogo } from 'react-icons/fc';

const HomeHero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

  

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-amber-100/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <BiStar className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-amber-700">4.9 Rating • 2,500+ Reviews</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-gray-800">Experience</span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Luxury Living
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Discover unparalleled comfort and world-class service at LuxStay. 
              Where every detail is crafted to make your stay unforgettable.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-4">
              <div>
                <div className="text-3xl font-bold text-gray-800">150+</div>
                <div className="text-sm text-gray-500">Luxury Rooms</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">4.9★</div>
                <div className="text-sm text-gray-500">Guest Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">24/7</div>
                <div className="text-sm text-gray-500">Concierge Service</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-amber-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-amber-200 flex items-center gap-2">
                Book Your Stay
                <BsArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center gap-2">
                <BiCalendar className="w-5 h-5" />
                Check Availability
              </button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FcWiFiLogo className="w-5 h-5 text-amber-600" />
                <span className="text-sm">Free WiFi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaUtensilSpoon className="w-5 h-5 text-amber-600" />
                <span className="text-sm">Gourmet Dining</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaUserSecret className="w-5 h-5 text-amber-600" />
                <span className="text-sm">Event Spaces</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-amber-200/30 to-amber-100/30 rounded-3xl p-8 backdrop-blur-sm border border-amber-200/50">
              <div className="aspect-square relative">
                {/* Decorative Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-amber-400/20 rounded-full animate-pulse"></div>
                </div>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                      <BiBed className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Premium Suite</h4>
                    <p className="text-xs text-gray-500">Ocean view • 65m²</p>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform -rotate-3 mt-8 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                      <FaUtensils className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Fine Dining</h4>
                    <p className="text-xs text-gray-500">Michelin starred</p>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform rotate-2 -mt-4 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                      <FaMapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Prime Location</h4>
                    <p className="text-xs text-gray-500">City center</p>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                      <BiPhone className="w-6 h-6 text-amber-600 rotate-12"/>
                    </div>
                    <h4 className="font-semibold text-gray-800">24/7 Service</h4>
                    <p className="text-xs text-gray-500">Concierge</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 animate-bounce-slow">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">1,200+</p>
                  <p className="text-xs text-gray-500">Happy Guests</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <BiStar key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent"></div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeHero;