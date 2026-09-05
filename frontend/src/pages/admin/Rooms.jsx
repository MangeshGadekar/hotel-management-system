import { useState } from "react";
import roomsData from "../../config/Room.json";
import RoomForm from "../../components/forms/RoomForm";

const STATUS_BADGES = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Occupied: "bg-rose-50 text-rose-700 border-rose-200",
  Reserved: "bg-amber-50 text-amber-700 border-amber-200",
  Maintenance: "bg-slate-100 text-slate-700 border-slate-200",
};

// Helper function to format price
const formatPrice = (price) => {
  return `₹${(price * 15).toLocaleString()}`;
};

export default function Rooms() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize rooms from imported JSON data
  const [rooms, setRooms] = useState(
    roomsData.map((room) => ({
      number: `R${String(room.id).padStart(3, "0")}`, // R001, R002, etc.
      type: room.name,
      price: formatPrice(room.price),
      capacity: `${room.capacity} Guests`,
      status: room.isAvailable ? "Available" : "Occupied",
      amenities: room.amenities,
      originalData: room, // Keep original data if needed
    })),
  );

  const handleDeleteRoom = (roomNumber) => {
    setRooms(rooms.filter((r) => r.number !== roomNumber));
  };

  // This function will be called when a new room is added via RoomForm
  const handleRoomAdded = (newRoomData) => {
    // Format the room data to match the existing room structure
    const formattedRoom = {
      number: newRoomData.roomNumber,
      type: newRoomData.roomType.charAt(0) + newRoomData.roomType.slice(1).toLowerCase(),
      price: `₹${(newRoomData.pricePerNight * 15).toLocaleString()}`,
      capacity: `${newRoomData.capacity} Guests`,
      status: newRoomData.roomStatus.charAt(0) + newRoomData.roomStatus.slice(1).toLowerCase(),
      amenities: ['Wi-Fi', 'AC', 'TV'], // Default amenities, can be customized
      originalData: newRoomData,
    };

    setRooms([...rooms, formattedRoom]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Add New Room
        </button>
      </div>

      {/* Room Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {rooms.map((room) => (
          <div
            key={room.number}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-lg font-bold text-slate-900">
                  {room.number}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${STATUS_BADGES[room.status]}`}
                >
                  {room.status}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  {room.type}
                </p>
                <p className="text-xs text-slate-500">
                  {room.capacity} •{" "}
                  <span className="font-semibold text-slate-700">
                    {room.price}
                  </span>{" "}
                  / night
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {room.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button className="text-slate-600 hover:text-slate-900 font-medium">
                Edit Details
              </button>
              <button
                onClick={() => handleDeleteRoom(room.number)}
                className="text-rose-600 hover:text-rose-800 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Room Modal with RoomForm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Room</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Integrate RoomForm */}
            <RoomForm onRoomAdded={handleRoomAdded} onCancel={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}