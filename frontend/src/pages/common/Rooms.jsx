import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaSearch,
  FaBed,
  FaCheckCircle,
  FaStar,
  FaConciergeBell,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import { BiLoaderAlt, BiImage } from "react-icons/bi";
import toast from "react-hot-toast";
import { searchAvailableRoomsApi } from "../../apis/api";
import useRoomStore from "../../app/useRoomStore.js";
import { AMENITIES_CATEGORIES } from "../../components/forms/RoomForm";

const AMENITY_LOOKUP = {};
if (Array.isArray(AMENITIES_CATEGORIES)) {
  AMENITIES_CATEGORIES.forEach((cat) => {
    cat.items?.forEach((item) => {
      AMENITY_LOOKUP[item.name] = { icon: item.icon, color: item.color };
    });
  });
}

const normalizeImages = (room) => {
  const raw =
    room.images ||
    room.imageUrls ||
    room.roomImages ||
    room.imagesList ||
    [];

  let list = [];

  if (Array.isArray(raw)) {
    list = raw
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item.trim();
        return item.url || item.imageUrl || item.src || null;
      })
      .filter(Boolean);
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed
          .map((item) =>
            typeof item === "string" ? item.trim() : item.url || item.imageUrl || null
          )
          .filter(Boolean);
      } else {
        list = raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return list;
};


const mapRoomFromApi = (room) => {
  const rawAmenities = room.amenities || room.amenityList || [];

  const parsedAmenities = Array.isArray(rawAmenities)
    ? rawAmenities.map((a) => (typeof a === "string" ? a : a.name || a.title || ""))
    : typeof rawAmenities === "string"
    ? rawAmenities.split(",").map((s) => s.trim())
    : [];

  return {
    ...room,
    images: normalizeImages(room),
    amenities: parsedAmenities,
  };
};

