import React, { useState, useEffect } from "react";
import {
  FiX,
  FiHome,
  FiUser,
  FiPlusCircle,
  FiEdit3,
  FiTrash2,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchBooking,
  fetchActiveExtraServices,
  fetchPaymentsByBookingApi,
  addCustomServiceToBookingApi,
  removeExtraServiceFromBookingApi,
} from "../../apis/api";

import { FiFileText } from "react-icons/fi";
import MasterFolioModal from "./MasterFolioModal";

import { FiDownload } from "react-icons/fi";
import { downloadCheckInReceiptApi } from "../../apis/api";

export default function BookingDetailsModal({ bookingId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [payments, setPayments] = useState([]);

  // Extra service addition state
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

  const loadData = async () => {
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
  };

  useEffect(() => {
    if (bookingId) loadData();
  }, [bookingId]);

  const computeNights = () => {
    if (booking?.nights) return booking.nights;
    if (!booking?.checkInDate || !booking?.checkOutDate) return 1;
    const start = new Date(booking.checkInDate);
    const end = new Date(booking.checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = computeNights();
  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt) || 0);

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      if (serviceMode === "CATALOG") {
        if (!selectedCatalogId) {
          toast.error("Please select a preset amenity from the dropdown");
          setIsAdding(false);
          return;
        }

        const chosen = availableServices.find(
          (s) => String(s.id) === String(selectedCatalogId),
        );

        if (!chosen) {
          toast.error("Selected amenity not found");
          setIsAdding(false);
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
          setIsAdding(false);
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
      if (onUpdated) onUpdated();
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
      if (onUpdated) onUpdated();
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
    const nightsCount = computeNights();
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Reservation #{bookingId} — Stay & Services
            </h3>
            <span className="text-[11px] text-slate-500">
              Status:{" "}
              <strong className="text-slate-700">
                {booking?.bookingStatus}
              </strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              Loading booking records...
            </div>
          ) : (
            <>
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
                    <p>
                      Desk Staff: {booking?.receptionistName || "Front Desk"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Services & Mid-Stay Additions */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <FiPlusCircle className="text-[#D96B43]" /> Attached
                      Services & Amenities
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

                {/* Form to add service */}
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
                        className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs"
                      >
                        {isAdding ? "Adding..." : "Charge to Booking"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Services Table */}
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
                        {(booking?.selectedExtraServices || []).map(
                          (srv, idx) => {
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
                                    ? new Date(
                                        srv.createdAt,
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                      })
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
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Billing Summary */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">
                  Stay Cost Summary
                </h4>
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
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            {/* 1. Official Check-In PDF stored in backend */}
            <button
              type="button"
              onClick={handleDownloadCheckInPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer shadow-xs"
              title="Download the official Check-in receipt stored on the server"
            >
              <FiDownload size={13} className="text-[#D96B43]" /> Check-In
              Receipt PDF
            </button>

            {/* 2. Master Folio Receipt Modal */}
            <button
              type="button"
              onClick={() => setShowMasterFolio(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              <FiFileText size={13} /> Master Folio Receipt
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
          >
            Close
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
    </div>
  );
}
