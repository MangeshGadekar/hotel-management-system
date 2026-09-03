import React from "react";
import { 
  FaStar, 
  FaUsers, 
  FaShieldAlt, 
  FaArrowRight, 
  FaBed, 
  FaWifi, 
  FaCity, 
  FaCrown,
  FaClock,
  FaParking,
  FaSwimmingPool,
  FaDumbbell,
  FaConciergeBell,
  FaUtensils,
  FaCoffee,
  FaSnowflake,
  FaCheckCircle,
  FaHeart,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import { MdOutlineLocalHotel, MdRoomService, MdFamilyRestroom, MdKitchen, MdBathtub } from "react-icons/md";
import { RiHotelBedLine } from "react-icons/ri";
import { flower_Image } from "../../assets";
import Feature from "../../config/RoomFeatures.json";
import { GiPrivateFirstClass } from "react-icons/gi";
import { AiOutlineFolderView } from "react-icons/ai";
import ReviewComponent from "../../components/common/ReviewComponent";
import MovingBelt from '../../components/common/MovingBelt';
import HomeHero from "../../components/common/HomeHero";

const Home = () => {
  const iconMap = {
    FaBed: FaBed,
    FaCrown: FaCrown,
    FaWifi: FaWifi,
    FaUsers: FaUsers,
    FaStar: FaStar,
    BiSolidView: AiOutlineFolderView,
    GiPrivateFirstClass: GiPrivateFirstClass,
  };

  return (
    <>
   
     <HomeHero/>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">

      <div className="relative py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-transparent to-amber-50/30"></div>
        
        <div className="relative">
          <div className="flex items-center justify-center flex-col text-center mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <img
                src={flower_Image}
                alt=""
                className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain"
              />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.3em] bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
              Premium Features
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Us</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-12 h-0.5 bg-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-12 h-0.5 bg-amber-400"></div>
            </div>
            <p className="text-gray-600 mt-4 max-w-2xl">
              Discover why thousands of guests choose us for their perfect stay experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
            {Feature.map((feature) => {
              const IconComponent = iconMap[feature.iconName];
              return (
                <div 
                  key={feature.id} 
                  className={`group ${feature.bgColor} ${feature.borderColor} p-8 flex flex-col items-center text-center border-2 rounded-3xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-100/20 rounded-full"></div>
                  
                  <div className="relative">
                    <div className={`${feature.iconClass} w-16 h-16 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className={`${feature.titleColor} font-bold text-xl mb-2`}>
                      {feature.title}
                    </h3>
                    <p className={`${feature.descriptionColor} text-sm leading-relaxed`}>
                      {feature.description}
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-amber-500 text-xs">✦ Learn More</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats & Features Bar */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 py-8 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.3) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FaCheckCircle, label: 'Verified Reviews', value: '5,000+' },
              { icon: FaCrown, label: 'Award Winner', value: '25+ Awards' },
              { icon: FaUsers, label: 'Happy Guests', value: '10,000+' },
              { icon: FaHeart, label: 'Satisfaction Rate', value: '98%' },
            ].map((stat, index) => (
              <div key={index} className="text-center text-white group">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="text-amber-400 text-2xl group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-amber-200/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section with Context */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl"></div>
        <ReviewComponent />
      </div>

      {/* Moving Belt */}
      <MovingBelt />

      {/* Footer CTA Section */}
      <div className="relative bg-gradient-to-r from-amber-600 to-amber-800 py-12 mt-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,215,0,0.2) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-0.5 bg-amber-300/50"></div>
            <FaCrown className="text-amber-300 text-2xl" />
            <div className="w-12 h-0.5 bg-amber-300/50"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience <span className="text-amber-200">Luxury</span>?
          </h2>
          <p className="text-amber-100 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied guests and book your dream stay today
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="px-10 py-4 bg-white text-amber-700 font-bold rounded-2xl hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center gap-2">
              Book Now
              <FaArrowRight />
            </button>
            <button className="px-10 py-4 border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
              <FaPhone className="rotate-90"/>
              Contact Us
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-amber-200/50 text-sm">
            <span className="flex items-center gap-1">
              <FaCheckCircle className="text-amber-300" /> Best Price Guarantee
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-amber-300" /> Secure Booking
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaStar className="text-amber-300" /> 4.9/5 Rating
            </span>
          </div>
        </div>
      </div>
    </div>
     </>
  );
};

export default Home;