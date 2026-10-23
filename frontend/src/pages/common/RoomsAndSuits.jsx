import RoomAndSuitHero from '../../components/common/RoomAndSuitHero'
import { flower_Image } from '../../assets'
import RoomCard from '../../components/common/RoomCard';
import { useNavigate } from 'react-router-dom';
import MovingBelt from '../../components/common/MovingBelt';
import { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaBed } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';

import useRoomStore from '../../app/useRoomStore';

// ---------------- Header Section ----------------
const RoomsHeader = () => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 opacity-70"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

    <div className="relative flex flex-col items-center justify-center py-6 sm:py-8 md:py-10 mt-3 sm:mt-5 px-4">
      <div className="relative group">
        <img
          src={flower_Image}
          alt="flower"
          className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20 blur-2xl -z-10 rounded-full scale-150"></div>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2 text-center relative">
        Rooms & Suites
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full"></span>
      </h2>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center px-2 mt-2 relative">
        <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
          Luxury Rooms & Suites
        </span>
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full"></span>
      </h1>
    </div>
  </div>
)

// ---------------- Description ----------------
const RoomsDescription = () => (
  <div className="relative text-center px-2 max-w-7xl mx-auto">
    <div className="absolute inset-0 flex items-center justify-center opacity-5">
      <div className="w-32 h-32 border-4 border-amber-400 rounded-full"></div>
    </div>
    <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed relative z-10 font-light tracking-wide">
      Experience comfort and elegance in our carefully curated selection of premium accommodations
    </p>
    <div className="flex items-center justify-center gap-3 mt-4 sm:mt-5 relative z-10">
      <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
      <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400 rounded-full shadow-lg shadow-amber-400/30 animate-pulse"></div>
      <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
    </div>
  </div>
)

// ---------------- Search Bar ----------------
const RoomSearchBar = ({ roomNumber, setRoomNumber, searchTerm, onSearch, onClear }) => (
  <form
    onSubmit={onSearch}
    className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-4xl mx-auto"
  >
    <div className="flex items-center gap-3 flex-1 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl px-4 sm:px-5 py-4 border border-amber-100">
      <FaSearch className="text-amber-500 text-xl shrink-0" />
      <input
        type="text"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        placeholder="Search by room number..."
        className="flex-1 bg-transparent outline-none text-base sm:text-lg text-gray-800 placeholder-gray-400"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-gray-400 hover:text-rose-500 transition shrink-0"
        >
          Clear
        </button>
      )}
    </div>
    <button
      type="submit"
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-base font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/40 transition shadow-md shrink-0"
    >
      <FaSearch className="text-white" />
      Search
    </button>
  </form>
)

// ---------------- Room Grid ----------------
const RoomGrid = ({ rooms, onFavoriteToggle }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mt-6 sm:mt-8">
    {rooms.map((room, index) => (
      <div
        key={room.id}
        className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-200/50"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <RoomCard
          {...room}
          onFavoriteToggle={() => onFavoriteToggle(room.id)}
        />
      </div>
    ))}
  </div>
)

// ---------------- Empty State ----------------
const EmptyRooms = ({ searchTerm, onClear }) => (
  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-6">
    <FaBed className="mx-auto text-4xl text-amber-500 mb-3" />
    <p className="text-gray-500">
      {searchTerm
        ? `No room found with number "${searchTerm}".`
        : 'No rooms found.'}
    </p>
    {searchTerm && (
      <button
        onClick={onClear}
        className="mt-3 text-sm font-semibold text-amber-600 hover:underline"
      >
        Clear search
      </button>
    )}
  </div>
)

// ---------------- Loading State ----------------
const RoomsLoading = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <BiLoaderAlt className="animate-spin text-4xl text-amber-500" />
    <p className="text-gray-500">Loading rooms...</p>
  </div>
)

// ---------------- View All Button ----------------
const ViewAllButton = ({ onClick }) => (
  <div className="text-center mt-8 sm:mt-10 md:mt-12">
    <div className="relative inline-block group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

      <button
        onClick={onClick}
        className="relative px-8 sm:px-10 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold rounded-full shadow-lg shadow-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/60 transition-all duration-300 hover:-translate-y-1 hover:scale-105 text-sm sm:text-base group overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

        <span className="relative flex items-center gap-2">
          View All Rooms
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </span>
      </button>

      <span className="absolute -top-2 -right-2 text-yellow-300 text-sm animate-bounce">✦</span>
      <span className="absolute -bottom-2 -left-2 text-orange-300 text-sm animate-bounce delay-75">✦</span>
    </div>
  </div>
)

// ---------------- Rooms Section (main function) ----------------
const RoomsSection = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomNumber, setRoomNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // getRoomsList is an async function from the store
  const getRoomsList = useRoomStore((state) => state.getRoomsList)

  // Load rooms using await
  useEffect(() => {
    let isMounted = true

    const loadRooms = async () => {
      try {
        setLoading(true)
        const data = await getRoomsList()
        if (isMounted) setRooms(data || [])
      } catch (err) {
        console.error('Failed to load rooms:', err)
        if (isMounted) setRooms([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRooms()

    return () => {
      isMounted = false
    }
  }, [getRoomsList])

  const handleFavoriteToggle = (roomId) => {
    console.log(`Toggled favorite for room ${roomId}`);
  };

  const navigate = useNavigate()

  // Local list search — no API
  const searchedRooms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter((room) =>
      String(room.roomNumber ?? '').toLowerCase().includes(q)
    )
  }, [rooms, searchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchTerm(roomNumber.trim())
  }

  const clearSearch = () => {
    setRoomNumber('')
    setSearchTerm('')
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-4">
      <RoomsDescription />

      <div className="mt-6 sm:mt-8">
        <RoomSearchBar
          roomNumber={roomNumber}
          setRoomNumber={setRoomNumber}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onClear={clearSearch}
        />
      </div>

      {loading ? (
        <RoomsLoading />
      ) : searchedRooms.length === 0 ? (
        <EmptyRooms searchTerm={searchTerm} onClear={clearSearch} />
      ) : (
        <RoomGrid
          rooms={searchedRooms.slice(0, 9)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}

      <ViewAllButton onClick={() => navigate('/rooms')} />
    </div>
  )
}

// ---------------- Main Page ----------------
const RoomsAndSuits = () => {
  return (
    <>
      <RoomAndSuitHero />
      <RoomsHeader />
      <RoomsSection />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent"></div>
        <MovingBelt />
      </div>
    </>
  )
}

export default RoomsAndSuits