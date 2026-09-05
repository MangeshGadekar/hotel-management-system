import { useState, useEffect } from "react";
import RoomForm from "../../components/forms/RoomForm";
import useRoomStore from "../../app/useRoomStore.js";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rooms, setRooms] = useState([]);

    // Get the fetch function from store
    const getRoomsList = useRoomStore((state) => state.getRoomsList);

    // Fetch rooms on component mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const fetchedRooms = await getRoomsList();

                // Format the fetched rooms to match the expected structure
                const formattedRooms = fetchedRooms.map((room) => ({
                    number: room.number || `R${String(room.id).padStart(3, "0")}`,
                    type: room.type || room.name,
                    price: formatPrice(room.price),
                    capacity: `${room.capacity} Guests`,
                    status: room.isAvailable ? "Available" : room.status || "Occupied",
                    amenities: room.amenities || ['Wi-Fi', 'AC', 'TV'],
                    originalData: room,
                    id: room.id,
                }));

                setRooms(formattedRooms);
                setError(null);
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError("Failed to load rooms. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [getRoomsList]); // Runs once on mount

    const handleDeleteRoom = (roomNumber) => {
        setRooms(rooms.filter((r) => r.number !== roomNumber));
    };

    // This function will be called when a new room is added via RoomForm
    const handleRoomAdded = (newRoomData) => {
        // Format the room data to match the existing room structure
        const formattedRoom = {
            number: newRoomData.roomNumber || `R${String(Date.now()).slice(-3)}`,
            type: newRoomData.roomType.charAt(0) + newRoomData.roomType.slice(1).toLowerCase(),
            price: `₹${(newRoomData.pricePerNight * 15).toLocaleString()}`,
            capacity: `${newRoomData.capacity} Guests`,
            status: newRoomData.roomStatus.charAt(0) + newRoomData.roomStatus.slice(1).toLowerCase(),
            amenities: newRoomData.amenities || ['Wi-Fi', 'AC', 'TV'],
            originalData: newRoomData,
            id: newRoomData.id || Date.now(),
        };

        setRooms([...rooms, formattedRoom]);
        setIsModalOpen(false);
    };

    // Show loading state
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

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
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
                {rooms.length > 0 ? (
                    rooms.map((room) => (
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
                                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${STATUS_BADGES[room.status] || STATUS_BADGES.Available}`}
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
                                    {room.amenities && room.amenities.map((item, idx) => (
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
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-slate-400 text-4xl mb-4">🏠</div>
                        <p className="text-slate-600">No rooms available</p>
                        <p className="text-sm text-slate-400 mt-1">Click "Add New Room" to get started</p>
                    </div>
                )}
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