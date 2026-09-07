import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaCalendarCheck, FaDoorOpen, FaUser, FaCalendarPlus, FaCalendarMinus, FaSearch } from 'react-icons/fa';
import useBookingStore from "../../app/useBookingStore.js";
import useGuestStore from "../../app/useGuestStore.js";
import useRoomStore from "../../app/useRoomStore.js";

const BookingForm = ({ 
  onSuccess = () => {},
  onCancel = () => {},
  isFullScreen = false,
  className = "",
  showSummary = true,
  submitButtonText = "Book Now",
  initialData = null,
  isEditMode = false
}) => {
  const addBooking = useBookingStore((state) => state.addBooking);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const getGuestList = useGuestStore((state) => state.getGuestList);
  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        guestId: initialData.guestId || '',
        roomId: initialData.roomId || '',
        checkInDate: initialData.checkInDate || '',
        checkOutDate: initialData.checkOutDate || '',
        ...initialData
      };
    }
    return {
      guestId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [searchGuest, setSearchGuest] = useState('');
  const [searchRoom, setSearchRoom] = useState('');

  // Fetch guests and rooms on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestData, roomData] = await Promise.all([
          getGuestList(),
          getRoomsList()
        ]);
        setGuests(guestData || []);
        setRooms(roomData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getGuestList, getRoomsList]);

  // Filter guests based on search
  const filteredGuests = useMemo(() => {
    const searchTerm = searchGuest.toLowerCase();
    return guests.filter(guest => {
      if (!searchTerm) return true;
      return (
        guest.id?.toString().includes(searchTerm) ||
        guest.name?.toLowerCase().includes(searchTerm) ||
        guest.email?.toLowerCase().includes(searchTerm)
      );
    });
  }, [guests, searchGuest]);

  // Filter rooms based on search
  const filteredRooms = useMemo(() => {
    const searchTerm = searchRoom.toLowerCase();
    return rooms.filter(room => {
      if (!searchTerm) return true;
      return (
        room.id?.toString().includes(searchTerm) ||
        room.roomNumber?.toString().includes(searchTerm) ||
        room.type?.toLowerCase().includes(searchTerm)
      );
    });
  }, [rooms, searchRoom]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guestId' || name === 'roomId' ? parseInt(value) || '' : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.guestId || formData.guestId <= 0) {
      newErrors.guestId = 'Please select a guest';
    }
    
    if (!formData.roomId || formData.roomId <= 0) {
      newErrors.roomId = 'Please select a room';
    }
    
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }
    
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode && initialData?.id) {
        await updateBooking(initialData.id, formData);
      } else {
        await addBooking(formData);
      }
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setFormData({
          guestId: '',
          roomId: '',
          checkInDate: '',
          checkOutDate: ''
        });
        setSearchGuest('');
        setSearchRoom('');
      }
      
      onSuccess(formData);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrors({ submit: error.message || 'Failed to save booking' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, addBooking, updateBooking, isEditMode, initialData, onSuccess]);

  const handleClear = useCallback(() => {
    setFormData({
      guestId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: ''
    });
    setSearchGuest('');
    setSearchRoom('');
    setErrors({});
  }, []);

  // Calculate total price
  const calculateTotal = useCallback(() => {
    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (!selectedRoom?.price || !formData.checkInDate || !formData.checkOutDate) return null;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return selectedRoom.price * days;
  }, [rooms, formData.roomId, formData.checkInDate, formData.checkOutDate]);

  // Get selected guest and room details for display
  const selectedGuest = useMemo(() => 
    guests.find(g => g.id === formData.guestId), 
    [guests, formData.guestId]
  );
  
  const selectedRoom = useMemo(() => 
    rooms.find(r => r.id === formData.roomId), 
    [rooms, formData.roomId]
  );

  const totalPrice = calculateTotal();

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? 'w-full' : 'max-w-2xl mx-auto'} ${className}`}>
      {/* Form Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendarCheck className="text-blue-500" />
          {isEditMode ? 'Edit Booking' : 'Booking Form'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Guest Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaUser className="text-blue-500" />
            Select Guest
          </label>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchGuest}
              onChange={(e) => setSearchGuest(e.target.value)}
              placeholder="Search guest by ID, name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Guest Dropdown */}
          <select
            name="guestId"
            value={formData.guestId || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.guestId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
          >
            <option value="">Select a guest</option>
            {filteredGuests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                #{guest.id} - {guest.name} {guest.email ? `(${guest.email})` : ''}
              </option>
            ))}
          </select>
          
          {/* Selected Guest Info */}
          {selectedGuest && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Selected:</span> {selectedGuest.name}
                {selectedGuest.email && ` - ${selectedGuest.email}`}
                {selectedGuest.phone && ` - ${selectedGuest.phone}`}
              </p>
            </div>
          )}
          
          {errors.guestId && (
            <p className="mt-1 text-sm text-red-500">{errors.guestId}</p>
          )}
        </div>
        
        {/* Room Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaDoorOpen className="text-blue-500" />
            Select Room
          </label>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              placeholder="Search room by ID, number or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Room Dropdown */}
          <select
            name="roomId"
            value={formData.roomId || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.roomId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`}
          >
            <option value="">Select a room</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>
                #{room.id} - Room {room.roomNumber} {room.type ? `(${room.type})` : ''}
                {room.price && ` - $${room.price}/night`}
              </option>
            ))}
          </select>
          
          {/* Selected Room Info */}
          {selectedRoom && (
            <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
              <p className="text-sm text-green-700">
                <span className="font-semibold">Selected:</span> Room {selectedRoom.roomNumber}
                {selectedRoom.type && ` - ${selectedRoom.type}`}
                {selectedRoom.price && ` - $${selectedRoom.price}/night`}
                {selectedRoom.capacity && ` - Capacity: ${selectedRoom.capacity}`}
              </p>
            </div>
          )}
          
          {errors.roomId && (
            <p className="mt-1 text-sm text-red-500">{errors.roomId}</p>
          )}
        </div>
        
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaCalendarPlus className="text-blue-500" />
            Check-in Date
          </label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border ${errors.checkInDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.checkInDate && (
            <p className="mt-1 text-sm text-red-500">{errors.checkInDate}</p>
          )}
        </div>
        
        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaCalendarMinus className="text-blue-500" />
            Check-out Date
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border ${errors.checkOutDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.checkOutDate && (
            <p className="mt-1 text-sm text-red-500">{errors.checkOutDate}</p>
          )}
        </div>
        
        {/* Error Messages */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditMode ? 'Updating...' : 'Booking...'}
              </>
            ) : (
              <>
                <FaCalendarCheck />
                {isEditMode ? 'Update Booking' : submitButtonText}
              </>
            )}
          </button>
          
          {!isEditMode && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Clear
            </button>
          )}
        </div>
      </form>
      
      {/* Booking Summary */}
      {showSummary && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Guest:</span> {selectedGuest ? `${selectedGuest.name} (ID: ${selectedGuest.id})` : 'Not selected'}
            </p>
            <p>
              <span className="font-medium">Room:</span> {selectedRoom ? `Room ${selectedRoom.roomNumber} (ID: ${selectedRoom.id})` : 'Not selected'}
            </p>
            <p>
              <span className="font-medium">Check-in:</span> {formData.checkInDate || 'Not set'}
            </p>
            <p>
              <span className="font-medium">Check-out:</span> {formData.checkOutDate || 'Not set'}
            </p>
            {totalPrice !== null && (
              <p className="text-blue-600 font-semibold">
                <span className="font-medium">Total:</span> ${totalPrice}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;