const GuestRoomCard = ({
  room,
  nights,
  isSelected,
  isDisabled,
  onToggle,
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const images = normalizeImages(room);
  const hasImages = images.length > 0;

  useEffect(() => {
    setCurrentImgIdx(0);
  }, [images.length]);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const perNight = Number(room.pricePerNight || room.price || 0);
  const roomTotal = perNight * nights;
  const estTax = Math.round(roomTotal * 0.18);
  const netTotal = roomTotal + estTax;

  return (
    <div
      // onClick={() => {
      //   if (!isDisabled) onToggle(room);
      // }}
      className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
        isDisabled
          ? "opacity-50 cursor-not-allowed border-slate-200"
          : isSelected
          ? "border-[#D96B43] ring-2 ring-[#D96B43] shadow-md cursor-pointer"
          : "border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer"
      }`}
    >
      <div>
        {/* Top Image Container with Slider */}
        <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden flex items-center justify-center select-none group/slider">
          {hasImages ? (
            <>
              <img
                src={images[currentImgIdx]}
                alt={`Room ${room.roomNumber} Photo ${currentImgIdx + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer shadow-md"
                  >
                    <FaChevronLeft className="text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer shadow-md"
                  >
                    <FaChevronRight className="text-[10px]" />
                  </button>

                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2 py-1 rounded-full">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImgIdx(idx);
                        }}
                        className={`transition-all rounded-full cursor-pointer ${
                          idx === currentImgIdx
                            ? "bg-white w-3 h-1.5"
                            : "bg-white/50 hover:bg-white/80 w-1.5 h-1.5"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute top-3 right-14 z-20 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                    {currentImgIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
              <BiImage className="text-4xl text-slate-600" />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                No Preview Image Yet
              </span>
            </div>
          )}

          {isSelected ? (
            <span className="absolute top-3 left-3 z-20 bg-[#D96B43] text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs shadow-xs flex items-center gap-1">
              <FaCheck className="text-[9px]" /> Selected
            </span>
          ) : (
            <span className="absolute top-3 left-3 z-20 bg-emerald-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs shadow-xs">
              Available
            </span>
          )}

          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs text-xs font-bold text-slate-800">
            <FaStar className="text-amber-400 text-[11px]" />
            <span>4.8</span>
          </div>

          <span className="absolute bottom-3 left-3 z-20 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Room {room.roomNumber}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-[#D96B43] tracking-wider uppercase block">
                {room.roomType ? room.roomType.replace(/_/g, " ") : "Deluxe"}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Room {room.roomNumber}
              </h3>
            </div>
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1 shrink-0 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">
              <FaUsers className="text-slate-500 text-xs" /> Max {room.capacity || 2} Guests
            </span>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {room.description ||
              "Spacious luxury accommodation."}
          </p>

          <div className="text-xs text-slate-600 pt-0.5">
            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <FaCheckCircle className="text-slate-400 text-[10px] shrink-0" />
              <span>Free cancellation up to 24h before check-in</span>
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="flex flex-wrap gap-1.5 pt-1.5 min-h-[32px]">
            {room.amenities && room.amenities.length > 0 ? (
              room.amenities.slice(0, 5).map((amenityName, idx) => {
                const lookup = AMENITY_LOOKUP[amenityName];
                const IconComponent = lookup?.icon || FaConciergeBell;
                const colorClass = lookup?.color || "text-[#D96B43]";

                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/50 border border-amber-100/80 text-slate-700 text-[11px] rounded-lg font-medium shadow-2xs"
                  >
                    <IconComponent className={`${colorClass} w-3.5 h-3.5 shrink-0`} />
                    <span>{amenityName}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                No special amenities listed
              </span>
            )}
            {room.amenities && room.amenities.length > 5 && (
              <span className="text-[10px] text-slate-400 font-semibold self-center ml-0.5">
                +{room.amenities.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Selection Bar */}
      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              ₹{perNight.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-400">/ night</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Total {nights}N: <strong className="text-slate-700 font-semibold">₹{netTotal.toLocaleString("en-IN")}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(room);
          }}
          disabled={isDisabled}
          className={`px-5 py-2.5 font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap ${
            isSelected
              ? "bg-slate-800 text-white hover:bg-slate-900"
              : isDisabled
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#D96B43] hover:bg-[#c45a33] text-white active:scale-95"
          }`}
        >
          {isSelected ? "DESELECT" : "SELECT ROOM"}
        </button>
      </div>
    </div>
  );
};

const Rooms = () => {
  const navigate = useNavigate();

  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  const roomListFromStore = useRoomStore((state) => state.roomList);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState(2);

  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1
  );

  const combinedCapacity = selectedRooms.reduce(
    (acc, r) => acc + (r.capacity || 2),
    0
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!roomListFromStore || roomListFromStore.length === 0) {
      getRoomsList().catch(() => {});
    }
  }, [getRoomsList, roomListFromStore]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setLoading(true);
    setSelectedRooms([]);
    try {
      const availableData = await searchAvailableRoomsApi(
        checkIn,
        checkOut,
        guests || 1
      );
      const searchResults = Array.isArray(availableData) ? availableData : [];

      let storeCatalog = roomListFromStore;
      if (!storeCatalog || storeCatalog.length === 0) {
        try {
          await getRoomsList();
          storeCatalog = useRoomStore.getState().roomList || [];
        } catch {
          storeCatalog = [];
        }
      }

      const mergedRooms = searchResults.map((availRoom) => {
        const normalized = mapRoomFromApi(availRoom);

        const storeMatch = storeCatalog.find(
          (sr) => String(sr.roomNumber) === String(availRoom.roomNumber)
        );

        if (storeMatch) {
          const storeImages = normalizeImages(storeMatch);
          const currentImages = normalizeImages(normalized);

          if (storeImages.length > currentImages.length) {
            normalized.images = storeImages;
          }

          if (!normalized.amenities || normalized.amenities.length === 0) {
            normalized.amenities = mapRoomFromApi(storeMatch).amenities;
          }
        }
        return normalized;
      });

      setRooms(mergedRooms);
    } catch {
      toast.error("Failed to check room availability");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleToggleRoom = (room) => {
    const isAlreadySelected = selectedRooms.some((r) => r.id === room.id);

    if (isAlreadySelected) {
      setSelectedRooms((prev) => prev.filter((r) => r.id !== room.id));
      return;
    }

    const currentHeadcount = Number(guests) || 1;
    if (combinedCapacity >= currentHeadcount) {
      toast.error(
        `Headcount (${currentHeadcount}) is already fulfilled by selected room(s). Deselect a room first to change.`
      );
      return;
    }

    setSelectedRooms((prev) => [...prev, room]);
  };

  const handleProceedToBooking = () => {
    const currentHeadcount = Number(guests) || 1;

    if (selectedRooms.length === 0) {
      toast.error("Please select at least one room to proceed.");
      return;
    }

    if (combinedCapacity < currentHeadcount) {
      toast.error(
        `Selected room capacity (${combinedCapacity}) is less than total guests (${currentHeadcount}). Please select additional rooms.`
      );
      return;
    }

    const roomIdsParam = selectedRooms.map((r) => r.id).join(",");
    const primaryRoomNumber = selectedRooms[0].roomNumber;

    navigate(
      `/booking/${primaryRoomNumber}?roomIds=${roomIdsParam}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${currentHeadcount}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Search Strip */}
      <div className="bg-white border-b border-slate-200 shadow-xs py-4 px-4 sm:px-6">
        <form
          onSubmit={handleSearch}
          className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center gap-2.5 bg-slate-50 p-2 rounded-2xl border border-slate-200"
        >
          {/* Check-In */}
          <div className="flex-1 min-w-[130px] bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Check-In
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <FaCalendarAlt className="text-[#D96B43] text-xs" />
              <input
                type="date"
                required
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div className="flex-1 min-w-[130px] bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Check-Out
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <FaCalendarAlt className="text-[#D96B43] text-xs" />
              <input
                type="date"
                required
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
              />
            </div>
          </div>

        
          <div className="w-32 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Guests
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <FaUsers className="text-[#D96B43] text-xs shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="2"
                value={guests}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setGuests(val === "" ? "" : parseInt(val, 10));
                }}
                onBlur={() => {
                  if (!guests || guests < 1) setGuests(1);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-[#D96B43] hover:bg-[#c45a33] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
          >
            <FaSearch className="text-xs" /> Update Search
          </button>
        </form>
      </div>

      {/* Main Results View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Available Accommodations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing rooms free for <strong>{nights} {nights === 1 ? "Night" : "Nights"}</strong> ({checkIn} to {checkOut})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                combinedCapacity >= (Number(guests) || 1)
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              Capacity: {combinedCapacity} / {Number(guests) || 1} Guests
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"} Available
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <BiLoaderAlt className="animate-spin text-4xl text-[#D96B43]" />
            <p className="text-xs">Checking real-time calendar availability...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <FaBed className="text-4xl text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No rooms available for these dates</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All rooms are booked between {checkIn} and {checkOut}. Try adjusting your check-in date or duration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => {
              const isSelected = selectedRooms.some((r) => r.id === room.id);
              const isCapacityFull = combinedCapacity >= (Number(guests) || 1);
              const isDisabled = isCapacityFull && !isSelected;

              return (
                <GuestRoomCard
                  key={room.id || room.roomNumber}
                  room={room}
                  nights={nights}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onToggle={handleToggleRoom}
                />
              );
            })}
          </div>
        )}
      </div>
    
      {selectedRooms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {selectedRooms.length} {selectedRooms.length === 1 ? "Room" : "Rooms"} Selected:{" "}
                <span className="text-[#D96B43]">
                  {selectedRooms.map((r) => `Room ${r.roomNumber}`).join(", ")}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Total Capacity: <strong>{combinedCapacity} Guests</strong> | Headcount:{" "}
                <strong>{Number(guests) || 1} Guests</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedRooms([])}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Clear Selection
              </button>

              <button
                type="button"
                disabled={combinedCapacity < (Number(guests) || 1)}
                onClick={handleProceedToBooking}
                className="px-6 py-2.5 bg-[#D96B43] hover:bg-[#c45a33] text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                PROCEED TO BOOKING →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;