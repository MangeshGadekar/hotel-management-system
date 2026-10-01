import { useState, useEffect, useCallback } from "react";
import RoomForm from "../../components/forms/RoomForm";
import useRoomStore from "../../app/useRoomStore.js";

const STATUS_BADGES = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Occupied: "bg-rose-50 text-rose-700 border-rose-200",
  Reserved: "bg-amber-50 text-amber-700 border-amber-200",
  Maintenance: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatPrice = (price) => `₹${(price * 15).toLocaleString()}`;

const titleCase = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const normalizeStatus = (raw) => {
  if (!raw) return "Available";
  const value = String(raw).toLowerCase();
  if (value === "available") return "Available";
  if (value === "occupied") return "Occupied";
  if (value === "reserved") return "Reserved";
  if (value === "maintenance") return "Maintenance";
  return "Available";
};

const mapRoomFromApi = (room) => ({
  id: room.id,
  roomNumber: room.roomNumber || `R${String(room.id).padStart(3, "0")}`,
  roomType: room.roomType || room.name || "STANDARD",
  pricePerNight: room.pricePerNight ?? 0,
  capacity: room.capacity ?? 1,
  roomStatus: room.roomStatus || room.status || "AVAILABLE",
  images: room.images || [],
  amenities: room.amenities || ["Wi-Fi", "AC", "TV"],
  displayPrice: formatPrice(room.pricePerNight ?? 0),
  displayStatus: normalizeStatus(room.roomStatus || room.status),
  displayType: titleCase(room.roomType || room.name || "Standard"),
});

export default function Rooms() {
  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  const addRoom = useRoomStore((state) => state.addRoom);
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRooms = await getRoomsList();
      setRooms((fetchedRooms || []).map(mapRoomFromApi));
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

  // ---------- ADD / UPDATE ----------
  // Hands (roomData, imagePayload) straight to the store.
  // No upload logic here — the store decides what to do with the files.
  const handleSubmitRoom = async (roomData, imagePayload) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = { ...roomData, imagePayload };

      if (editingRoom?.id) {
        await updateRoom(editingRoom.id, payload);
      } else {
        await addRoom(payload);
      }

      await fetchRooms();
      closeModal();
    } catch (err) {
      console.error("Error saving room:", err);
      setSubmitError(err?.message || "Failed to save room");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- DELETE ----------
  const handleDeleteRoom = async (room) => {
    const confirmed = window.confirm(
      `Delete room ${room.roomNumber}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      await fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert(err?.message || "Failed to delete room");
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchRooms}
            className="mt-4 px-4 py-2 bg-[#D96B43] text-white rounded-lg hover:bg-[#c25a34]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Rooms & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage room details, statuses, and amenities
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room.id ?? room.roomNumber}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-lg font-bold text-slate-900">
                    {room.roomNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      STATUS_BADGES[room.displayStatus] ||
                      STATUS_BADGES.Available
                    }`}
                  >
                    {room.displayStatus}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {room.displayType}
                  </p>
                  <p className="text-xs text-slate-500">
                    {room.capacity} Guests •{" "}
                    <span className="font-semibold text-slate-700">
                      {room.displayPrice}
                    </span>{" "}
                    / night
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {room.amenities?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => openEditModal(room)}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleDeleteRoom(room)}
                  className="text-rose-600 hover:text-rose-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 text-4xl mb-4">🏠</div>
            <p className="text-slate-600">No rooms available</p>
            <p className="text-sm text-slate-400 mt-1">
              Click "Add New Room" to get started
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <RoomForm
              key={editingRoom?.id ?? "new"}
              initialData={editingRoom || undefined}
              onSubmit={handleSubmitRoom}
              onCancel={closeModal}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          </div>
        </div>
      )}
    </div>
  );
}