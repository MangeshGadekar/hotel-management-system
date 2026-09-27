// pages/RoomBooking.jsx
import React, { useState, useCallback } from "react";
import GuestForm from "../../components/forms/GuestForm";
import BookingForm from "../../components/forms/BookingForm";
import useGuestStore from "../../app/useGuestStore";
import { FiCheckCircle, FiXCircle, FiArrowRight } from "react-icons/fi";

const RoomBooking = () => {
  const [step, setStep] = useState("guest"); // 'guest' | 'booking' | 'success'
  const [createdGuest, setCreatedGuest] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const deleteGuest = useGuestStore((state) => state.deleteGuest);

  // Step 1: Guest created successfully
  const handleGuestCreated = useCallback((guest) => {
    console.log("Guest created:", guest);
    setCreatedGuest(guest);
    setStep("booking");
  }, []);

  // Step 2: Booking succeeded
  const handleBookingSuccess = useCallback((bookingData) => {
    console.log("Booking created successfully:", bookingData);
    setStep("success");
  }, []);

  // Step 3: Booking failed → rollback (delete guest)
  const handleBookingFailed = useCallback(
    async (error) => {
      console.error("Booking failed, rolling back guest:", error);
      setBookingError(error.message || "Booking failed");
      setIsRollingBack(true);

      if (createdGuest?.id) {
        try {
          await deleteGuest(createdGuest.id);
          console.log("Guest rolled back successfully");
        } catch (rollbackError) {
          console.error("Failed to rollback guest:", rollbackError);
        }
      }

      setIsRollingBack(false);
      setCreatedGuest(null);
      setStep("guest"); // go back to guest form
    },
    [createdGuest, deleteGuest]
  );

  // User cancels booking → also rollback guest
  const handleCancelBooking = useCallback(async () => {
    if (createdGuest?.id) {
      try {
        await deleteGuest(createdGuest.id);
        console.log("Guest deleted due to cancel");
      } catch (err) {
        console.error("Failed to delete guest on cancel:", err);
      }
    }
    setCreatedGuest(null);
    setStep("guest");
  }, [createdGuest, deleteGuest]);

  // Start over
  const handleReset = () => {
    setCreatedGuest(null);
    setBookingError(null);
    setStep("guest");
  };

  return (
    <div className="flex flex-col items-center justify-center px-10 py-10">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        <StepBadge active={step === "guest"} completed={step !== "guest"} number={1} label="Guest" />
        <FiArrowRight className="text-slate-300" />
        <StepBadge
          active={step === "booking"}
          completed={step === "success"}
          number={2}
          label="Booking"
        />
        <FiArrowRight className="text-slate-300" />
        <StepBadge active={step === "success"} completed={false} number={3} label="Done" />
      </div>

      {/* Error Banner */}
      {bookingError && (
        <div className="mb-6 w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <FiXCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-700">Booking Failed</p>
            <p className="text-xs text-red-600 mt-0.5">
              {bookingError}. The guest record has been removed automatically.
            </p>
          </div>
        </div>
      )}

      {/* Rolling back indicator */}
      {isRollingBack && (
        <div className="mb-6 w-full max-w-2xl p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">Rolling back guest record...</p>
        </div>
      )}

      <div className="flex justify-center w-full max-w-3xl">
        {/* Step 1: Guest Form */}
        {step === "guest" && (
          <GuestForm
            formClose={() => {}}
            onGuestCreated={handleGuestCreated}
          />
        )}

        {/* Step 2: Booking Form */}
        {step === "booking" && (
          <BookingForm
            preSelectedGuest={createdGuest}
            onSuccess={handleBookingSuccess}
            onCancel={handleCancelBooking}
            onBookingFailed={handleBookingFailed}
            submitButtonText="Confirm Booking"
          />
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <FiCheckCircle className="text-emerald-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              The guest has been registered, the room is now marked as{" "}
              <span className="font-semibold text-emerald-600">BOOKED</span>.
            </p>

            {createdGuest && (
              <div className="text-left bg-slate-50 rounded-lg p-4 mb-6 space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Guest:</span>{" "}
                  {createdGuest.firstName} {createdGuest.lastName}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Email:</span> {createdGuest.email}
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg bg-[#D96B43] text-white text-sm font-semibold hover:bg-[#c55e39] transition"
            >
              Create Another Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Small helper component
const StepBadge = ({ active, completed, number, label }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
        completed
          ? "bg-emerald-500 text-white"
          : active
          ? "bg-[#D96B43] text-white"
          : "bg-slate-200 text-slate-500"
      }`}
    >
      {completed ? "✓" : number}
    </div>
    <span
      className={`text-xs font-semibold ${
        active || completed ? "text-slate-700" : "text-slate-400"
      }`}
    >
      {label}
    </span>
  </div>
);

export default RoomBooking;