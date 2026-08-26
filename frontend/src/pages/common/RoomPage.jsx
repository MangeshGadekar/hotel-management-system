import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, 
  FaRegStar, 
  FaUser, 
  FaBed, 
  FaRulerCombined, 
  FaWifi, 
  FaTv, 
  FaSnowflake, 
  FaCoffee, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaShareAlt,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { MdLocationOn, MdPeople, MdKingBed } from 'react-icons/md';
import { BiArea, BiCheckCircle } from 'react-icons/bi';
import Rooms from '../../config/Room.json';

const RoomPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const roomId = Number(params.id);
  const room = Rooms.find((r) => r.id === roomId);
  
  // State for main image and thumbnail index
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Get icon for amenity with enhanced colors
  const getAmenityIcon = (amenity) => {
    const icons = {
      'WiFi': <FaWifi className="text-indigo-500" />,
      'TV': <FaTv className="text-gray-700" />,
      'AC': <FaSnowflake className="text-cyan-500" />,
      'Coffee': <FaCoffee className="text-amber-700" />,
      'Pool': <FaSnowflake className="text-sky-500" />,
      'Gym': <FaStar className="text-rose-500" />,
      'Spa': <FaStar className="text-purple-500" />,
      'Restaurant': <FaStar className="text-orange-500" />,
      'Parking': <FaCheckCircle className="text-emerald-500" />,
      'Pet Friendly': <FaHeart className="text-pink-500" />,
    };
    return icons[amenity] || <FaCheckCircle className="text-emerald-500" />;
  };

  // Navigation functions for images
  const nextImage = () => {
    setMainImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setMainImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">

      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Image Gallery */}
        <div className="relative mb-10">
          {/* Main Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/50">
            <img 
              src={room.images[mainImageIndex]} 
              alt={room.name} 
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Navigation Arrows */}
            {room.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/50 transition-all shadow-xl hover:scale-110"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/50 transition-all shadow-xl hover:scale-110"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {room.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                {mainImageIndex + 1} / {room.images.length}
              </div>
            )}
            
            {room.isFeatured && (
              <div className="absolute top-6 left-6 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl shadow-amber-500/30">
                <FaStar className="text-amber-900" /> Featured
              </div>
            )}
            
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-white/20 shadow-xl">
              <span className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.floor(room.rating) ? 'text-yellow-400' : 'text-yellow-400/30'} />
                  ))}
                </div>
                <span className="font-medium">{room.rating} <span className="text-white/70">({room.reviews} reviews)</span></span>
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {room.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 px-1">
              {room.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImageIndex(index)}
                  className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    mainImageIndex === index 
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105' 
                      : 'border-white/60 hover:border-indigo-300'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${room.name} - ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-500/5 p-7 border border-white/60">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 mb-2">{room.name}</h1>
                  <div className="flex flex-wrap items-center gap-5 text-gray-600">
                    <span className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full text-indigo-700">
                      <MdPeople className="text-indigo-500" /> {room.capacity} Guests
                    </span>
                    <span className="flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full text-purple-700">
                      <MdKingBed className="text-purple-500" /> {room.bedType}
                    </span>
                    <span className="flex items-center gap-2 bg-teal-50 px-4 py-1.5 rounded-full text-teal-700">
                      <BiArea className="text-teal-500" /> {room.size}
                    </span>
                  </div>
                </div>
                <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50/50 px-6 py-4 rounded-2xl border border-blue-100/50">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">${room.price}</div>
                  <div className="text-sm text-gray-500 font-medium">per night</div>
                </div>
              </div>

              <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-bold shadow-md ${
                room.isAvailable 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-emerald-500/30' 
                  : 'bg-gradient-to-r from-rose-400 to-red-400 text-white shadow-rose-500/30'
              }`}>
                {room.isAvailable ? (
                  <>
                    <FaCheckCircle className="text-white" /> Available Now
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-white" /> Not Available
                  </>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-500/5 p-7 border border-white/60">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
                  <FaMapMarkerAlt />
                </span>
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Description</span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg bg-gray-50/50 p-5 rounded-xl border border-gray-100">{room.description}</p>
            </div>

            {/* Amenities Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-500/5 p-7 border border-white/60">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                  <FaCheckCircle />
                </span>
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Amenities</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50/80 to-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{getAmenityIcon(amenity)}</span>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-500/15 p-7 sticky top-24 border border-white/80">
              <div className="border-b border-gray-100/80 pb-5 mb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">${room.price}</span>
                  <span className="text-gray-500 font-medium">/ night</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.floor(room.rating) ? 'text-yellow-400' : 'text-gray-300'} />
                  ))}
                  <span className="text-gray-600 ml-3 font-medium">({room.reviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-500" /> Check-in
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-500" /> Check-out
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <MdPeople className="text-indigo-500" /> Guests
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50">
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${
                    room.isAvailable 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-[1.02] active:scale-95 shadow-blue-500/30' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-gray-400/20'
                  }`}
                  disabled={!room.isAvailable}
                >
                  {room.isAvailable ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaCheckCircle /> Book Now
                    </span>
                  ) : 'Unavailable'}
                </button>

                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2 bg-gray-50/80 p-2 rounded-xl">
                  <FaClock className="text-indigo-400" /> Free cancellation up to 24 hours before check-in
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100/80">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50">
                    <FaPhone className="text-indigo-500 rotate-90" /> Call
                  </span>
                  <span className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50">
                    <FaEnvelope className="text-indigo-500" /> Message
                  </span>
                  <span className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50">
                    <FaShareAlt className="text-indigo-500" /> Share
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms Section */}
        <div className="mt-14">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-8 flex items-center gap-3">
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-2xl text-white shadow-lg shadow-pink-500/30">
              <FaHeart />
            </span>
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Rooms.filter(r => r.id !== room.id).slice(0, 3).map(similarRoom => (
              <div 
                key={similarRoom.id} 
                onClick={() => navigate(`/rooms/${similarRoom.id}`)}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-2 border border-white/60 cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={similarRoom.images[0]} 
                    alt={similarRoom.name} 
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {similarRoom.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      +{similarRoom.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">{similarRoom.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">${similarRoom.price}</span>
                    <span className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full text-sm font-semibold text-yellow-800">
                      <FaStar className="text-yellow-400" /> {similarRoom.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;