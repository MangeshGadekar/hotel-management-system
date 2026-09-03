import React from 'react'
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa'
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io'
import { MdVerified } from 'react-icons/md'

const ReviewCard = ({ 
  name = "John Doe",
  date = "March 15, 2026",
  rating = 5,
  review = "Amazing experience! The service was top-notch and the ambiance was perfect.",
  avatar = null,
  isVerified = false,
  isLiked = false,
  onLikeToggle = () => {},
  images = [],
  location = "New York, NY",
  hotelName = "Grand Plaza Hotel"
}) => {
  
  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half-star" className="text-yellow-400" />)
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />)
    }
    
    return stars
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto border border-gray-100">
      
     
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <FaUserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                {name}
              </h4>
              {isVerified && (
                <MdVerified className="text-blue-500 text-sm sm:text-base" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {location}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              {date}
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm font-medium text-gray-700">
            {hotelName}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              {rating}
            </span>
            <div className="flex gap-0.5">
              {renderStars(rating)}
            </div>
          </div>
        </div>
      </div>
     
      <div className="mt-3 sm:mt-4">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          "{review}"
        </p>
      </div>
      
      {images && images.length > 0 && (
        <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.slice(0, 4).map((img, index) => (
            <img 
              key={index}
              src={img}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
          {images.length > 4 && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                +{images.length - 4}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={onLikeToggle}
          className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-red-500 transition-colors duration-200 group"
        >
          {isLiked ? (
            <IoMdHeart className="text-red-500 text-xl sm:text-2xl" />
          ) : (
            <IoMdHeartEmpty className="text-xl sm:text-2xl group-hover:text-red-400 transition-colors" />
          )}
          <span className={isLiked ? "text-red-500" : ""}>
            {isLiked ? "Liked" : "Like"}
          </span>
        </button>
        
        <div className="flex gap-3 sm:gap-4">
          <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Reply
          </button>
          <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Share
          </button>
          <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Report
          </button>
        </div>
      </div>
      
    </div>
  )
}

export default ReviewCard