import React, { useState } from "react";
import GuestForm from "../../components/forms/GuestForm";
import BookingForm from "../../components/forms/BookingForm";

const RoomBooking = () => {
  const [openGuestForm, setOpenGuestForm] = useState(true);
  const [openBookingForm, setOpenBookingForm] = useState(false);

  const formClose = () => {
    setOpenGuestForm(false);
    setOpenBookingForm(true);
  };

  return (
    <div className="flex flex-col items-center justify-center px-10 py-10">
      <div className="flex justify-center w-full max-w-3xl">
        {openGuestForm && <GuestForm formClose={formClose} />}
        {openBookingForm && <BookingForm />}
      </div>
    </div>
  );
};

export default RoomBooking;