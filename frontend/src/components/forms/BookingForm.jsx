import React, { useState } from "react";
import useManagementStore from "../../app/managmentStore";

const BookingForm = () => {
  const addBooking = useManagementStore((state) => state.addBooking);

  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      guestId: Number(formData.guestId),
      roomId: Number(formData.roomId),
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
    };

    const result = await addBooking(bookingData);

    console.log("Booking created:", result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">
          Guest ID
        </label>
        <input
          type="number"
          name="guestId"
          value={formData.guestId}
          onChange={handleChange}
          placeholder="Enter Guest ID"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Room ID
        </label>
        <input
          type="number"
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          placeholder="Enter Room ID"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Check-in Date
        </label>
        <input
          type="date"
          name="checkInDate"
          value={formData.checkInDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Check-out Date
        </label>
        <input
          type="date"
          name="checkOutDate"
          value={formData.checkOutDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#D96B43] text-white rounded-lg font-semibold"
      >
        Create Booking
      </button>

    </form>
  );
};

export default BookingForm;