import React, { useEffect, useMemo, useState } from 'react'
import {
  FaStar, FaWifi, FaTv, FaSnowflake, FaCoffee, FaUserFriends,
  FaBed, FaRulerCombined, FaHeart, FaRegHeart, FaFilter,
  FaTimes, FaChevronDown
} from 'react-icons/fa'
import { MdCheckCircle, MdLocalBar, MdBathtub, MdHotTub, MdWeekend, MdBalcony, MdKitchen, MdWork, MdLocationCity, MdGrass } from 'react-icons/md'
import { BiLoaderAlt } from 'react-icons/bi'
import { BsCupHot } from 'react-icons/bs'
import { TbSofa } from 'react-icons/tb'
import RoomsData from '../../config/Room.json'
import { RiFridgeLine } from "react-icons/ri";
import { FaChampagneGlasses } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';


// ---- Fake API service ----
const roomListService = {
  fetchRooms: async () => {
    return new Promise((resolve) => setTimeout(() => resolve(RoomsData), 600))
  },
}

// Full amenities list from your JSON
const ALL_AMENITIES = [
  'WiFi', 'TV', 'AC', 'Coffee', 'Mini Bar', 'Bathtub', 'Jacuzzi',
  'Living Room', 'Balcony', 'Mini Fridge', 'Champagne', 'Work Desk',
  'City View', 'Terrace', 'Kitchen', 'Lounge', 'Garden View', 'Living Area',
]

const amenityIcons = {
  WiFi: <FaWifi />,
  TV: <FaTv />,
  AC: <FaSnowflake />,
  Coffee: <FaCoffee />,
  'Mini Bar': <MdLocalBar />,
  Bathtub: <MdBathtub />,
  Jacuzzi: <MdHotTub />,
  'Living Room': <MdWeekend />,
  Balcony: <MdBalcony />,
  'Mini Fridge': <RiFridgeLine />,
  Champagne: <FaChampagneGlasses />,
  'Work Desk': <MdWork />,
  'City View': <MdLocationCity />,
  Terrace: <BsCupHot />,
  Kitchen: <MdKitchen />,
  Lounge: <TbSofa />,
  'Garden View': <MdGrass />,
  'Living Area': <MdWeekend />,
}


// ---------------- Room Card ----------------
const RoomCard = ({ room, isFavorite, onToggleFavorite }) => (
  <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
    <div className="relative h-56 overflow-hidden">
      <img
        src={room.images?.[0]}
        alt={room.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {room.isFeatured && (
        <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          Featured
        </span>
      )}
      <span
        className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${
          room.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {room.isAvailable ? 'Available' : 'Booked'}
      </span>
      <button
        onClick={() => onToggleFavorite(room.id)}
        className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow hover:scale-110 transition"
      >
        {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-600" />}
      </button>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
        <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold shrink-0">
          <FaStar />
          <span>{room.rating}</span>
          <span className="text-gray-400 font-normal">({room.reviews})</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{room.description}</p>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FaUserFriends className="text-indigo-500" />
          <span>{room.capacity} Guests</span>
        </div>
        <div className="flex items-center gap-1">
          <FaBed className="text-indigo-500" />
          <span className="truncate">{room.bedType}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaRulerCombined className="text-indigo-500" />
          <span>{room.size}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {room.amenities?.slice(0, 4).map((a) => (
          <span
            key={a}
            className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md"
          >
            {amenityIcons[a] || <MdCheckCircle />}
            {a}
          </span>
        ))}
        {room.amenities?.length > 4 && (
          <span className="text-xs text-gray-500 px-2 py-1">
            +{room.amenities.length - 4} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <span className="text-2xl font-bold text-gray-800">${room.price}</span>
          <span className="text-sm text-gray-500"> / night</span>
        </div>
         <button
      disabled={!room.isAvailable}
      onClick={() => navigate(`/${room.id}`)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        room.isAvailable
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      {room.isAvailable ? 'Book Now' : 'Unavailable'}
    </button>
      </div>
    </div>
  </div>
)

// ---------------- Filters Sidebar ----------------
const Filters = ({ filters, setFilters, priceBounds, onClear }) => {
  const [amenityOpen, setAmenityOpen] = useState(true)

  const toggleAmenity = (a) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }))
  }

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <FaFilter className="text-indigo-600" /> Filters
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-indigo-600 hover:underline font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Availability */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) =>
              setFilters((p) => ({ ...p, availableOnly: e.target.checked }))
            }
            className="accent-indigo-600 w-4 h-4"
          />
          Show available rooms only
        </label>
      </div>

      {/* Price */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Price per night
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-indigo-600">
            ${filters.price[0]}
          </span>
          <span className="text-gray-400 text-sm">—</span>
          <span className="text-sm font-semibold text-indigo-600">
            ${filters.price[1]}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={filters.price[0]}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: [Math.min(+e.target.value, p.price[1]), p.price[1]],
                }))
              }
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={filters.price[1]}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: [p.price[0], Math.max(+e.target.value, p.price[0])],
                }))
              }
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <button
          onClick={() => setAmenityOpen((o) => !o)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2"
        >
          Amenities
          <FaChevronDown
            className={`transition-transform ${amenityOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {amenityOpen && (
          <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
            {ALL_AMENITIES.map((a) => (
              <label
                key={a}
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-indigo-600"
              >
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="accent-indigo-600 w-4 h-4"
                />
                <span className="text-indigo-500">
                  {amenityIcons[a] || <MdCheckCircle />}
                </span>
                {a}
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

// ---------------- Main Rooms ----------------
const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const navigate = useNavigate()


  const [filters, setFilters] = useState({
    amenities: [],
    price: [0, 1000],
    availableOnly: false,
  })

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        setLoading(true)
        const data = await roomListService.fetchRooms()
        if (isMounted) {
          setRooms(data || [])
          const prices = (data || []).map((r) => r.price)
          if (prices.length) {
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            setFilters((p) => ({ ...p, price: [min, max] }))
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Something went wrong')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const priceBounds = useMemo(() => {
    if (!rooms.length) return { min: 0, max: 1000 }
    const prices = rooms.map((r) => r.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [rooms])

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.availableOnly && !room.isAvailable) return false
      if (room.price < filters.price[0] || room.price > filters.price[1]) return false
      if (filters.amenities.length) {
        const hasAll = filters.amenities.every((a) => room.amenities?.includes(a))
        if (!hasAll) return false
      }
      return true
    })
  }, [rooms, filters])

  const clearFilters = () => {
    setFilters({
      amenities: [],
      price: [priceBounds.min, priceBounds.max],
      availableOnly: false,
    })
  }

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )

  const activeFilterCount =
    filters.amenities.length +
    (filters.availableOnly ? 1 : 0) +
    (filters.price[0] !== priceBounds.min || filters.price[1] !== priceBounds.max ? 1 : 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-gray-500">Loading rooms...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-500 font-medium">⚠ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Our Rooms</h1>
          <p className="text-gray-500 mt-1">
            {filteredRooms.length} of {rooms.length} rooms match your filters
          </p>
        </div>

        <button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden relative flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
        >
          <FaFilter /> Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <Filters
            filters={filters}
            setFilters={setFilters}
            priceBounds={priceBounds}
            onClear={clearFilters}
          />
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-gray-500 hover:text-gray-800"
                >
                  <FaTimes />
                </button>
              </div>
              <Filters
                filters={filters}
                setFilters={setFilters}
                priceBounds={priceBounds}
                onClear={clearFilters}
              />
            </div>
          </div>
        )}

        {/* Room Grid */}
        <div>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-3">No rooms match your filters.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isFavorite={favorites.includes(room.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Rooms