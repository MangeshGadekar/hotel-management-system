import React, { useRef } from 'react'
import ReviewCard from './Review'
import reviewData from '../../config/Review.json'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { flower_Image } from '../../assets'

const ReviewComponent = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -450 : 450,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-[7em]">
      {/* Header Section with Hotel Management Styling */}
      <div className="flex flex-col items-center mb-8 relative">
        
        <div className="relative">
          <img 
            src={flower_Image} 
            alt="flower" 
            className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-600 bg-amber-50 px-4 py-1 rounded-full inline-block">
            Guest Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
            Guest <span className="text-amber-600">Reviews</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-12 h-0.5 bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-12 h-0.5 bg-amber-400"></div>
          </div>
          <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Real reviews from real guests
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          </p>
        </div>
      </div>

      {/* Carousel Controls with Hotel Management Styling */}
      <div className="relative">
        {/* Left Navigation Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                    w-11 h-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-500
                    flex items-center justify-center
                    text-white shadow-lg shadow-amber-500/30
                    hover:from-amber-700 hover:to-amber-600
                    hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40
                    transition-all duration-300
                    border-2 border-white/20
                    backdrop-blur-sm"
          aria-label="Previous reviews"
        >
          <FaChevronLeft className="text-sm" />
        </button>

        {/* Right Navigation Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                    w-11 h-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-500
                    flex items-center justify-center
                    text-white shadow-lg shadow-amber-500/30
                    hover:from-amber-700 hover:to-amber-600
                    hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40
                    transition-all duration-300
                    border-2 border-white/20
                    backdrop-blur-sm"
          aria-label="Next reviews"
        >
          <FaChevronRight className="text-sm" />
        </button>

        {/* Reviews Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6
                    snap-x snap-mandatory
                    scrollbar-hide scroll-smooth
                    px-8
                    [&::-webkit-scrollbar]:hidden
                    -webkit-overflow-scrolling-touch"
        >
          {reviewData.reviews.map((review, index) => (
            <div
              key={review.id}
              className={`min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] snap-start
                        transition-all duration-300 hover:scale-[1.02]
                        ${index === 0 ? 'pl-4' : ''}
                        ${index === reviewData.reviews.length - 1 ? 'pr-4' : ''}`}
            >
              <ReviewCard
                name={review.user.name}
                avatar={review.user.avatar}
                location={review.user.location}
                isVerified={review.user.isVerified}
                rating={review.rating}
                date={review.date.split("T")[0]}
                title={review.title}
                content={review.content}
                images={review.images}
                tags={review.tags}
                likes={review.likes}
                helpful={review.helpful}
                replies={review.replies}
                roomType={review.bookingDetails.roomType}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlays for scroll hints */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Bottom Decorative Element */}
      <div className="flex justify-center mt-6 gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
        <div className="w-8 h-0.5 bg-amber-300 self-center"></div>
        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
        <div className="w-8 h-0.5 bg-amber-300 self-center"></div>
        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
      </div>

      {/* Rating Summary Badge (Optional Hotel Management Touch) */}
      <div className="absolute bottom-4 right-8 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-amber-100 hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-amber-500">★</span>
          <span className="font-bold text-gray-800">4.8</span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span className="text-xs text-gray-500">{reviewData.reviews.length} Reviews</span>
      </div>
    </div>
  )
}

export default ReviewComponent