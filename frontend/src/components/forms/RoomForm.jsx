import { useState } from 'react';
import { 
  FaHotel, 
  FaTag, 
  FaMoneyBillWave, 
  FaUsers, 
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaDoorOpen
} from 'react-icons/fa';
import useRoomStore from '../../app/useRoomStore'; 

const RoomForm = () => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'DELUXE',
    pricePerNight: '',
    capacity: '',
    roomStatus: 'AVAILABLE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  
  const addRoom = useRoomStore((state) => state.addRoom);

  const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'];
  const roomStatuses = ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'RESERVED'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    if (!formData.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0) {
      newErrors.pricePerNight = 'Price must be greater than 0';
    }

    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (!formData.roomStatus) {
      newErrors.roomStatus = 'Room status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare room data
    const roomData = {
      roomNumber: formData.roomNumber.trim(),
      roomType: formData.roomType,
      pricePerNight: parseFloat(formData.pricePerNight),
      capacity: parseInt(formData.capacity),
      roomStatus: formData.roomStatus
    };

    try {
      // Add room using zustand store
      addRoom(roomData);
      
      setSuccessMessage(`Room ${formData.roomNumber} added successfully!`);
      
      // Reset form
      setFormData({
        roomNumber: '',
        roomType: 'DELUXE',
        pricePerNight: '',
        capacity: '',
        roomStatus: 'AVAILABLE'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add room' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      roomNumber: '',
      roomType: 'DELUXE',
      pricePerNight: '',
      capacity: '',
      roomStatus: 'AVAILABLE'
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <FaHotel className="text-3xl text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Room</h2>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <FaCheckCircle className="text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <FaTimesCircle className="text-red-500" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaDoorOpen className="inline mr-2 text-blue-500" />
            Room Number
          </label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="e.g., 101, A-201"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.roomNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.roomNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>
          )}
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaTag className="inline mr-2 text-green-500" />
            Room Type
          </label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.roomType ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            {roomTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.roomType && (
            <p className="mt-1 text-sm text-red-600">{errors.roomType}</p>
          )}
        </div>

        {/* Price Per Night */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaMoneyBillWave className="inline mr-2 text-yellow-500" />
            Price Per Night
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.pricePerNight ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.pricePerNight && (
            <p className="mt-1 text-sm text-red-600">{errors.pricePerNight}</p>
          )}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaUsers className="inline mr-2 text-purple-500" />
            Capacity (Guests)
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Number of guests"
            min="1"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
          )}
        </div>

        {/* Room Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaCheckCircle className="inline mr-2 text-blue-500" />
            Room Status
          </label>
          <select
            name="roomStatus"
            value={formData.roomStatus}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.roomStatus ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            {roomStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.roomStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.roomStatus}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaPlus />
            {isSubmitting ? 'Adding...' : 'Add Room'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;