import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaCoffee,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaShareAlt,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaSwimmingPool,
  FaDumbbell,
  FaSpa,
  FaUtensils,
  FaParking,
  FaPaw,
} from 'react-icons/fa';
import { MdPeople, MdKingBed } from 'react-icons/md';
import { BiArea } from 'react-icons/bi';
import Rooms from '../../config/Room.json';
import RoomCard from '../../components/common/RoomCard';

/* ----------------------------- Small Components ---------------------------- */

const StarRating = ({ rating, size = 'text-base', showEmpty = true }) => (
  <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? 'text-yellow-400'
            : showEmpty
            ? 'text-gray-300'
            : 'hidden'
        }`}
      />
    ))}
  </div>
);

const AMENITY_ICONS = {
  WiFi: <FaWifi className="text-indigo-500" />,
  TV: <FaTv className="text-gray-700" />,
  AC: <FaSnowflake className="text-cyan-500" />,
  Coffee: <FaCoffee className="text-amber-700" />,
  Pool: <FaSwimmingPool className="text-sky-500" />,
  Gym: <FaDumbbell className="text-rose-500" />,
  Spa: <FaSpa className="text-purple-500" />,
  Restaurant: <FaUtensils className="text-orange-500" />,
  Parking: <FaParking className="text-emerald-500" />,
  'Pet Friendly': <FaPaw className="text-pink-500" />,
};

const getAmenityIcon = (amenity) =>
  AMENITY_ICONS[amenity] || <FaCheckCircle className="text-emerald-500" />;

const SectionCard = ({ children, className = '' }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-500/5 p-7 border border-white/60 ${className}`}
  >
    {children}
  </div>
);

const SectionHeading = ({ icon, iconBg, children }) => (
  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
    <span
      className={`${iconBg} p-2 rounded-xl text-white shadow-lg`}
      aria-hidden="true"
    >
      {icon}
    </span>
    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
      {children}
    </span>
  </h2>
);

/* ------------------------------- Room Not Found ---------------------------- */

const RoomNotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
    <FaTimesCircle className="text-6xl text-rose-400" />
    <h1 className="text-2xl font-bold text-gray-700">Room not found</h1>
    <p className="text-gray-500">The room you're looking for doesn't exist.</p>
  </div>
);

/* --------------------------------- Main Page -------------------------------- */

const RoomPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const roomId = Number(id);

  const room = useMemo(() => Rooms.find((r) => r.id === roomId), [roomId]);

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  // Hooks must be called unconditionally, so the guard comes after.
  if (!room) return <RoomNotFound />;

  const totalImages = room.images.length;

  const nextImage = () =>
    setMainImageIndex((prev) => (prev + 1) % totalImages);
  const prevImage = () =>
    setMainImageIndex((prev) => (prev - 1 + totalImages) % totalImages);

  const similarRooms = Rooms.filter((r) => r.id !== room.id).slice(0, 3);

  const handleBookNow = () => {
    if (!room.isAvailable) return;
    navigate(`/booking/${room.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* -------------------------- Image Gallery -------------------------- */}
        <div className="relative mb-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/50">
            <img
              src={room.images[mainImageIndex]}
              alt={`${room.name} – view ${mainImageIndex + 1}`}
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/50 transition-all shadow-xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/50 transition-all shadow-xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                  <FaChevronRight />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  {mainImageIndex + 1} / {totalImages}
                </div>
              </>
            )}

            {room.isFeatured && (
              <div className="absolute top-6 left-6 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl shadow-amber-500/30">
                <FaStar aria-hidden="true" /> Featured
              </div>
            )}

            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-3">
                <StarRating rating={room.rating} showEmpty={false} />
                <span className="font-medium">
                  {room.rating}{' '}
                  <span className="text-white/70">
                    ({room.reviews} reviews)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {totalImages > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 px-1">
              {room.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMainImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={mainImageIndex === index}
                  className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    mainImageIndex === index
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105'
                      : 'border-white/60 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${room.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ----------------------------- Left column ----------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <SectionCard>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 mb-2">
                    {room.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full text-indigo-700">
                      <MdPeople className="text-indigo-500" aria-hidden="true" />{' '}
                      {room.capacity} Guests
                    </span>
                    <span className="flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full text-purple-700">
                      <MdKingBed className="text-purple-500" aria-hidden="true" />{' '}
                      {room.bedType}
                    </span>
                    <span className="flex items-center gap-2 bg-teal-50 px-4 py-1.5 rounded-full text-teal-700">
                      <BiArea className="text-teal-500" aria-hidden="true" />{' '}
                      {room.size}
                    </span>
                  </div>
                </div>
                <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50/50 px-6 py-4 rounded-2xl border border-blue-100/50">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    ${room.price}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    per night
                  </div>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-bold shadow-md ${
                  room.isAvailable
                    ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-rose-400 to-red-400 text-white shadow-rose-500/30'
                }`}
              >
                {room.isAvailable ? (
                  <>
                    <FaCheckCircle aria-hidden="true" /> Available Now
                  </>
                ) : (
                  <>
                    <FaTimesCircle aria-hidden="true" /> Not Available
                  </>
                )}
              </div>
            </SectionCard>

            {/* Description */}
            <SectionCard>
              <SectionHeading
                icon={<FaMapMarkerAlt />}
                iconBg="bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30"
              >
                Description
              </SectionHeading>
              <p className="text-gray-700 leading-relaxed text-lg bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                {room.description}
              </p>
            </SectionCard>

            {/* Amenities */}
            <SectionCard>
              <SectionHeading
                icon={<FaCheckCircle />}
                iconBg="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
              >
                Amenities
              </SectionHeading>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50/80 to-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                  >
                    <span
                      className="text-2xl group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    >
                      {getAmenityIcon(amenity)}
                    </span>
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* --------------------------- Booking sidebar ---------------------- */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-500/15 p-7 sticky top-24 border border-white/80">
              <div className="border-b border-gray-100/80 pb-5 mb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    ${room.price}
                  </span>
                  <span className="text-gray-500 font-medium">/ night</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <StarRating rating={room.rating} />
                  <span className="text-gray-600 font-medium">
                    ({room.reviews} reviews)
                  </span>
                </div>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBookNow();
                }}
              >
                <div>
                  <label
                    htmlFor="check-in"
                    className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"
                  >
                    <FaCalendarAlt className="text-indigo-500" aria-hidden="true" />{' '}
                    Check-in
                  </label>
                  <input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="check-out"
                    className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"
                  >
                    <FaCalendarAlt className="text-indigo-500" aria-hidden="true" />{' '}
                    Check-out
                  </label>
                  <input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="guests"
                    className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"
                  >
                    <MdPeople className="text-indigo-500" aria-hidden="true" />{' '}
                    Guests
                  </label>
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!room.isAvailable}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${
                    room.isAvailable
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-[1.02] active:scale-95 shadow-blue-500/30'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-gray-400/20'
                  }`}
                >
                  {room.isAvailable ? (
                    <>
                      <FaCheckCircle aria-hidden="true" /> Book Now
                    </>
                  ) : (
                    'Unavailable'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2 bg-gray-50/80 p-2 rounded-xl">
                  <FaClock className="text-indigo-400" aria-hidden="true" /> Free
                  cancellation up to 24 hours before check-in
                </p>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100/80">
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50"
                  >
                    <FaPhone
                      className="text-indigo-500 rotate-90"
                      aria-hidden="true"
                    />{' '}
                    Call
                  </a>
                  <a
                    href="mailto:hello@example.com"
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50"
                  >
                    <FaEnvelope className="text-indigo-500" aria-hidden="true" />{' '}
                    Message
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: room.name,
                            url: window.location.href,
                          })
                          .catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                      }
                    }}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors bg-gray-50/80 px-4 py-2 rounded-xl hover:bg-indigo-50"
                  >
                    <FaShareAlt className="text-indigo-500" aria-hidden="true" />{' '}
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------- Similar Rooms -------------------------- */}
        {similarRooms.length > 0 && (
          <div className="mt-14">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-8 flex items-center gap-3">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-2xl text-white shadow-lg shadow-pink-500/30">
                <FaHeart aria-hidden="true" />
              </span>
              You Might Also Like
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarRooms.map((similarRoom) => (
                <RoomCard
                  key={similarRoom.id}
                  id={similarRoom.id}
                  name={similarRoom.name}
                  image={similarRoom.images[0]}
                  price={similarRoom.price}
                  rating={similarRoom.rating}
                  reviews={similarRoom.reviews}
                  capacity={similarRoom.capacity}
                  bedType={similarRoom.bedType}
                  size={similarRoom.size}
                  amenities={similarRoom.amenities}
                  description={similarRoom.description}
                  isAvailable={similarRoom.isAvailable}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;