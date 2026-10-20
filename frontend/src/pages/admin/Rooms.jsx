import { useState, useEffect, useCallback, useMemo } from "react";
import RoomForm, { AMENITIES_CATEGORIES } from "../../components/forms/RoomForm";
import useRoomStore from "../../app/useRoomStore.js";
import {
  FaBed,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
  FaTimes,
  FaConciergeBell,
  FaSearch,
} from "react-icons/fa";

const STATUS_BADGES = {
  AVAILABLE: "bg-emerald-500/90 text-white",
  OCCUPIED: "bg-rose-500/90 text-white",
  RESERVED: "bg-amber-500/90 text-white",
  MAINTENANCE: "bg-slate-500/90 text-white",
};

const AMENITY_LOOKUP = {};
AMENITIES_CATEGORIES.forEach((cat) => {
  cat.items.forEach((item) => {
    AMENITY_LOOKUP[item.name] = { icon: item.icon, color: item.color };
  });
});

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800";

const formatPrice = (price) => `₹${Number(price ?? 0).toLocaleString()}`;

const titleCase = (str = "") =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const mapRoomFromApi = (room) => {
  const rawAmenities = room.amenities || room.amenityList || [];

  const parsedAmenities = Array.isArray(rawAmenities)
    ? rawAmenities.map((a) => (typeof a === "string" ? a : a.name || a.title || ""))
    : typeof rawAmenities === "string"
    ? rawAmenities.split(",").map((s) => s.trim())
    : [];

  return {
    id: room.id,
    roomNumber: room.roomNumber || "",
    roomType: room.roomType || "SINGLE",
    pricePerNight: room.pricePerNight ?? 0,
    capacity: room.capacity ?? 1,
    roomStatus: room.roomStatus || "AVAILABLE",
    images:
      room.images && room.images.length > 0 ? room.images : [DEFAULT_IMAGE],
    amenities: parsedAmenities,
    displayPrice: formatPrice(room.pricePerNight ?? 0),
    displayType: titleCase(room.roomType || "Single"),
  };
};

