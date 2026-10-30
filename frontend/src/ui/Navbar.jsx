import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdOutlineLocalHotel } from "react-icons/md";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    let ticking = false;

    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Require at least 12px of intentional scroll before toggling
      if (scrollDifference < 12) {
        ticking = false;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 90) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(controlNavbar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [lastScrollY]);

  const getActiveClass = ({ isActive }) =>
    isActive
      ? "text-amber-600 font-semibold"
      : "text-gray-600 hover:text-amber-600 transition-colors font-medium";

  return (
    <nav
      className={`bg-white shadow-xs border-b border-gray-100 sticky top-0 z-50 transition-transform duration-500 ease-out will-change-transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
            <MdOutlineLocalHotel className="text-amber-600 text-2xl md:text-3xl" />
            <span className="text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
              Hotel<span className="text-amber-600"> Athitya</span>
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8 text-sm">
              <li>
                <NavLink to="/" className={getActiveClass} end>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/rooms" className={getActiveClass}>
                  Rooms &amp; Suites
                </NavLink>
              </li>
              <li>
                <NavLink to="/manage-booking" className={getActiveClass}>
                  Manage Booking
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={getActiveClass}>
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={getActiveClass}>
                  Contact
                </NavLink>
              </li>
            </ul>

            <NavLink to="/rooms">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer">
                Book Now
              </button>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-amber-600 transition-colors ml-auto p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-96 opacity-100 py-4 border-t border-gray-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-2">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block font-medium py-2 px-3 rounded-lg text-sm transition-colors ${
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
                to="/rooms"
                className={({ isActive }) =>
                  `block font-medium py-2 px-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "text-amber-600 font-semibold bg-amber-50"
                      : "text-gray-600 hover:text-amber-600"
                  }`
                }
                onClick={toggleMenu}
              >
                Rooms &amp; Suites
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/manage-booking"
                className={({ isActive }) =>
                  `block font-medium py-2 px-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "text-amber-600 font-semibold bg-amber-50"
                      : "text-gray-600 hover:text-amber-600"
                  }`
                }
                onClick={toggleMenu}
              >
                Manage Booking
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block font-medium py-2 px-3 rounded-lg text-sm transition-colors ${
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
                  `block font-medium py-2 px-3 rounded-lg text-sm transition-colors ${
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

            <li className="pt-2">
              <NavLink to="/rooms" onClick={toggleMenu}>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors w-full cursor-pointer">
                  Book Your Stay
                </button>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;