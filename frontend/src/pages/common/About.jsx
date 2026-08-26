import React from 'react';
import { FaHotel, FaUsers, FaStar, FaAward, FaCoffee, FaWifi, FaSwimmingPool, FaDumbbell, FaConciergeBell, FaUtensils, FaParking, FaSnowflake, FaCrown, FaLeaf, FaClock, FaQuoteLeft, FaQuoteRight, FaPhone } from 'react-icons/fa';
import { flower_Image } from '../../assets';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Luxury Hotel Styling */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 mb-16 shadow-2xl shadow-amber-900/20">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.3) 0%, transparent 50%)`
            }}></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,215,0,0.05) 20px, rgba(255,215,0,0.05) 40px)`
            }}></div>
          </div>

          {/* Decorative Gold Lines */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          {/* Floating Decorations */}
          <div className="absolute top-8 left-8 text-amber-400/30 text-4xl">✦</div>
          <div className="absolute top-8 right-8 text-amber-400/30 text-4xl">✦</div>
          <div className="absolute bottom-8 left-8 text-amber-400/30 text-4xl">✦</div>
          <div className="absolute bottom-8 right-8 text-amber-400/30 text-4xl">✦</div>

          {/* Content */}
          <div className="relative px-6 py-20 md:py-28 text-center text-white">
            <div className="mb-6">
              <img 
                src={flower_Image} 
                alt="Paradise Hotel" 
                className="h-16 mx-auto opacity-90 filter brightness-200" 
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-300">Paradise</span> Hotel
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <FaCrown className="text-amber-400 text-2xl" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-amber-100 font-light">
              Where Luxury Meets Comfort — A Home Away From Home
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30">
                <FaStar className="text-amber-400" />
                <span className="font-semibold">4.8/5</span>
                <span className="text-amber-200/70 text-sm">Guest Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30">
                <FaAward className="text-amber-400" />
                <span className="font-semibold">25+</span>
                <span className="text-amber-200/70 text-sm">Awards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section with Premium Styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-amber-400/30 rounded-lg"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-amber-400/30 rounded-lg"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 h-80 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/30">
                    <FaHotel className="text-white text-4xl" />
                  </div>
                  <p className="text-gray-700 font-medium">Est. 1998</p>
                  <p className="text-sm text-gray-500">Miami Beach, Florida</p>
                  <button className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium border border-amber-600/30 px-6 py-2 rounded-full hover:bg-amber-50 transition">
                    Explore Gallery →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent"></div>
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.2em]">Our Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6 leading-tight">
              A Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Excellence</span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="relative pl-6 border-l-4 border-amber-400">
                <FaQuoteLeft className="absolute -left-2 -top-1 text-amber-400/30 text-sm" />
                Founded in 1998, Paradise Hotel has been a beacon of luxury and hospitality in Miami Beach for over two decades. What started as a small family-owned boutique hotel has grown into a premier destination for travelers seeking the perfect blend of comfort, elegance, and personalized service.
              </p>
              <p>
                Our commitment to excellence has earned us numerous accolades and a loyal guest base that returns year after year. We believe that every guest deserves a memorable experience, and we go above and beyond to ensure your stay is nothing short of extraordinary.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2">
                  <FaStar className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">4.8/5</p>
                  <p className="text-xs text-gray-500">Guest Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2">
                  <FaAward className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">25+</p>
                  <p className="text-xs text-gray-500">Awards Won</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2">
                  <FaClock className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">27 Years</p>
                  <p className="text-xs text-gray-500">of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision with Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-amber-200 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform duration-300">
                <FaHotel className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide an unparalleled hospitality experience that exceeds guest expectations through exceptional service, luxurious accommodations, and attention to every detail.
              </p>
              <div className="mt-4 flex items-center gap-2 text-amber-600">
                <span className="text-sm font-medium">Learn More</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-amber-200 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-amber-100/50 to-transparent rounded-full -ml-16 -mb-16"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the world's most beloved luxury hotel brand, creating unforgettable memories for our guests while setting new standards in sustainable hospitality.
              </p>
              <div className="mt-4 flex items-center gap-2 text-amber-600">
                <span className="text-sm font-medium">Learn More</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section with Enhanced Styling */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <img src={flower_Image} alt="" className='h-10 opacity-80' />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.3em]">Luxury Amenities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Facilities</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2">
              Everything you need for a perfect stay, all under one roof
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: FaSwimmingPool, label: 'Outdoor Pool', color: 'blue', desc: 'Infinity pool with ocean view' },
              { icon: FaWifi, label: 'High-Speed WiFi', color: 'purple', desc: '100Mbps dedicated line' },
              { icon: FaDumbbell, label: 'Fitness Center', color: 'red', desc: 'State-of-the-art equipment' },
              { icon: FaUtensils, label: 'Fine Dining', color: 'orange', desc: 'Michelin-starred cuisine' },
              { icon: FaConciergeBell, label: 'Concierge Service', color: 'green', desc: '24/7 personal assistance' },
              { icon: FaCoffee, label: 'Coffee Bar', color: 'brown', desc: 'Premium artisan coffee' },
              { icon: FaParking, label: 'Valet Parking', color: 'gray', desc: 'Secure & complimentary' },
              { icon: FaSnowflake, label: 'Air Conditioning', color: 'cyan', desc: 'Climate-controlled rooms' },
            ].map((amenity, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-amber-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`bg-${amenity.color}-50 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <amenity.icon className={`text-${amenity.color}-600 text-3xl`} />
                </div>
                <p className="text-gray-800 font-semibold text-sm">{amenity.label}</p>
                <p className="text-gray-400 text-xs mt-1">{amenity.desc}</p>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-amber-400 text-xs">✦</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Section with Premium Styling */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <img src={flower_Image} alt="" className='h-10 opacity-80' />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.3em]">Executive Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Leadership</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2">
              Dedicated professionals committed to making your stay exceptional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'General Manager', years: '15 years', icon: FaCrown },
              { name: 'Michael Chen', role: 'Executive Chef', years: '12 years', icon: FaUtensils },
              { name: 'Emily Rodriguez', role: 'Guest Relations Director', years: '8 years', icon: FaConciergeBell },
            ].map((member, index) => (
              <div key={index} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center hover:-translate-y-3 border border-gray-100 hover:border-amber-200 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-t-3xl"></div>
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg shadow-amber-400/30 group-hover:shadow-xl group-hover:shadow-amber-400/40 transition-all">
                    <member.icon className="text-white text-4xl" />
                  </div>
                  <div className="absolute top-0 right-4 text-amber-400/20 text-2xl group-hover:scale-150 transition-transform duration-300">✦</div>
                </div>
                <h4 className="text-xl font-bold text-gray-800">{member.name}</h4>
                <p className="text-amber-600 font-semibold text-sm">{member.role}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <FaClock className="text-amber-400 text-xs" />
                  <p className="text-gray-500 text-sm">{member.years} of service</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-amber-600/50 text-xs">★ ★ ★ ★ ★</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section with Enhanced Styling */}
        <div className="relative mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 to-amber-50/30 rounded-3xl"></div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-amber-100">
            <div className="text-center group">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 group-hover:scale-110 transition-transform">500+</p>
              <div className="w-12 h-0.5 bg-amber-400 mx-auto my-2"></div>
              <p className="text-gray-600 font-medium">Happy Guests</p>
            </div>
            <div className="text-center group border-l border-amber-100">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 group-hover:scale-110 transition-transform">150+</p>
              <div className="w-12 h-0.5 bg-amber-400 mx-auto my-2"></div>
              <p className="text-gray-600 font-medium">Luxury Rooms</p>
            </div>
            <div className="text-center group border-l border-amber-100">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 group-hover:scale-110 transition-transform">98%</p>
              <div className="w-12 h-0.5 bg-amber-400 mx-auto my-2"></div>
              <p className="text-gray-600 font-medium">Satisfaction Rate</p>
            </div>
            <div className="text-center group border-l border-amber-100">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 group-hover:scale-110 transition-transform">25+</p>
              <div className="w-12 h-0.5 bg-amber-400 mx-auto my-2"></div>
              <p className="text-gray-600 font-medium">Awards Won</p>
            </div>
          </div>
        </div>

        {/* CTA Section with Premium Styling */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 p-12 md:p-16 text-center text-white shadow-2xl shadow-amber-900/30">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,215,0,0.2) 0%, transparent 50%)`
            }}></div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 left-8 text-amber-400/20 text-5xl">✦</div>
          <div className="absolute top-4 right-8 text-amber-400/20 text-5xl">✦</div>
          <div className="absolute bottom-4 left-8 text-amber-400/20 text-5xl">✦</div>
          <div className="absolute bottom-4 right-8 text-amber-400/20 text-5xl">✦</div>
          
          <div className="relative">
            <FaCrown className="text-amber-300 text-4xl mx-auto mb-4" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience <span className="text-amber-200">Paradise</span>?
            </h3>
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
              Book your stay today and discover why guests return to us year after year.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="group bg-white text-amber-700 hover:bg-amber-50 font-semibold py-4 px-10 rounded-full transition duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center gap-3">
                <span>Book Now</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="group border-2 border-white/50 text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-full transition duration-300 flex items-center gap-3 backdrop-blur-sm">
                <FaPhone className="text-amber-300 rotate-90" />
                <span>Contact Us</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-amber-200/50 text-sm">
              <span className="flex items-center gap-1">
                <FaLeaf className="text-amber-300" /> Eco-Friendly
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FaStar className="text-amber-300" /> 4.8/5 Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FaAward className="text-amber-300" /> Award-Winning
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;