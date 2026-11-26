import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHotel,
  FaUsers,
  FaStar,
  FaAward,
  FaCoffee,
  FaWifi,
  FaPlaneArrival,
  FaConciergeBell,
  FaUtensils,
  FaParking,
  FaSnowflake,
  FaCrown,
  FaLeaf,
  FaClock,
  FaQuoteLeft,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaShieldAlt,
} from "react-icons/fa";
import { flower_Image } from "../../assets";

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const amenities = [
    {
      icon: FaPlaneArrival,
      label: "Airport & Station Transfers",
      desc: "Chauffeur pickups from Dr. Babasaheb Ambedkar Airport",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      icon: FaWifi,
      label: "High-Speed Fiber Wi-Fi",
      desc: "Dedicated 100 Mbps connectivity in all suites",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      icon: FaUtensils,
      label: "In-House Fine Dining",
      desc: "Authentic Vidarbha & multi-cuisine kitchen",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      icon: FaConciergeBell,
      label: "24/7 Concierge Desk",
      desc: "Round-the-clock travel & personal assistance",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      icon: FaCoffee,
      label: "Artisan Tea & Coffee Bar",
      desc: "Freshly brewed beverages served all day",
      bg: "bg-amber-100/70",
      text: "text-amber-800",
    },
    {
      icon: FaParking,
      label: "Secure Valet Parking",
      desc: "Complimentary covered & CCTV-monitored parking",
      bg: "bg-slate-100",
      text: "text-slate-700",
    },
    {
      icon: FaSnowflake,
      label: "Climate-Controlled Rooms",
      desc: "Quiet, individually air-conditioned luxury rooms",
      bg: "bg-cyan-50",
      text: "text-cyan-600",
    },
    {
      icon: FaShieldAlt,
      label: "Express Digital Check-In",
      desc: "Seamless online portal & instant GST invoicing",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  ];

  const leadership = [
    {
      name: "Rajesh Deshmukh",
      role: "General Manager",
      years: "15 years",
      specialty: "Guest Experience & Operations",
      icon: FaCrown,
    },
    {
      name: "Vikram Kulkarni",
      role: "Executive Chef",
      years: "12 years",
      specialty: "Regional & Continental Cuisine",
      icon: FaUtensils,
    },
    {
      name: "Ananya Joshi",
      role: "Guest Relations Director",
      years: "9 years",
      specialty: "Concierge & Corporate Stays",
      icon: FaConciergeBell,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Warm Amber & Gold Styling */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 mb-16 shadow-2xl shadow-amber-900/20">
          {/* Subtle Radial & Diagonal Gold Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(255,215,0,0.35) 0%, transparent 55%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,215,0,0.06) 20px, rgba(255,215,0,0.06) 40px)",
              }}
            />
          </div>

          {/* Top & Bottom Gold Accent Borders */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Corner Flourishes */}
          <div className="absolute top-6 left-8 text-amber-400/30 text-3xl select-none">✦</div>
          <div className="absolute top-6 right-8 text-amber-400/30 text-3xl select-none">✦</div>
          <div className="absolute bottom-6 left-8 text-amber-400/30 text-3xl select-none">✦</div>
          <div className="absolute bottom-6 right-8 text-amber-400/30 text-3xl select-none">✦</div>

          {/* Hero Content */}
          <div className="relative px-6 py-20 md:py-26 text-center text-white">
            <div className="mb-5">
              <img
                src={flower_Image}
                alt="Hotel Athitya"
                className="h-16 mx-auto opacity-95 filter brightness-200"
              />
            </div>

            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 mb-3">
              Luxury Stay &amp; Suites • Nagpur, Maharashtra
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-300">
                Hotel Athitya
              </span>
            </h1>

            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400" />
              <FaCrown className="text-amber-400 text-xl" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            <p className="text-lg md:text-2xl max-w-3xl mx-auto text-amber-100 font-light leading-relaxed">
              Where Warm Hospitality Meets Contemporary Comfort — Your
              Sanctuary in the Heart of Nagpur
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30 text-sm">
                <FaStar className="text-amber-400" />
                <span className="font-semibold">4.8 / 5</span>
                <span className="text-amber-200/80">Guest Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30 text-sm">
                <FaMapMarkerAlt className="text-amber-400" />
                <span className="font-semibold">Chandranagar, Nagpur</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-400/30 text-sm">
                <FaAward className="text-amber-400" />
                <span className="font-semibold">Trusted Hospitality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          {/* Left Heritage & Location Card */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-amber-400/40 rounded-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-amber-400/40 rounded-2xl pointer-events-none" />

            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-100">
              <div className="bg-gradient-to-br from-amber-100/80 via-amber-50 to-white p-10 text-center">
                <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-600/30">
                  <FaHotel className="text-white text-3xl" />
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  Hotel Athitya, Nagpur
                </h3>
                <p className="text-sm text-amber-700 font-medium mt-1">
                  Naik Nagar, Chandranagar, Rameshwari
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nagpur - 440027, Maharashtra
                </p>

                <div className="mt-6 pt-6 border-t border-amber-200/60 grid grid-cols-2 gap-4 text-left text-xs">
                  <div className="bg-white/90 p-3.5 rounded-xl border border-amber-100">
                    <span className="text-gray-400 block">Check-In / Out</span>
                    <strong className="text-gray-800 text-sm mt-0.5 block">
                      2:00 PM / 12:00 PM
                    </strong>
                  </div>
                  <div className="bg-white/90 p-3.5 rounded-xl border border-amber-100">
                    <span className="text-gray-400 block">Airport Access</span>
                    <strong className="text-gray-800 text-sm mt-0.5 block">
                      15 Mins Away
                    </strong>
                  </div>
                </div>

                <Link
                  to="/rooms"
                  className="mt-6 inline-flex items-center gap-2 text-amber-700 hover:text-white hover:bg-amber-700 text-sm font-semibold border border-amber-600/40 px-6 py-2.5 rounded-full transition duration-300"
                >
                  Explore Rooms &amp; Suites →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Narrative */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-600 to-transparent" />
              <span className="text-amber-700 font-semibold text-xs uppercase tracking-[0.25em]">
                Our Story
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6 leading-tight">
              A Legacy of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                Warmth &amp; Excellence
              </span>
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="relative pl-6 border-l-4 border-amber-500 italic text-gray-700">
                <FaQuoteLeft className="absolute -left-2 -top-1 text-amber-400/40 text-sm" />
                Guided by a passion for genuine care, Hotel Athitya was built to
                offer travelers in Nagpur a refined, peaceful stay where personal
                attention comes naturally.
              </p>
              <p>
                Conveniently located in Chandranagar, Rameshwari, our property
                serves business executives visiting MIHAN, families attending
                celebrations, and leisure travelers exploring the Orange City.
                From transparent online booking and customizable airport pickups
                to spotless rooms, every detail is designed around your comfort.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 bg-amber-50/80 px-4 py-3 rounded-2xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2 shrink-0">
                  <FaStar className="text-white text-xs" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">4.8/5</p>
                  <p className="text-[11px] text-gray-500">Guest Rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50/80 px-4 py-3 rounded-2xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2 shrink-0">
                  <FaClock className="text-white text-xs" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">24 / 7</p>
                  <p className="text-[11px] text-gray-500">Front Desk</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50/80 px-4 py-3 rounded-2xl border border-amber-100">
                <div className="bg-amber-600 rounded-full p-2 shrink-0">
                  <FaShieldAlt className="text-white text-xs" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">100%</p>
                  <p className="text-[11px] text-gray-500">GST Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-amber-100/80 hover:border-amber-300 hover:-translate-y-1.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/60 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/25 group-hover:scale-105 transition-transform duration-300">
                <FaHotel className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                To deliver an effortless, transparent, and deeply welcoming
                stay in Nagpur—combining immaculate rooms, prompt room service,
                and modern digital convenience for every guest.
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-amber-100/80 hover:border-amber-300 hover:-translate-y-1.5 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-amber-100/60 to-transparent rounded-full -ml-16 -mb-16" />
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/25 group-hover:scale-105 transition-transform duration-300">
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                To be Nagpur’s most trusted boutique hospitality address,
                setting the benchmark for genuine care, sustainable
                operations, and lasting guest relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400" />
              <img src={flower_Image} alt="" className="h-9 opacity-80" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <span className="text-amber-700 font-semibold text-xs uppercase tracking-[0.25em]">
              Comfort &amp; Convenience
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Thoughtful{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                Facilities
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2 text-sm sm:text-base">
              Everything you need for a seamless business trip or relaxing
              family stay
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center hover:-translate-y-1.5 border border-gray-100 hover:border-amber-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={`${amenity.bg} rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <amenity.icon className={`${amenity.text} text-2xl`} />
                </div>
                <p className="text-gray-800 font-bold text-sm">
                  {amenity.label}
                </p>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                  {amenity.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400" />
              <img src={flower_Image} alt="" className="h-9 opacity-80" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <span className="text-amber-700 font-semibold text-xs uppercase tracking-[0.25em]">
              Hospitality Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Meet Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                Leadership
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2 text-sm sm:text-base">
              Dedicated professionals ensuring every stay at Hotel Athitya is
              memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-500 p-8 text-center hover:-translate-y-2 border border-gray-100 hover:border-amber-200 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 rounded-t-3xl" />
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <member.icon className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">
                  {member.name}
                </h4>
                <p className="text-amber-700 font-semibold text-sm mt-0.5">
                  {member.role}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {member.specialty}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <FaClock className="text-amber-500" />
                  <span>{member.years} in hospitality</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-amber-100">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                2,500+
              </p>
              <div className="w-10 h-0.5 bg-amber-400 mx-auto my-2.5" />
              <p className="text-gray-600 font-medium text-sm">Happy Guests</p>
            </div>
            <div className="text-center md:border-l border-amber-100">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                4.8★
              </p>
              <div className="w-10 h-0.5 bg-amber-400 mx-auto my-2.5" />
              <p className="text-gray-600 font-medium text-sm">Guest Rating</p>
            </div>
            <div className="text-center md:border-l border-amber-100">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                98%
              </p>
              <div className="w-10 h-0.5 bg-amber-400 mx-auto my-2.5" />
              <p className="text-gray-600 font-medium text-sm">
                Repeat Visitors
              </p>
            </div>
            <div className="text-center md:border-l border-amber-100">
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                24/7
              </p>
              <div className="w-10 h-0.5 bg-amber-400 mx-auto my-2.5" />
              <p className="text-gray-600 font-medium text-sm">Concierge Desk</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 p-10 md:p-16 text-center text-white shadow-2xl shadow-amber-900/30">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, rgba(255,215,0,0.25) 0%, transparent 55%)",
            }}
          />

          <div className="relative">
            <FaCrown className="text-amber-300 text-4xl mx-auto mb-4" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience{" "}
              <span className="text-amber-200">Hotel Athitya</span>?
            </h3>
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-base md:text-lg">
              Book directly on our portal for instant room confirmation,
              airport pickup add-ons, and zero hidden booking fees.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/rooms"
                className="group bg-white text-amber-800 hover:bg-amber-50 font-bold py-3.5 px-9 rounded-full transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-sm"
              >
                <span>Book Your Stay</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
              <a
                href="tel:+919373369332"
                className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold py-3.5 px-9 rounded-full transition duration-300 flex items-center gap-3 backdrop-blur-sm text-sm"
              >
                <FaPhone className="text-amber-300 rotate-90" />
                <span>+91 93733 69332</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-amber-200/80 text-xs">
              <span className="flex items-center gap-1.5">
                <FaLeaf className="text-amber-300" /> Eco-Conscious Stays
              </span>
              <span>•</span>
              <a
                href="mailto:athitya@gmail.com"
                className="flex items-center gap-1.5 hover:text-white transition"
              >
                <FaEnvelope className="text-amber-300" /> athitya@gmail.com
              </a>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-amber-300" /> Rameshwari, Nagpur
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;