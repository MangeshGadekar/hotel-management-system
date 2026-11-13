// pages/RoomBooking.jsx
import React, { useState, useCallback } from "react";
import BookingForm from "../../components/forms/BookingForm";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiHome,
  FiUser,
  FiPlusCircle,
  FiEdit3,
  FiTrash2,
  FiLock,
  FiFileText,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import {
  fetchBooking,
  fetchActiveExtraServices,
  fetchPaymentsByBookingApi,
  addCustomServiceToBookingApi,
  removeExtraServiceFromBookingApi,
  downloadCheckInReceiptApi,
} from "../../apis/api";
import MasterFolioModal from "../../components/modals/MasterFolioModal";
import { useEffect } from "react";
import { Link, Links, useParams } from "react-router-dom";

// ---------------- Helpers ----------------
const formatCurrency = (amt) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amt) || 0);

const computeNights = (booking) => {
  if (booking?.nights) return booking.nights;
  if (!booking?.checkInDate || !booking?.checkOutDate) return 1;
  const start = new Date(booking.checkInDate);
  const end = new Date(booking.checkOutDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

// ---------------- Stay & Services Panel ----------------
const StayServicesPanel = ({ bookingId, onRefreshParent }) => {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showAddSection, setShowAddSection] = useState(false);
  const [serviceMode, setServiceMode] = useState("MANUAL");
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [manualService, setManualService] = useState({
    serviceName: "",
    price: "",
    taxRate: "18.00",
  });

  const [showMasterFolio, setShowMasterFolio] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bData, sData, pData] = await Promise.all([
        fetchBooking(bookingId),
        fetchActiveExtraServices().catch(() => []),
        fetchPaymentsByBookingApi(bookingId).catch(() => []),
      ]);
      setBooking(bData);
      setAvailableServices(Array.isArray(sData) ? sData : []);
      setPayments(Array.isArray(pData) ? pData : []);
    } catch {
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) loadData();
  }, [bookingId, loadData]);

  const nights = computeNights(booking);

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      if (serviceMode === "CATALOG") {
        if (!selectedCatalogId) {
          toast.error("Please select a preset amenity from the dropdown");
          return;
        }
        const chosen = availableServices.find(
          (s) => String(s.id) === String(selectedCatalogId),
        );
        if (!chosen) {
          toast.error("Selected amenity not found");
          return;
        }
        await addCustomServiceToBookingApi(bookingId, {
          serviceName: chosen.name,
          price: Number(chosen.price),
          taxRate: Number(chosen.taxRate || 18),
        });
        toast.success(`"${chosen.name}" charged to room!`);
      } else {
        if (
          !manualService.serviceName.trim() ||
          !manualService.price ||
          Number(manualService.price) <= 0
        ) {
          toast.error("Please provide a valid service name and price");
          return;
        }
        await addCustomServiceToBookingApi(bookingId, {
          serviceName: manualService.serviceName.trim(),
          price: Number(manualService.price),
          taxRate: Number(manualService.taxRate || 18),
        });
        toast.success(`"${manualService.serviceName.trim()}" billed to room!`);
      }

      setShowAddSection(false);
      setSelectedCatalogId("");
      setManualService({ serviceName: "", price: "", taxRate: "18.00" });
      await loadData();
      onRefreshParent?.();
    } catch (err) {
      toast.error(err.message || "Failed to add service");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveService = async (serviceId, serviceName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${serviceName}" from this booking?`,
      )
    ) {
      return;
    }
    try {
      await removeExtraServiceFromBookingApi(bookingId, serviceId);
      toast.success(`Removed "${serviceName}"`);
      await loadData();
      onRefreshParent?.();
    } catch (err) {
      toast.error(err.message || "Cannot remove service");
    }
  };

  const getPaidServiceStatusMap = () => {
    const services = booking?.selectedExtraServices || [];
    if (services.length === 0) return {};

    const getServiceTotal = (s) => {
      const base = Number(s.price || 0);
      const rate = Number(s.taxRate != null ? s.taxRate : 18);
      return base + Math.round(base * (rate / 100));
    };

    const totalBill = Number(booking?.totalAmount || 0);
    const balanceDue = Number(booking?.balanceDue || 0);
    const totalPaid = Math.max(0, totalBill - balanceDue);
    const roomBase = Number(booking?.roomCharges || 0);
    const roomWithTax = Math.round(roomBase + roomBase * 0.18);

    let remainingPaidPool = Math.max(0, totalPaid - roomWithTax);

    const paidStatus = {};
    services.forEach((s, idx) => {
      const cost = getServiceTotal(s);
      if (remainingPaidPool >= cost - 5) {
        paidStatus[idx] = true;
        remainingPaidPool -= cost;
      } else {
        paidStatus[idx] = false;
      }
    });
    return paidStatus;
  };

  const paidStatusMap = getPaidServiceStatusMap();

  const handleDownloadCheckInPdf = async () => {
    const toastId = toast.loading("Downloading Check-In Receipt...");
    try {
      await downloadCheckInReceiptApi(booking.id);
      toast.success("Receipt downloaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Could not download receipt.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Loading booking records...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-8 text-center text-rose-500 text-sm">
        Could not load booking details.
        <button
          onClick={loadData}
          className="ml-2 text-[#D96B43] font-semibold hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs text-left">
      {/* Stay & Room Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FiHome className="text-[#D96B43]" /> Room & Dates
          </span>
          <div className="text-slate-600 text-[11px] space-y-1">
            <p>
              Room: <strong>Room {booking?.roomNumber}</strong> (
              {booking?.roomType})
            </p>
            <p>
              Check-In: <strong>{booking?.checkInDate}</strong>
            </p>
            <p>
              Check-Out: <strong>{booking?.checkOutDate}</strong>
            </p>
            <p>
              Stay:{" "}
              <strong>
                {nights} {nights === 1 ? "Night" : "Nights"}
              </strong>
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FiUser className="text-[#D96B43]" /> Guest Profile
          </span>
          <div className="text-slate-600 text-[11px] space-y-1">
            <p>
              Name: <strong>{booking?.guestName}</strong>
            </p>
            <p>Email: {booking?.guestEmail || "—"}</p>
            <p>Phone: {booking?.guestPhone || "—"}</p>
            <p>Desk Staff: {booking?.receptionistName || "Front Desk"}</p>
          </div>
        </div>
      </div>

      {/* Extra Services */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FiPlusCircle className="text-[#D96B43]" /> Attached Services &
              Amenities
            </h4>
            <p className="text-[11px] text-slate-500">
              Order extra mattresses, dinner tables, or cabs
            </p>
          </div>
          {booking?.bookingStatus !== "CHECKED_OUT" && (
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="px-3 py-1 bg-[#D96B43] hover:bg-[#c95a34] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {showAddSection ? "Cancel" : "+ Add Service"}
            </button>
          )}
        </div>

        {showAddSection && (
          <form
            onSubmit={handleAddService}
            className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5"
          >
            <div className="flex gap-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setServiceMode("MANUAL")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  serviceMode === "MANUAL"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <FiEdit3 className="inline mr-1" /> Custom Entry
              </button>
              {availableServices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setServiceMode("CATALOG")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    serviceMode === "CATALOG"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Preset Catalog
                </button>
              )}
            </div>

            {serviceMode === "MANUAL" ? (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Service name (e.g. Extra Mattress)"
                  value={manualService.serviceName}
                  onChange={(e) =>
                    setManualService({
                      ...manualService,
                      serviceName: e.target.value,
                    })
                  }
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs col-span-1"
                />
                <input
                  type="number"
                  required
                  placeholder="Price (₹)"
                  value={manualService.price}
                  onChange={(e) =>
                    setManualService({
                      ...manualService,
                      price: e.target.value,
                    })
                  }
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs font-bold"
                />
                <select
                  value={manualService.taxRate}
                  onChange={(e) =>
                    setManualService({
                      ...manualService,
                      taxRate: e.target.value,
                    })
                  }
                  className="px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                >
                  <option value="0.00">0% GST</option>
                  <option value="5.00">5% GST</option>
                  <option value="12.00">12% GST</option>
                  <option value="18.00">18% GST</option>
                </select>
              </div>
            ) : (
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs bg-white"
              >
                <option value="">-- Pick from catalog --</option>
                {availableServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — ₹{s.price} ({s.taxRate}% GST)
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAdding}
                className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs disabled:opacity-60"
              >
                {isAdding ? "Adding..." : "Charge to Booking"}
              </button>
            </div>
          </form>
        )}

        {(booking?.selectedExtraServices || []).length === 0 ? (
          <p className="text-slate-400 text-center py-2">
            No extra services ordered for this stay.
          </p>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Service / Item</th>
                  <th className="px-4 py-2.5">Ordered When</th>
                  <th className="px-4 py-2.5">GST Rate</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(booking?.selectedExtraServices || []).map((srv, idx) => {
                  const isPaid = paidStatusMap[idx];
                  return (
                    <tr
                      key={srv.id ? `${srv.id}-${idx}` : idx}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {srv.name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                        {srv.createdAt
                          ? new Date(srv.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" },
                            )
                          : "Stay Add-on"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-mono">
                        {srv.taxRate || 18}%
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">
                        ₹{Number(srv.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isPaid ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 cursor-not-allowed"
                            title="Already settled via receipt - Cannot be removed"
                          >
                            <FiLock size={11} /> Paid
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleRemoveService(srv.id, srv.name)
                            }
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 cursor-pointer transition font-medium"
                            title="Remove this pending unpaid service"
                          >
                            <FiTrash2 size={11} /> Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing Summary */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
        <h4 className="font-bold text-slate-800 text-xs">Stay Cost Summary</h4>
        <div className="space-y-1 text-slate-600 text-[11px]">
          <div className="flex justify-between">
            <span>Room Charges ({nights} nights):</span>
            <strong className="text-slate-800">
              {formatCurrency(booking?.roomCharges)}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Extra Services Charges:</span>
            <strong className="text-slate-800">
              {formatCurrency(booking?.extraServicesTotal)}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST:</span>
            <strong className="text-slate-800">
              {formatCurrency(booking?.taxAmount)}
            </strong>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 text-xs text-slate-900 font-bold">
            <span>Total Bill:</span>
            <span className="text-[#D96B43]">
              {formatCurrency(booking?.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleDownloadCheckInPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer"
          title="Download the official Check-in receipt stored on the server"
        >
          <FiDownload size={13} className="text-[#D96B43]" /> Check-In Receipt
          PDF
        </button>

        <button
          type="button"
          onClick={() => setShowMasterFolio(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
        >
          <FiFileText size={13} /> Master Folio Receipt
        </button>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer ml-auto"
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {showMasterFolio && (
        <MasterFolioModal
          booking={booking}
          payments={payments}
          onClose={() => setShowMasterFolio(false)}
        />
      )}
    </div>
  );
};

// ---------------- Main RoomBooking Wizard ----------------
const RoomBooking = () => {
  // Two-step flow: BookingForm (includes guest creation) → Done
  const [step, setStep] = useState("booking"); // 'booking' | 'success'
  const [createdBooking, setCreatedBooking] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const param = useParams();

  const _roomId = param.id;

  const handleBookingSuccess = useCallback((bookingData) => {
    setCreatedBooking(bookingData);
    setStep("success");
  }, []);

  const handleBookingFailed = useCallback((error) => {
    setBookingError(error?.message || "Booking failed");
    // Stay on the booking step so the user can retry.
  }, []);

  const handleCancel = useCallback(() => {
    setBookingError(null);
    // Reset the form is handled by BookingForm's own onCancel semantics.
  }, []);

  const handleReset = () => {
    setCreatedBooking(null);
    setBookingError(null);
    setStep("booking");
  };

  const bookingId = createdBooking?.id ?? createdBooking?.bookingId ?? null;

  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-10 py-10">
      {/* Step Indicator: Booking → Done */}
      <div className="flex items-center gap-3 mb-8">
        <StepBadge
          active={step === "booking"}
          completed={step === "success"}
          number={1}
          label="Booking"
        />
        <FiArrowRight className="text-slate-300" />
        <StepBadge
          active={step === "success"}
          completed={false}
          number={2}
          label="Done"
        />
      </div>

      {/* Error Banner */}
      {bookingError && (
        <div className="mb-6 w-full max-w-3xl p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <FiXCircle className="text-red-500 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-700">Booking Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{bookingError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-center w-full max-w-3xl">
        {/* Step 1: BookingForm (handles guest creation internally) */}
        {step === "booking" && (
          <BookingForm
            onSuccess={handleBookingSuccess}
            onCancel={handleCancel}
            onBookingFailed={handleBookingFailed}
            submitButtonText="Confirm Booking"
            roomId={_roomId}
            guestMode={true}
            // No preSelectedGuest → the form lets the user pick an
            // existing guest OR create a new one inline.
          />
        )}

        {/* Step 2: Success + full stay dashboard */}
        {step === "success" && (
          <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <FiCheckCircle className="text-emerald-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Booking Confirmed!
              </h2>
              <p className="text-sm text-slate-500">
                The guest has been registered, the room is now marked as{" "}
                <span className="font-semibold text-emerald-600">BOOKED</span>.
              </p>
            </div>

            {bookingId ? (
              <div className="border-t border-slate-100 pt-5">
                <StayServicesPanel
                  bookingId={bookingId}
                  onRefreshParent={() => {}}
                />
              </div>
            ) : (
              <p className="text-center text-slate-400 text-sm border-t border-slate-100 pt-5">
                Booking saved, but no booking ID was returned. Check your
                bookings list.
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <Link
                to="/rooms"
                className="px-6 py-3 rounded-lg bg-[#D96B43] text-white text-sm font-semibold hover:bg-[#c55e39] transition"
              >
                CHECKOUT OTHER ROOMS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- Step Badge ----------------
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
