import React from 'react'
import useBookingStore from "../../app/useBookingStore.js";

const BookingForm = () => {
  const addBooking = useBookingStore((state) => state.addBooking)

  return (
    <div>BookingForm</div>
  )
}

export default BookingForm