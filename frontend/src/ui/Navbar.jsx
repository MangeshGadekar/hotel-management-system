import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom"; // Change this import
import {
  FaBars,
  FaTimes,
  FaUser,
  FaBell,
  FaPhone,
  FaClock,
} from "react-icons/fa";
import { MdOutlineLocalHotel } from "react-icons/md";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Hide/show navbar on scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  // Active link styling function
  const getActiveClass = ({ isActive }) => 
    isActive ? "text-amber-600 font-semibold" : "text-gray-600 hover:text-amber-600 transition-colors font-medium";

  return (
    <>
      <div 
        className={`bg-amber-600 text-white text-sm py-1.5 px-4 sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ position: "sticky", top: 0 }}
      >
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <FaPhone className="text-xs rotate-90" />
              <span>+1 (800) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-xs" />
              <span>Open 24/7 | Check-in: 2PM | Check-out: 12PM</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline">★ 4.8 (2.5k reviews)</span>
            <span className="bg-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
              Best Price Guarantee
            </span>
          </div>
        </div>
      </div>

      <nav 
        className={`bg-white shadow-md sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ position: "sticky", top: 0 }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center h-16 md:h-20">
            <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
              <MdOutlineLocalHotel className="text-amber-600 text-2xl md:text-3xl" />
              <span className="text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
                Hotel<span className="text-amber-600">Manager</span>
              </span>
            </NavLink>

            <div className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                <li>
                  <NavLink
                    to="/"
                    className={getActiveClass}
                    end
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/rooms-suites"
                    className={getActiveClass}
                  >
                    Rooms & Suits
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={getActiveClass}
                  >
                    About
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    className={getActiveClass}
                  >
                    Contact
                  </NavLink>
                </li>
              </ul>

              <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-amber-600 transition-colors relative">
                  <FaBell className="text-lg" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>
                <NavLink to="/login">
                  <button className="bg-amber-600 text-white px-5 py-2 rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-semibold">
                    <FaUser />
                    Sign In
                  </button>
                </NavLink>
              </div>
            </div>

            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 hover:text-amber-600 transition-colors ml-auto"
            >
              {isOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>

          <div
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              isOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="flex flex-col gap-3">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => 
                    `block font-medium py-2 px-3 hover:bg-amber-50 rounded-lg transition-colors ${
                      isActive 
                        ? "text-amber-600 font-semibold bg-amber-50" 
                        : "text-gray-600 hover:text-amber-600"
                    }`
                  }
                  onClick={toggleMenu}
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/rooms-suites"
                  className={({ isActive }) => 
                    `block font-medium py-2 px-3 hover:bg-amber-50 rounded-lg transition-colors ${
                      isActive 
                        ? "text-amber-600 font-semibold bg-amber-50" 
                        : "text-gray-600 hover:text-amber-600"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Rooms & Suits
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => 
                    `block font-medium py-2 px-3 hover:bg-amber-50 rounded-lg transition-colors ${
                      isActive 
                        ? "text-amber-600 font-semibold bg-amber-50" 
                        : "text-gray-600 hover:text-amber-600"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => 
                    `block font-medium py-2 px-3 hover:bg-amber-50 rounded-lg transition-colors ${
                      isActive 
                        ? "text-amber-600 font-semibold bg-amber-50" 
                        : "text-gray-600 hover:text-amber-600"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Contact
                </NavLink>
              </li>
              <li className="pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-3">
                    <button className="text-gray-600 hover:text-amber-600 transition-colors relative">
                      <FaBell className="text-lg" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        3
                      </span>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaPhone className="text-amber-600 rotate-90" />
                      <span>+1 (800) 123-4567</span>
                    </div>
                  </div>
                  <NavLink to="/login" onClick={toggleMenu}>
                    <button className="bg-amber-600 text-white px-6 py-2.5 rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm font-semibold w-full">
                      <FaUser />
                      Sign In
                    </button>
                  </NavLink>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;