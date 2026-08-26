import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaCrown,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaParking,
  FaWifi,
  FaSwimmingPool,
  FaDumbbell,
} from "react-icons/fa";
import { flower_Image } from "../../assets";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Luxury Styling */}
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <FaCrown className="text-amber-900 text-9xl" />
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <img
                src={flower_Image}
                alt="Paradise Hotel"
                className="h-12 opacity-90"
              />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
            
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-[0.3em] bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 inline-block">
              Contact Us
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mt-4 mb-4 tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Touch</span>
            </h1>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
              We're here to make your stay memorable. Reach out to us for
              reservations, inquiries, or any assistance.
            </p>
            
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info Section with Premium Styling */}
          <div className="space-y-6">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 border border-gray-100 hover:border-amber-200 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50/50 to-transparent rounded-full -mt-32 -mr-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tl from-amber-50/30 to-transparent rounded-full -mb-24 -ml-24"></div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                  <span className="bg-gradient-to-br from-amber-600 to-amber-700 p-3 rounded-2xl mr-4 shadow-lg shadow-amber-600/30">
                    <FaPhone className="text-white text-xl rotate-90" />
                  </span>
                  <span>Contact Information</span>
                  <span className="ml-auto text-amber-400/30">✦</span>
                </h2>

                <div className="space-y-3">
                  {[
                    { icon: FaPhone, label: 'Phone', value: '+1 (555) 123-4567', sub: 'Available 24/7', color: 'blue', classNameRotate : 'rotate-90' },
                    { icon: FaWhatsapp, label: 'WhatsApp', value: '+1 (555) 987-6543', sub: 'Quick response within minutes', color: 'green' },
                    { icon: FaEnvelope, label: 'Email', value: 'reservations@hotelparadise.com', sub: 'We reply within 24 hours', color: 'red' },
                    { icon: FaMapMarkerAlt, label: 'Address', value: '123 Paradise Avenue, Miami Beach, FL 33139', sub: 'Prime location in South Beach', color: 'purple' },
                    { icon: FaClock, label: 'Front Desk Hours', value: 'Open 24 hours / 7 days', sub: 'Check-in: 3:00 PM | Check-out: 11:00 AM', color: 'orange' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className={`group flex items-start space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-transparent transition-all duration-300 cursor-pointer border border-transparent hover:border-amber-200`}
                    >
                      <div className={`bg-${item.color}-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`text-${item.color}-600 text-xl ${item.classNameRotate}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                        <p className="text-gray-700 font-medium">{item.value}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaArrowRight className="text-amber-400 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-6 border-t-2 border-gray-100">
                  <p className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-amber-400"></span>
                    Follow Us
                    <span className="w-8 h-0.5 bg-amber-400"></span>
                  </p>
                  <div className="flex space-x-3">
                    {[
                      { icon: FaFacebookF, label: 'Facebook', color: 'blue' },
                      { icon: FaInstagram, label: 'Instagram', color: 'pink' },
                      { icon: FaTwitter, label: 'Twitter', color: 'sky' },
                      { icon: FaWhatsapp, label: 'WhatsApp', color: 'green' },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href="#"
                        className={`group bg-${social.color}-50 p-3.5 rounded-2xl hover:bg-gradient-to-br hover:from-${social.color}-500 hover:to-${social.color}-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-${social.color}-500/30`}
                        aria-label={social.label}
                      >
                        <social.icon className={`text-${social.color}-600 group-hover:text-white transition-colors text-lg`} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form with Premium Styling */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 border border-gray-100 hover:border-amber-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full"></div>
            
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-br from-amber-600 to-amber-700 p-3 rounded-2xl shadow-lg shadow-amber-600/30">
                  <FaEnvelope className="text-white text-xl" />
                </span>
                Send Us a Message
                <span className="ml-auto text-amber-400/30">✦</span>
              </h2>
              
              <form className="space-y-5">
                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="text-amber-500">●</span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 hover:border-amber-300"
                  />
                </div>

                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="text-amber-500">●</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 hover:border-amber-300"
                  />
                </div>

                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="text-amber-500">●</span>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 hover:border-amber-300"
                  />
                </div>

                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="text-amber-500">●</span>
                    Subject
                  </label>
                  <select className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 hover:border-amber-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:12px_12px]">
                    <option>Room Reservation</option>
                    <option>Special Requests</option>
                    <option>Events & Weddings</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <span className="text-amber-500">●</span>
                    Message
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell us how we can help you..."
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 hover:border-amber-300 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="group w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-600/30 flex items-center justify-center space-x-3"
                >
                  <FaEnvelope className="text-white group-hover:rotate-12 transition-transform" />
                  <span>Send Message</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-gray-400 text-center mt-2">
                  <FaCheck className="inline mr-1 text-amber-500" />
                  We'll respond within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section with Enhanced Styling */}
        <div className="mt-12 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-amber-500/20 to-amber-400/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
            <div className="h-72 bg-gradient-to-br from-amber-100/50 to-amber-50 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,215,0,0.2) 0%, transparent 50%)`
              }}></div>
              
              <div className="text-center relative">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-600/30">
                  <FaMapMarkerAlt className="text-white text-3xl" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">Google Maps Integration</p>
                <p className="text-gray-500 text-sm">123 Paradise Avenue, Miami Beach, FL 33139</p>
                <button className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium border-2 border-amber-600/30 px-6 py-2 rounded-full hover:bg-amber-50 transition-all hover:border-amber-600">
                  View on Maps →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards with Premium Styling */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FaClock, label: 'Front Desk Service', value: '24/7', desc: 'Always here for you' },
            { icon: FaWifi, label: 'Free Wi-Fi', value: 'High-Speed', desc: 'Throughout the hotel' },
            { icon: FaSwimmingPool, label: 'Outdoor Pool', value: 'Heated', desc: 'Open year-round' },
            { icon: FaStar, label: 'Guest Rating', value: '4.8/5', desc: 'Based on 500+ reviews' },
          ].map((item, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 text-center border border-gray-100 hover:border-amber-200 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <item.icon className="text-amber-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">{item.value}</p>
              <p className="text-gray-700 font-semibold text-sm mt-1">{item.label}</p>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FaParking, label: 'Valet Parking' },
            { icon: FaDumbbell, label: 'Fitness Center' },
            { icon: FaPhone, label: 'Concierge', classRotate: 'rotate-90' },
            { icon: FaCheck, label: 'Best Rate Guarantee' },
          ].map((service, index) => (
            <div key={index} className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-amber-200 transition-all hover:shadow-md">
              <service.icon className={`text-amber-500 text-sm ${service.classRotate}` } />
              <span className="text-gray-700 text-sm font-medium">{service.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;