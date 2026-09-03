import RoomAndSuitHero from '../../components/common/RoomAndSuitHero'
import { flower_Image } from '../../assets'
import RoomCard from '../../components/common/RoomCard';
import Rooms from '../../config/Room.json';
import { useNavigate } from 'react-router-dom';
import MovingBelt from '../../components/common/MovingBelt';

const RoomsAndSuits = () => {

  const handleFavoriteToggle = (roomId) => {
    console.log(`Toggled favorite for room ${roomId}`);
    // You can implement your favorite logic here
  };

  const navigate = useNavigate()

  return (
    <>
      <RoomAndSuitHero/>

      {/* Enhanced Header Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 opacity-70"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col items-center justify-center py-6 sm:py-8 md:py-10 mt-3 sm:mt-5 px-4">
          <div className="relative group">
            <img 
              src={flower_Image} 
              alt="flower" 
              className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
            />
            {/* Glow effect behind flower */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20 blur-2xl -z-10 rounded-full scale-150"></div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2 text-center relative">
            Rooms & Suites
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full"></span>
          </h2>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center px-2 mt-2 relative">
            <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
              Luxury Rooms & Suites
            </span>
            {/* Decorative underline */}
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full"></span>
          </h1>
        </div>
      </div>

      {/* Description Section with Enhanced Styling */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-4">
        <div className="relative text-center px-2">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="w-32 h-32 border-4 border-amber-400 rounded-full"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed relative z-10 font-light tracking-wide">
            Experience comfort and elegance in our carefully curated selection of premium accommodations
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-5 relative z-10">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400 rounded-full shadow-lg shadow-amber-400/30 animate-pulse"></div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>
        </div>

        {/* Room Cards Grid with Enhanced Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mt-6 sm:mt-8">
          {Rooms.slice(0, 9).map((room, index) => (
            <div 
              key={room.id}
              className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-200/50"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <RoomCard 
                {...room}
                onFavoriteToggle={() => handleFavoriteToggle(room.id)}
              />
            </div>
          ))}
        </div>

        {/* Enhanced View All Button */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <div className="relative inline-block group">
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
            
            <button
              onClick={() => navigate("/rooms")}
              className="relative px-8 sm:px-10 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold rounded-full shadow-lg shadow-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/60 transition-all duration-300 hover:-translate-y-1 hover:scale-105 text-sm sm:text-base group overflow-hidden"
            >
              {/* Button shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              
              <span className="relative flex items-center gap-2">
                View All Rooms
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
            
            {/* Decorative sparkles */}
            <span className="absolute -top-2 -right-2 text-yellow-300 text-sm animate-bounce">✦</span>
            <span className="absolute -bottom-2 -left-2 text-orange-300 text-sm animate-bounce delay-75">✦</span>
          </div>
        </div>
      </div>
      
      {/* MovingBelt with enhanced styling wrapper */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent"></div>
        <MovingBelt/>
      </div>
          
    </>
  ) 
}

export default RoomsAndSuits