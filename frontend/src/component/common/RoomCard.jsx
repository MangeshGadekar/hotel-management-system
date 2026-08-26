import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaWifi, FaTv, FaSnowflake, FaCoffee, FaStar, FaArrowRight, FaCity } from 'react-icons/fa';
import { FiMaximize } from 'react-icons/fi';
import { MdBathtub, MdLiving, MdOutlineBalcony, MdOutlineCountertops, MdOutlineLiving } from 'react-icons/md';
import { FaKitchenSet } from 'react-icons/fa6';
import { PiChampagneLight, PiDesktopTowerFill } from 'react-icons/pi';
import { GrLounge } from 'react-icons/gr';
import { GiBathtub } from 'react-icons/gi';
import { BiFridge } from 'react-icons/bi';
import { TbGlassChampagne } from 'react-icons/tb';

const RoomCard = ({ 
  id,
  name = 'Deluxe Suite',
  image = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  price = 299,
  rating = 4.8,
  reviews = 124,
  capacity = 2,
  bedType = 'King Size',
  size = '45 sqm',
  amenities = ['WiFi', 'TV', 'AC', 'Coffee'],
  description = 'Spacious room with stunning city views, comfortable king-size bed, and modern amenities.',
  isAvailable = true
}) => {
  // Amenity icon mapping with colors
  const amenityConfig = {
    'WiFi': { icon: FaWifi, color: 'text-blue-500' },
    'TV': { icon: FaTv, color: 'text-purple-500' },
    'AC': { icon: FaSnowflake, color: 'text-cyan-500' },
    'Coffee': { icon: FaCoffee, color: 'text-amber-600' },
    'Mini Bar': { icon: PiChampagneLight, color: 'text-blue-600' },
    'Jacuzzi': { icon: MdBathtub, color: 'text-blue-600' },
    'Living Room': { icon: MdLiving, color: 'text-blue-600' },
    'Mini Fridge': { icon: BiFridge, color: 'text-blue-600' },
    'Bathtub': { icon: GiBathtub, color: 'text-blue-600' },
    'Balcony': { icon: MdOutlineBalcony, color: 'text-blue-600' },
    'Terrace': { icon: MdOutlineCountertops, color: 'text-blue-600' },
    'Living Area': { icon: MdOutlineLiving, color: 'text-blue-600' },
    'City View': { icon: FaCity, color: 'text-blue-600' },
    'Lounge': { icon: GrLounge, color: 'text-blue-600' },
    'Work Desk': { icon: PiDesktopTowerFill, color: 'text-blue-600' },
    'Kitchen': { icon: FaKitchenSet, color: 'text-blue-600' },
    'Champagne': { icon: TbGlassChampagne, color: 'text-blue-600' },
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 border border-gray-100/50">
      

      <div className={`absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
        isAvailable 
          ? 'bg-emerald-500/90 text-white' 
          : 'bg-rose-500/90 text-white'
      }`}>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-white'}`} />
          {isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>

     

      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <span className="text-white text-lg font-bold">${price}</span>
          <span className="text-white/60 text-xs ml-1">/ night</span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
          <FaStar className="text-yellow-400 w-3.5 h-3.5" />
          <span className="text-white text-sm font-semibold">{rating}</span>
          <span className="text-white/50 text-xs">({reviews} reviews)</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">
          {name}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[40px]">
          {description}
        </p>

        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <FaBed className="text-amber-500 w-4 h-4" />
            <span className="font-medium">{bedType}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <FaUsers className="text-amber-500 w-4 h-4" />
            <span className="font-medium">{capacity} Guests</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <FiMaximize className="text-amber-500 w-4 h-4" />
            <span className="font-medium">{size}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {amenities.map((amenity, index) => {
            const config = amenityConfig[amenity];
            const Icon = config?.icon || null;
            const color = config?.color || 'text-amber-500';
            
            return (
              <span 
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs rounded-full transition-colors duration-200 border border-gray-100"
              >
                {Icon && <Icon className={`${color} w-3.5 h-3.5`} />}
                <span className="font-medium">{amenity}</span>
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Link 
            to={`/rooms/${id}`}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            View Details
            <FaArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          
          {isAvailable && (
            <Link 
              to={`/booking/${id}`}
              className="px-5 py-2.5 border-2 border-amber-500 text-amber-500 text-sm font-semibold rounded-xl hover:bg-amber-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;