function AdminRoomCard({ room, onEdit, onDelete, onViewDetails }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    room.images && room.images.length > 0 ? room.images : [DEFAULT_IMAGE];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => onViewDetails(room)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col justify-between max-w-xs w-full mx-auto cursor-pointer"
    >
      <div
        className={`absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-md backdrop-blur-xs ${
          STATUS_BADGES[room.roomStatus] || STATUS_BADGES.AVAILABLE
        }`}
      >
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
          {room.roomStatus}
        </span>
      </div>

      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group/slider">
        <img
          src={images[currentImageIndex]}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-black/70 transition-all"
            >
              <FaChevronLeft className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-black/70 transition-all"
            >
              <FaChevronRight className="w-2.5 h-2.5" />
            </button>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/10">
          <span className="text-white text-sm font-bold">
            {room.displayPrice}
          </span>
          <span className="text-white/60 text-[10px] ml-0.5">/ night</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-gray-800 group-hover:text-[#D96B43] transition-colors">
              Room {room.roomNumber}
            </h3>
            <span className="text-[#D96B43] text-xs font-semibold">
              {room.displayType}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-md">
              <FaBed className="text-[#D96B43] w-3 h-3" />
              <span className="font-medium">{room.roomType}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-md">
              <FaUsers className="text-[#D96B43] w-3 h-3" />
              <span className="font-medium">{room.capacity} Guests</span>
            </div>
          </div>

          <div className="mb-4 max-h-[56px] overflow-hidden rounded-lg">
            <div className="h-full overflow-y-auto pr-1 flex flex-wrap gap-1">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((amenity, index) => {
                  if (!amenity) return null;
                  const lookup = AMENITY_LOOKUP[amenity];
                  const Icon = lookup?.icon || FaConciergeBell;
                  const color = lookup?.color || "text-[#D96B43]";

                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-700 text-[10px] rounded-md border border-gray-100"
                    >
                      <Icon className={`${color} w-2.5 h-2.5`} />
                      <span className="font-medium">{amenity}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-[10px] text-gray-400 italic">No amenities added</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
          >
            <FaEdit className="w-2.5 h-2.5 text-slate-600" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room);
            }}
            className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
          >
            <FaTrash className="w-2.5 h-2.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  const roomListFromStore = useRoomStore((state) => state.roomList);
  const addRoom = useRoomStore((state) => state.addRoom);
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);

  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedDetailsRoom, setSelectedDetailsRoom] = useState(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      await getRoomsList();
      setError(null);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getRoomsList]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const rooms = useMemo(() => {
    const mapped = (roomListFromStore || []).map(mapRoomFromApi);
    return mapped.sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );
  }, [roomListFromStore]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.toLowerCase().trim();
    return rooms.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(query) ||
        room.roomType.toLowerCase().includes(query) ||
        room.roomStatus.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery]);

  const openAddModal = () => {
    setEditingRoom(null);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setSubmitError("");
  };

  const handleSubmitRoom = async (roomData, imagePayload) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = { ...roomData, imagePayload };

      if (editingRoom?.roomNumber) {
        await updateRoom(editingRoom.roomNumber, payload);
      } else {
        await addRoom(payload);
      }

      await getRoomsList();
      closeModal();
    } catch (err) {
      console.error("Error saving room:", err);
      setSubmitError("Failed to save room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    const confirmed = window.confirm(
      `Delete room ${room.roomNumber}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteRoom(room.roomNumber);
      await getRoomsList();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D96B43] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Rooms & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage room details, statuses, and amenities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-[#D96B43]/20 focus:border-[#D96B43]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="shrink-0 px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
          >
            + Add New Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <AdminRoomCard
              key={room.roomNumber || room.id}
              room={room}
              onEdit={openEditModal}
              onDelete={handleDeleteRoom}
              onViewDetails={(r) => {
                setSelectedDetailsRoom(r);
                setActiveModalImgIdx(0);
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-100">
            <div className="text-slate-400 text-4xl mb-3">🏠</div>
            <p className="text-slate-600 text-sm font-medium">
              {searchQuery ? `No rooms matching "${searchQuery}"` : "No rooms available"}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fill in the information below to {editingRoom ? "update" : "create"} room record.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-100"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <RoomForm
                key={editingRoom?.roomNumber ?? "new"}
                initialData={editingRoom || undefined}
                onSubmit={handleSubmitRoom}
                onCancel={closeModal}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            </div>
          </div>
        </div>
      )}

      {selectedDetailsRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="flex justify-between items-center border-b p-6 pb-3 bg-white z-10 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Room {selectedDetailsRoom.roomNumber} Overview
                </h3>
                <p className="text-xs text-[#D96B43] font-semibold">
                  {selectedDetailsRoom.displayType} Room
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailsRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                  <img
                    src={selectedDetailsRoom.images[activeModalImgIdx] || DEFAULT_IMAGE}
                    alt={`Room ${selectedDetailsRoom.roomNumber}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-black/60 text-white">
                    {selectedDetailsRoom.roomStatus}
                  </div>
                </div>

                {selectedDetailsRoom.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedDetailsRoom.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveModalImgIdx(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                          activeModalImgIdx === idx
                            ? "border-[#D96B43] ring-2 ring-[#D96B43]/30"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Price</div>
                  <div className="text-sm font-bold text-slate-800">{selectedDetailsRoom.displayPrice} / night</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Capacity</div>
                  <div className="text-sm font-bold text-slate-800">{selectedDetailsRoom.capacity} Guests</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Type</div>
                  <div className="text-sm font-bold text-slate-800">{selectedDetailsRoom.roomType}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <FaConciergeBell className="text-[#D96B43]" />
                  All In-Room Amenities ({selectedDetailsRoom.amenities.length})
                </h4>

                <div className="max-h-[30vh] overflow-hidden rounded-xl">
                  <div className="h-full overflow-y-auto pr-1 space-y-4">
                    {AMENITIES_CATEGORIES.map((cat) => {
                      const matchedInRoom = cat.items.filter((item) =>
                        selectedDetailsRoom.amenities.includes(item.name)
                      );

                      if (matchedInRoom.length === 0) return null;

                      return (
                        <div key={cat.category}>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {cat.category}
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {matchedInRoom.map((item) => {
                              const Icon = item.icon;
                              return (
                                <div
                                  key={item.name}
                                  className="flex items-center gap-2 p-2 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-slate-700 font-medium"
                                >
                                  <Icon className={`${item.color} w-3.5 h-3.5 shrink-0`} />
                                  <span>{item.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}