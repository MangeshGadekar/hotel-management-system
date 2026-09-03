
import { Hero_Image } from '../../assets';

const RoomAndSuitHero = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Hero_Image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
      </div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>


      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
        

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 hover:bg-white/20 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-sm font-medium text-amber-200">🏨 Luxury Hotel & Resort</span>
          </div>

          <h1 className="text-4xl md:text-6xl text-white lg:text-7xl font-bold leading-tight mb-4">
            Experience 
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 animate-gradient">
              Unmatched Hospitality
            </span>
          </h1>


          <p className="max-w-2xl mx-auto text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
            Book your perfect stay at <span className="text-amber-400 font-semibold">Grand Palace</span>. 
            Enjoy world-class amenities, breathtaking views, and exceptional service 
            that makes every moment memorable.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RoomAndSuitHero;