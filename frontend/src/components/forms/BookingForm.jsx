import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiHome,
  FiCalendar,
  FiCheck,
} from "react-icons/fi";

import useBookingStore from "../../app/useBookingStore.js";
import useGuestStore from "../../app/useGuestStore.js";
import useRoomStore from "../../app/useRoomStore.js";

const BookingForm = ({ onSuccess }) => {
  const addBooking = useBookingStore((state) => state.addBooking);

  const guestList = useGuestStore((state) => state.guestList);
  const getGuestList = useGuestStore((state) => state.getGuestList);

  const roomList = useRoomStore((state) => state.roomList);
  const getRoomsList = useRoomStore((state) => state.getRoomsList);

  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load guest and room lists for the dropdowns
  useEffect(() => {
    getGuestList();
    getRoomsList();
  }, [getGuestList, getRoomsList]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        guestId: Number(formData.guestId),
        roomId: Number(formData.roomId),
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
      };

      const result = await addBooking(payload);
      console.log("Booking created:", result);

      // Reset form fields after successful submission
      setFormData({
        guestId: "",
        roomId: "",
        checkInDate: "",
        checkOutDate: "",
      });

      // Notify parent (e.g. modal) that submission succeeded, so it can close
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      setErrorMessage(
        error?.message || "Failed to create booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300";

  const selectClass =
    "w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20 hover:border-slate-300 appearance-none cursor-pointer";

  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
      {/* Booking Details */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D96B43]/10 text-[#D96B43]">
            <FiHome size={20} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">Booking Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select the guest, room, and stay dates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Guest */}
          <div className="md:col-span-2">
            <label className={labelClass}>Guest</label>
            <div className="relative">
              <FiUser
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                size={17}
              />
              <select
                name="guestId"
                value={formData.guestId}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="">Select guest</option>
                {guestList.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName}
                    {guest.phone ? ` — ${guest.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room */}
          <div className="md:col-span-2">
            <label className={labelClass}>Room</label>
            <div className="relative">
              <FiHome
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                size={17}
              />
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                className={selectClass}
              >
                <option value="">Select room</option>
                {roomList.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber}
                    {room.roomType ? ` (${room.roomType})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Check-In */}
          <div>
            <label className={labelClass}>Check-In Date</label>
            <div className="relative">
              <FiCalendar
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Check-Out */}
          <div>
            <label className={labelClass}>Check-Out Date</label>
            <div className="relative">
              <FiCalendar
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Error message */}
      {errorMessage && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/60">
        <p className="text-xs text-slate-400">
          <span className="text-red-500 font-medium">*</span> Required fields
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg bg-[#D96B43] text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-[#c55e39] hover:shadow-md active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto min-w-[140px]"
        >
          <FiCheck size={18} />
          {isSubmitting ? "Creating..." : "Create Booking"}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
