import React from 'react';
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
  FaArrowUp
} from 'react-icons/fa';
import { MdCopyright } from 'react-icons/md';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaHotel className="text-amber-400 text-3xl" />
              <span className="text-white text-2xl font-bold">आतिथ्य</span>
            </div>
            <p className="text-sm leading-relaxed">
              Experience unparalleled luxury and comfort at our world-class hotel. 
              We're dedicated to making your stay memorable.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Rooms & Suites
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Dining
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Spa & Wellness
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Events & Weddings
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors duration-300 text-sm">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Luxury Avenue, Beverly Hills, CA 90210</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-amber-400 flex-shrink-0 rotate-90" />
                <span className="text-sm">+1 (800) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-amber-400 flex-shrink-0" />
                <span className="text-sm">reservations@luxurystay.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-amber-400 flex-shrink-0" />
                <span className="text-sm">24/7 Front Desk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-center space-x-3">
              <FaCreditCard className="text-amber-400 text-xl" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FaShieldAlt className="text-amber-400 text-xl" />
              <span className="text-sm">Best Price Guarantee</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <FaHeadset className="text-amber-400 text-xl" />
              <span className="text-sm">24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-1 text-sm">
              <MdCopyright className="text-amber-400" />
              <span>{new Date().getFullYear()} LuxuryStay Hotel. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-amber-400 hover:bg-amber-500 text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <FaArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;