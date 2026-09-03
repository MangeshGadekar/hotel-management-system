import React from 'react'
import Amenities from '../../config/Amenities.json'

const MovingBelt = () => {
  return (
    <div className="relative px-3 mb-[4em] sm:px-4 py-5 sm:py-6 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 mt-8 sm:mt-12 md:mt-[5em] sm:mb-10 md:mb-12 overflow-hidden border-t-2 border-b-2 border-amber-600/50 shadow-lg shadow-amber-900/20">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.1) 0%, transparent 50%)`
        }}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.05) 10px, rgba(255,215,0,0.05) 20px)`
        }}></div>
      </div>

      {/* Top Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      
      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

      {/* Left Glow Effect */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-full bg-gradient-to-r from-amber-600/20 to-transparent pointer-events-none"></div>
      
      {/* Right Glow Effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-full bg-gradient-to-l from-amber-600/20 to-transparent pointer-events-none"></div>

      {/* Main Marquee Container */}
      <div className="relative flex animate-marquee whitespace-nowrap gap-8 sm:gap-12 md:gap-16 text-xs uppercase tracking-widest text-gray-400">
        {[...Amenities.amenities, ...Amenities.amenities].map((amenity, index) => (
          <span 
            key={index} 
            className="flex items-center gap-3 sm:gap-4 text-white transition-all duration-300 hover:scale-110 hover:text-amber-300 cursor-default group"
          >
            {/* Icon Container with Glow */}
            {amenity.icon && (
              <span className="relative">
                <span className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full"></span>
                <span className="relative text-amber-300 text-base sm:text-lg md:text-xl group-hover:text-amber-200 transition-colors duration-300">
                  {amenity.icon}
                </span>
              </span>
            )}
            
            {/* Text with Gradient */}
            <span className="relative text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent group-hover:from-amber-200 group-hover:via-amber-50 group-hover:to-amber-200 transition-all duration-500">
              {amenity.name || amenity}
            </span>

            {/* Decorative Diamond Separator */}
            {index < Amenities.amenities.length * 2 - 1 && (
              <span className="text-amber-600/50 text-xs mx-1">◆</span>
            )}
          </span>
        ))}
      </div>

      {/* Floating Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-amber-300/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-amber-500/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-amber-400/40 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-2 left-4 text-amber-500/30 text-xs">✦</div>
      <div className="absolute top-2 right-4 text-amber-500/30 text-xs">✦</div>
      <div className="absolute bottom-2 left-4 text-amber-500/30 text-xs">✦</div>
      <div className="absolute bottom-2 right-4 text-amber-500/30 text-xs">✦</div>
    </div>
  )
}

export default MovingBelt