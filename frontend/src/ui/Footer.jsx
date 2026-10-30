import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCreditCard,
  FaShieldAlt,
  FaHeadset,
  FaHotel,
  FaArrowUp,
} from "react-icons/fa";
import { MdCopyright } from "react-icons/md";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaHotel className="text-amber-400 text-3xl" />
              <span className="text-white text-2xl font-bold">
                Hotel <span className="text-amber-400">Athitya</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Experience unparalleled luxury and warm Indian hospitality at Hotel Athitya (आतिथ्य). Dedicated to making your stay memorable.
            </p>
            <div className="flex space-x-4 pt-2 text-gray-400">
              <a href="#" className="hover:text-amber-400 transition-colors">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-amber-400 transition-colors">
                  Rooms &amp; Suites
                </Link>
              </li>
              <li>
                <Link to="/manage-booking" className="hover:text-amber-400 transition-colors">
                  Manage Booking
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Guest Support */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">Guest Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/manage-booking" className="hover:text-amber-400 transition-colors">
                  Self-Service Check-In / Status
                </Link>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Cancellation Policy
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4">Contact Hotel</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-amber-400 mt-1 flex-shrink-0" />
                <span>Nagpur, Maharashtra, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-amber-400 flex-shrink-0 rotate-90" />
                <span>+91 93733 69332</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-amber-400 flex-shrink-0" />
                <span>reservations@athitya.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-amber-400 flex-shrink-0" />
                <span>24/7 Concierge &amp; Reception</span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-400">
            <div className="flex items-center justify-center space-x-3">
              <FaCreditCard className="text-amber-400 text-lg" />
              <span className="text-xs">Secure Online Payments</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FaShieldAlt className="text-amber-400 text-lg" />
              <span className="text-xs">Official Best Tariff Guarantee</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FaHeadset className="text-amber-400 text-lg" />
              <span className="text-xs">24/7 Guest Assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <MdCopyright className="text-amber-400 text-sm" />
              <span>{new Date().getFullYear()} Hotel Athitya. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Privacy
              </span>
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Terms
              </span>
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Sitemap
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 cursor-pointer"
        aria-label="Scroll to top"
      >
        <FaArrowUp size={16} />
      </button>
    </footer>
  );
};

export default Footer;