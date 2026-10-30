import React, { useEffect, useMemo, useState } from 'react'
import {
  FaStar, FaWifi, FaTv, FaSnowflake, FaCoffee, FaUserFriends,
  FaBed, FaHeart, FaRegHeart, FaSearch,
} from 'react-icons/fa'
import {
  MdCheckCircle, MdLocalBar, MdBathtub, MdHotTub, MdWeekend,
  MdBalcony, MdKitchen, MdWork, MdLocationCity, MdGrass,
} from 'react-icons/md'
import { BiLoaderAlt } from 'react-icons/bi'
import { BsCupHot } from 'react-icons/bs'
import { TbSofa } from 'react-icons/tb'
import { RiFridgeLine } from 'react-icons/ri'
import { FaChampagneGlasses } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import useRoomStore from '../../app/useRoomStore'

const amenityIcons = {
  'Free Wi-Fi': <FaWifi />,
  'Smart TV': <FaTv />,
  'Air Conditioning': <FaSnowflake />,
  'Coffee Maker': <FaCoffee />,
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

const ROOM_TYPE_LABELS = {
  SINGLE: 'Single Room',
  DOUBLE: 'Double Room',
  TWIN: 'Twin Room',
  SUITE: 'Suite',
  DELUXE: 'Deluxe Room',
  FAMILY: 'Family Room',
  PRESIDENTIAL: 'Presidential Suite',
}

const normalizeRoom = (room) => {
  const typeLabel =
    ROOM_TYPE_LABELS[room.roomType] ||
    (room.roomType
      ? room.roomType.charAt(0) + room.roomType.slice(1).toLowerCase() + ' Room'
      : `Room ${room.roomNumber ?? '—'}`)

  return {
    ...room,
    name: typeLabel,
    description:
      room.description ||
      `${typeLabel} • Room ${room.roomNumber ?? '—'}`,
    reviews: room.reviews ?? 0,
    size: room.size ?? '—',
    bedType: room.bedType ?? '—',
    capacity: room.capacity ?? 2,
    isAvailable: room.roomStatus === 'AVAILABLE',
    price: room.pricePerNight ?? room.price ?? 0,
    amenities: room.amenities ?? [],
  }
}

// ---------------- Room Card ----------------
const RoomCard = ({ room, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate()

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#e8e3d9] flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <img
          src={room.images?.[0]}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => onToggleFavorite?.(room.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full p-2 shadow transition"
        >
          {isFavorite ? (
            <FaHeart className="text-[#9b3a2e]" />
          ) : (
            <FaRegHeart className="text-[#1f2a37]" />
          )}
        </button>

        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${
            room.isAvailable
              ? 'bg-[#26a51a] text-white'
              : 'bg-[#9b3a2e] text-white'
          }`}
        >
          {room.roomStatus}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-lg font-bold text-[#1f2a37]">{room.name}</h3>
          <div className="flex items-center gap-1 text-[#c8a45c] text-sm font-semibold shrink-0">
            <FaStar />
            <span>{room.rating ?? '—'}</span>
            <span className="text-gray-400 font-normal">
              ({room.reviews})
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {room.description}
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FaUserFriends className="text-[#c8a45c]" />
            <span>{room.capacity} Guests</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities?.slice(0, 4).map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs bg-[#faf6ee] text-[#8a6d2f] px-2 py-1 rounded-md border border-[#efe6d3]"
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

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#e8e3d9]">
          <div>
            <span className="text-2xl font-bold text-[#1f2a37]">
              ₹{room.price}
            </span>
            <span className="text-sm text-gray-500"> / night</span>
          </div>
          <button
            disabled={!room.isAvailable}
            onClick={() => navigate(`/booking/${room.id}`)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              room.isAvailable
                ? 'bg-[#1f2a37] text-white hover:bg-[#2f3d4d]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {room.isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------- Main Rooms ----------------
const Rooms = () => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [roomNumber, setRoomNumber] = useState('') // search input
  const [searchTerm, setSearchTerm] = useState('') // committed search

  // --- Store selectors (data vs. action kept separate) ---
  const roomsFromStore = useRoomStore((state) => state.rooms)
  const getRoomsList = useRoomStore((state) => state.getRoomsList)

  // --- Local fallback state for async fetch if the store doesn't hold rooms ---
  const [fetchedRooms, setFetchedRooms] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setError(null)
        const result = await getRoomsList?.()
        // If the store already exposes `rooms`, we don't need to store locally.
        if (!cancelled && Array.isArray(result)) {
          setFetchedRooms(result)
        } else if (!cancelled) {
          setFetchedRooms([])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load rooms:', err)
          setError(err)
          setFetchedRooms([])
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [getRoomsList])

  // Prefer store-held rooms; fall back to locally fetched result.
  const rawRooms = roomsFromStore ?? fetchedRooms

  const rooms = useMemo(
    () => (rawRooms || []).map(normalizeRoom),
    [rawRooms]
  )

  const loading = rawRooms === null && !error

  // Search by room number directly from the local list (no API)
  const searchedRooms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter((room) =>
      String(room.roomNumber ?? '').toLowerCase().includes(q)
    )
  }, [rooms, searchTerm])

  const filteredRooms = useMemo(() => {
    if (statusFilter === 'ALL') return searchedRooms
    return searchedRooms.filter((room) => room.roomStatus === statusFilter)
  }, [searchedRooms, statusFilter])

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchTerm(roomNumber.trim())
  }

  const clearSearch = () => {
    setRoomNumber('')
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-[#c8a45c]" />
        <p className="text-gray-500">Loading rooms...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4 text-center">
        <p className="text-[#9b3a2e] font-semibold">
          Could not load rooms.
        </p>
        <p className="text-sm text-gray-500">
          Please try again in a moment.
        </p>
        <button
          onClick={() => navigate(0)}
          className="mt-2 px-4 py-2 rounded-lg bg-[#1f2a37] text-white text-sm font-semibold hover:bg-[#2f3d4d]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#c8a45c] uppercase mb-1">
            Accommodation
          </p>
          <h1 className="text-3xl font-bold text-[#1f2a37]">Our Rooms</h1>
          <p className="text-gray-500 mt-1">
            {filteredRooms.length} of {rooms.length} rooms
          </p>
        </div>
      </div>

      {/* Large Search Bar */}
      <form
        onSubmit={handleSearch}
        className="mb-8 bg-white rounded-2xl shadow-lg border border-[#e8e3d9] p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex items-center gap-3 flex-1 bg-[#faf6ee] rounded-xl px-4 sm:px-5 py-4 border border-[#efe6d3]">
          <FaSearch className="text-[#c8a45c] text-xl shrink-0" />
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Search by room number..."
            className="flex-1 bg-transparent outline-none text-base sm:text-lg text-[#1f2a37] placeholder-gray-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-medium text-gray-400 hover:text-[#9b3a2e] transition shrink-0"
            >
              Clear
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[#1f2a37] text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-[#2f3d4d] transition shadow-md shrink-0"
        >
          <FaSearch className="text-[#c8a45c]" />
          Search
        </button>
      </form>

      {/* Room Grid */}
      <div>
        {filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#e8e3d9]">
            <FaBed className="mx-auto text-4xl text-[#c8a45c] mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? `No room found with number "${searchTerm}".`
                : 'No rooms found.'}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-3 text-sm font-semibold text-[#c8a45c] hover:underline"
              >
                Clear search
              </button>
            )}
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
    </section>
  )
}

export default Rooms