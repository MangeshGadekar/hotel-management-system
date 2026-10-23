import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaBed, FaUsers, FaWifi, FaTv, FaSnowflake, FaCoffee, FaStar,
  FaArrowLeft, FaCity, FaCheckCircle, FaTimesCircle, FaDoorOpen,
  FaTag, FaMoneyBillWave,
} from 'react-icons/fa';
import { FiMaximize } from 'react-icons/fi';
import {
  MdBathtub, MdLiving, MdOutlineBalcony, MdOutlineCountertops,
  MdOutlineLiving,
} from 'react-icons/md';
import { FaKitchenSet } from 'react-icons/fa6';
import { PiChampagneLight, PiDesktopTowerFill } from 'react-icons/pi';
import { GrLounge } from 'react-icons/gr';
import { GiBathtub } from 'react-icons/gi';
import { BiFridge } from 'react-icons/bi';
import { TbGlassChampagne } from 'react-icons/tb';
import useRoomStore from '../../app/useRoomStore';

const amenityConfig = {
  'Free Wi-Fi':          { icon: FaWifi,             color: 'text-blue-500' },
  'Wi-Fi':               { icon: FaWifi,             color: 'text-blue-500' },
  'Air Conditioning':    { icon: FaSnowflake,        color: 'text-cyan-500' },
  'AC':                  { icon: FaSnowflake,        color: 'text-cyan-500' },
  'Smart TV':            { icon: FaTv,               color: 'text-purple-500' },
  'TV':                  { icon: FaTv,               color: 'text-purple-500' },
  'Coffee':              { icon: FaCoffee,           color: 'text-amber-600' },
  'Mini Bar':            { icon: PiChampagneLight,   color: 'text-blue-600' },
  'Jacuzzi':             { icon: MdBathtub,          color: 'text-blue-600' },
  'Living Room':         { icon: MdLiving,           color: 'text-blue-600' },
  'Mini Fridge':         { icon: BiFridge,           color: 'text-blue-600' },
  'Bathtub':             { icon: GiBathtub,          color: 'text-blue-600' },
  'Balcony':             { icon: MdOutlineBalcony,   color: 'text-blue-600' },
  'Terrace':             { icon: MdOutlineCountertops, color: 'text-blue-600' },
  'Living Area':         { icon: MdOutlineLiving,    color: 'text-blue-600' },
  'City View':           { icon: FaCity,             color: 'text-blue-600' },
  'Lounge':              { icon: GrLounge,           color: 'text-blue-600' },
  'Work Desk':           { icon: PiDesktopTowerFill, color: 'text-blue-600' },
  'Kitchen':             { icon: FaKitchenSet,       color: 'text-blue-600' },
  'Champagne':           { icon: TbGlassChampagne,   color: 'text-blue-600' },
};

const Room = () => {
  const { roomNumber } = useParams();
  const getRoom = useRoomStore((s) => s.getRoom);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getRoom(roomNumber);
        if (!cancelled) setRoom(data);
      } catch (err) {
        console.error('Failed to load room:', err);
        if (!cancelled) setRoom(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [roomNumber, getRoom]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Loading room…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Room not found.</p>
        <Link to="/rooms" className="text-amber-600 font-semibold hover:underline">
          ← Back to rooms
        </Link>
      </div>
    );
  }

  const images        = Array.isArray(room.images) ? room.images.filter(Boolean) : [];
  const amenities     = Array.isArray(room.amenities) ? room.amenities : [];
  const price         = room.pricePerNight ?? room.price ?? 0;
  const isAvailable   = room.roomStatus === 'AVAILABLE';
  const roomTypeLabel = room.roomType?.replace(/_/g, ' ') ?? 'Room';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/rooms"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 mb-6 transition-colors"
      >
        <FaArrowLeft className="w-3 h-3" /> Back to rooms
      </Link>

      {/* ── Gallery ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
        <div className="lg:col-span-3 relative h-[360px] lg:h-[480px] rounded-2xl overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <img
              src={images[activeImg]}
              alt={`Room ${room.roomNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}

          <div className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
            isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
              {isAvailable ? 'Available' : 'Booked'}
            </span>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-24 h-24 lg:w-full lg:h-[calc((480px-24px)/2)] rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeImg
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main content: left info + right booking ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              <FaDoorOpen className="w-3 h-3" /> Room {room.roomNumber}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 capitalize mb-3">
              {roomTypeLabel}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <FaStar className="text-yellow-400 w-4 h-4" />
                <span className="font-semibold text-gray-800">4.8</span>
                <span className="text-gray-500">(124 reviews)</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                {isAvailable ? (
                  <FaCheckCircle className="text-emerald-500 w-4 h-4" />
                ) : (
                  <FaTimesCircle className="text-rose-500 w-4 h-4" />
                )}
                <span className={isAvailable ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                  {room.roomStatus}
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this room</h2>
            <p className="text-gray-600 leading-relaxed">
              {room.description ||
                `A comfortable ${roomTypeLabel.toLowerCase()} room with modern amenities, perfect for a relaxing stay. Room ${room.roomNumber} is located in our hotel and comfortably accommodates up to ${room.capacity ?? 2} guests.`}
            </p>
          </section>

          {/* Specs */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Room details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Spec icon={FaUsers} label="Capacity" value={`${room.capacity ?? 2} Guests`} />
              <Spec icon={FaBed}   label="Bed"      value="King Size" />
              <Spec icon={FiMaximize} label="Size"  value="45 sqm" />
              <Spec icon={FaTag}   label="Type"     value={roomTypeLabel} />
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Amenities</h2>
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a, i) => {
                  const cfg = amenityConfig[a];
                  const Icon = cfg?.icon;
                  const color = cfg?.color || 'text-amber-500';
                  return (
                    <div
                      key={a + i}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      {Icon ? (
                        <Icon className={`${color} w-5 h-5 flex-shrink-0`} />
                      ) : (
                        <FaCheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700">{a}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No amenities listed.</p>
            )}
          </section>
        </div>

        {/* RIGHT — sticky booking panel */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 bg-white border border-gray-100 rounded-2xl shadow-xl p-6 space-y-5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <FaMoneyBillWave className="text-amber-500 w-5 h-5 mb-1" />
                <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                <span className="text-gray-500 text-sm">/ night</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Taxes & fees not included</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <InfoRow label="Room number" value={room.roomNumber} />
              <InfoRow label="Room type"   value={roomTypeLabel} />
              <InfoRow label="Capacity"    value={`${room.capacity ?? 2} guests`} />
              <InfoRow
                label="Status"
                value={
                  <span className={isAvailable ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                    {room.roomStatus}
                  </span>
                }
              />
            </div>

            {isAvailable ? (
              <Link
                to={`/booking/${room.roomNumber}`}
                className="block w-full text-center px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Book this room
              </Link>
            ) : (
              <button
                disabled
                className="block w-full text-center px-5 py-3 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
              >
                Currently unavailable
              </button>
            )}

            <p className="text-center text-xs text-gray-500">
              Free cancellation up to 24h before check-in
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* Small helper components */
const Spec = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center justify-center gap-1 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
    <Icon className="text-amber-500 w-5 h-5 mb-1" />
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium">{value}</span>
  </div>
);

export default Room;