import React, { useState, useEffect } from "react";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiLock,
  FiEdit3,
  FiCalendar,
  FiRepeat,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchBooking,
  fetchActiveExtraServices,
  fetchPaymentsByBookingApi,
  addCustomServiceToBookingApi,
  addExtraServicesToBookingApi,
  removeExtraServiceFromBookingApi,
  downloadCheckInReceiptApi,
  downloadCancellationReceiptPdf,
  checkInGuestApi,
  extendStayApi,
  switchRoomApi,
} from "../../apis/api";
import useRoomStore from "../../app/useRoomStore";
import useAuthStore from "../../app/useAuthStore";
import MasterFolioModal from "./MasterFolioModal";

const isServiceAvailableNow = (availability) => {
  if (!availability || typeof availability !== "string") return true;
  const sched = availability.trim().toLowerCase();

  if (
    sched.includes("24/7") ||
    sched.includes("daily") ||
    sched.includes("no specific") ||
    sched.includes("on request")
  ) {
    return true;
  }

  const match = sched.match(/(\d{1,2}:\d{2}\s*(?:am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(?:am|pm))/i);
  if (!match) return true;

  const parseTime = (str) => {
    const [time, modifier] = str.trim().split(/\s+/);
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  try {
    const startMins = parseTime(match[1]);
    const endMins = parseTime(match[2]);
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    return endMins >= startMins
      ? currentMins >= startMins && currentMins <= endMins
      : currentMins >= startMins || currentMins <= endMins;
  } catch {
    return true;
  }
};

export default function BookingDetailsModal({
  bookingId,
  onClose,
  onUpdated,
  booking: initialBooking,
}) {
  const [loading, setLoading] = useState(!initialBooking);
  const [bookingData, setBookingData] = useState(initialBooking || null);
  const [availableServices, setAvailableServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [serviceMode, setServiceMode] = useState("MANUAL");
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [manualService, setManualService] = useState({
    serviceName: "",
    price: "",
    taxRate: "18.00",
  });

  const token =
    useAuthStore((state) => state.token) ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const roomListFromStore = useRoomStore((state) => state.roomList);
  const getRoomsList = useRoomStore((state) => state.getRoomsList);
  const [activeSwitchRoomId, setActiveSwitchRoomId] = useState(null);
  const [roomSwitchInputs, setRoomSwitchInputs] = useState({}); // { [sourceRoomId]: { targetRoomId, reason } }
  const [isSwitching, setIsSwitching] = useState(false);
  const [showExtendSection, setShowExtendSection] = useState(false);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  const [showMasterFolio, setShowMasterFolio] = useState(false);

  const activeBooking = bookingData || initialBooking;

  const loadData = async () => {
    const targetId = bookingId || activeBooking?.id;
    if (!targetId) return;

    setLoading(true);
    try {
      const [bData, sData, pData] = await Promise.all([
        fetchBooking(targetId),
        fetchActiveExtraServices().catch(() => []),
        fetchPaymentsByBookingApi(targetId).catch(() => []),
        getRoomsList().catch(() => []),
      ]);
      setBookingData(bData);

      const catalogOnly = (Array.isArray(sData) ? sData : []).filter(
        (s) => !s.bookingId && Boolean(s.active !== false)
      );
      setAvailableServices(catalogOnly);
      setPayments(Array.isArray(pData) ? pData : []);
    } catch {
      toast.error("Failed to load reservation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const computeNights = () => {
    if (activeBooking?.nights) return activeBooking.nights;
    if (!activeBooking?.checkInDate || !activeBooking?.checkOutDate) return 1;
    const start = new Date(activeBooking.checkInDate);
    const end = new Date(activeBooking.checkOutDate);
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

  const getMinExtensionDate = () => {
    if (!activeBooking?.checkOutDate) return "";
    const currentOut = new Date(activeBooking.checkOutDate);
    currentOut.setDate(currentOut.getDate() + 1);
    return currentOut.toISOString().split("T")[0];
  };

  const handleModalCheckIn = async () => {
    const targetId = activeBooking?.id || bookingId;
    if (!targetId) return;

    setIsCheckingIn(true);
    try {
      await checkInGuestApi(targetId);
      toast.success(`Keys handed over! Booking #${targetId} is now Checked-In.`);
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleExtendStaySubmit = async (e) => {
    e.preventDefault();
    if (!newCheckOutDate) {
      toast.error("Please pick a new check-out date");
      return;
    }

    const targetId = activeBooking?.id || bookingId;
    setIsExtending(true);

    try {
      await extendStayApi(targetId, newCheckOutDate);
      toast.success(`Stay extended to ${newCheckOutDate}! Financial ledger updated.`);
      setShowExtendSection(false);
      setNewCheckOutDate("");
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to extend stay. Check room availability.";
      toast.error(errMsg);
    } finally {
      setIsExtending(false);
    }
  };

  const handleSwitchRoomSubmit = async (e, sourceRoomId) => {
    e.preventDefault();
    const currentInput = roomSwitchInputs[sourceRoomId] || {};
    const targetRoomId = currentInput.targetRoomId;
    const reason = currentInput.reason || "";

    if (!targetRoomId) {
      toast.error("Please pick a destination room");
      return;
    }

    const targetId = activeBooking?.id || bookingId;
    setIsSwitching(true);

    try {
      await switchRoomApi(targetId, targetRoomId, reason, sourceRoomId, token);
      toast.success("Room transferred successfully! Vacated room moved to CLEANING.");
      setActiveSwitchRoomId(null);
      setRoomSwitchInputs((prev) => ({ ...prev, [sourceRoomId]: { targetRoomId: "", reason: "" } }));
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Room transfer failed. Please check room readiness.";
      toast.error(errMsg);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const targetId = bookingId || activeBooking?.id;
      if (serviceMode === "CATALOG") {
        if (!selectedCatalogId) {
          toast.error("Please pick an extra service from catalog");
          setIsAdding(false);
          return;
        }

        const selectedItem = availableServices.find(
          (s) => String(s.id) === String(selectedCatalogId)
        );
        if (selectedItem && !isServiceAvailableNow(selectedItem.availability)) {
          toast.error(
            `"${selectedItem.name}" is closed right now. Operating hours: ${selectedItem.availability}`
          );
          setIsAdding(false);
          return;
        }

        await addExtraServicesToBookingApi(targetId, [Number(selectedCatalogId)]);
        toast.success("Service charged to room!");
      } else {
        if (!manualService.serviceName.trim() || Number(manualService.price) <= 0) {
          toast.error("Enter valid service name and charge rate");
          setIsAdding(false);
          return;
        }

        await addCustomServiceToBookingApi(targetId, {
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
      toast.error(err.message || "Failed to charge service");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveService = async (serviceId, serviceName) => {
    if (!window.confirm(`Remove "${serviceName}" from this reservation?`)) return;

    try {
      const targetId = bookingId || activeBooking?.id;
      await removeExtraServiceFromBookingApi(targetId, serviceId);
      toast.success(`Removed "${serviceName}"`);
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || "Cannot remove service");
    }
  };

  const rawStatus = String(activeBooking?.bookingStatus || activeBooking?.status || "").toUpperCase();
  const isCancelled = rawStatus === "CANCELLED";
  const isCheckedOut = rawStatus === "CHECKED_OUT";
  const isClosed = isCheckedOut || isCancelled;
  const canExtend = !isClosed && (rawStatus === "BOOKED" || rawStatus === "CHECKED_IN");
  const canSwitchRoom = !isClosed && rawStatus === "CHECKED_IN";
  const handleDownloadPdf = async () => {
    const targetId = activeBooking?.id || bookingId;
    if (!targetId) return;

    setIsDownloadingPdf(true);
    const toastId = toast.loading(
      isCancelled ? "Downloading Cancellation Slip..." : "Downloading Check-In Slip..."
    );

    try {
      if (isCancelled) {
        await downloadCancellationReceiptPdf(targetId);
        toast.success("Cancellation Slip downloaded!", { id: toastId });
      } else {
        await downloadCheckInReceiptApi(targetId);
        toast.success("Check-In Slip downloaded!", { id: toastId });
      }
    } catch {
      toast.error("Failed to download PDF slip. Check server logs.", { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const allServices = activeBooking?.selectedExtraServices || [];
  const sortedServices = [...allServices].sort((a, b) => (a.id || 0) - (b.id || 0));

  const initialServicesList = sortedServices.filter((s) => !s.bookingId && s.active !== false);
  const midStayServices = sortedServices.filter((s) => s.bookingId != null || s.active === false);

  const paidMidStayServices = midStayServices.filter((s) => s.paid === true);
  const unpaidMidStayServices = midStayServices.filter((s) => s.paid !== true);

  const calcServicesTotal = (list) => {
    const base = list.reduce((acc, s) => acc + Number(s.price || 0), 0);
    const tax = list.reduce((acc, s) => {
      const rate = Number(s.taxRate != null ? s.taxRate : 18) / 100;
      return acc + Math.round(Number(s.price || 0) * rate);
    }, 0);
    return { base, tax, total: base + tax };
  };

  const paidAddons = calcServicesTotal(paidMidStayServices);
  const unpaidAddons = calcServicesTotal(unpaidMidStayServices);
  const allocatedRooms = activeBooking?.rooms && activeBooking.rooms.length > 0 
    ? activeBooking.rooms 
    : (activeBooking?.room ? [activeBooking.room] : []);

  const totalGuestsCount = activeBooking?.totalGuests || 2;

  const roomCharges = Number(
    activeBooking?.roomCharges != null
      ? activeBooking.roomCharges
      : allocatedRooms.reduce((acc, r) => acc + Number(r.pricePerNight || r.price || 0) * nights, 0)
  );

  const initialServicesBase = initialServicesList.reduce(
    (acc, s) => acc + Number(s.price || 0),
    0
  );

  const initialTaxableAmount = roomCharges + initialServicesBase;
  const roomGst = Math.round(roomCharges * 0.18);
  const initialServicesTax = initialServicesList.reduce((acc, s) => {
    const rate = Number(s.taxRate != null ? s.taxRate : 18) / 100;
    return acc + Math.round(Number(s.price || 0) * rate);
  }, 0);

  const initialGst = initialServicesTax + roomGst;
  const initialGross = initialTaxableAmount + initialGst;

  const couponFromPayments = (payments || []).reduce(
    (acc, p) => acc + Number(p.couponDeducted || 0),
    0
  );
  const deskDiscountFromPayments = (payments || []).reduce(
    (acc, p) => acc + Number(p.discountDeducted || 0),
    0
  );

  const couponVal =
    couponFromPayments > 0 ? couponFromPayments : Number(activeBooking?.couponDiscount || 0);

  const deskConcession =
    deskDiscountFromPayments > 0
      ? deskDiscountFromPayments
      : Number(activeBooking?.discountAmount || 0);

  const totalConcessions = couponVal + deskConcession;

  const totalGrossBill =
    Number(initialGross || 0) +
    Number(paidAddons.total || 0) +
    Number(unpaidAddons.total || 0);

  const totalNetPayable =
    Number(activeBooking?.totalAmount || 0) > 0 && midStayServices.length === 0
      ? Number(activeBooking.totalAmount)
      : Math.max(0, totalGrossBill - totalConcessions);

  const paymentsSum = (payments || []).reduce(
    (acc, p) => acc + Number(p.amountPaid ?? p.amount ?? p.paidAmount ?? 0),
    0
  );
  const totalPaidSoFar =
    paymentsSum > 0 ? paymentsSum : Number(activeBooking?.advancePayment || 0);

  const totalBalanceDue = isCancelled ? 0 : Math.max(0, totalNetPayable - totalPaidSoFar);

  const initialNetPayable = Math.max(0, initialGross - totalConcessions);
  const initialDepositPaid =
    payments.length > 0
      ? Number(payments[0]?.amountPaid ?? payments[0]?.amount ?? 0)
      : Number(activeBooking?.advancePayment || 0);

  const roomBalanceRemaining = isCancelled
    ? 0
    : totalBalanceDue === 0
    ? 0
    : Math.max(0, initialNetPayable - initialDepositPaid);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-white px-8 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {activeBooking?.guestName ||
                  `${activeBooking?.guest?.firstName || "Guest"} ${activeBooking?.guest?.lastName || ""}`.trim()}
              </h1>

              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase border ${
                  isCancelled
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : isCheckedOut
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : rawStatus === "CHECKED_IN"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                }`}
              >
                {rawStatus || "ACTIVATED"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Ref ID:{" "}
              {activeBooking?.bookingReference || `BOOKING-${activeBooking?.id}`}{" "}
              {allocatedRooms.length > 1
                ? `Rooms: ${allocatedRooms.map(r => r.roomNumber).join(", ")}`
                : `Room ${allocatedRooms[0]?.roomNumber || activeBooking?.roomNumber || "—"} (${allocatedRooms[0]?.roomType || activeBooking?.roomType || "DELUXE"})`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {rawStatus === "BOOKED" && (
              <button
                type="button"
                disabled={isCheckingIn}
                onClick={handleModalCheckIn}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <span>{isCheckingIn ? "Checking In..." : "Hand Key & Check-In"}</span>
              </button>
            )}

            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs border transition cursor-pointer disabled:opacity-50 ${
                isCancelled
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <FiDownload size={13} className={isCancelled ? "text-rose-600" : "text-[#0D3B66]"} />
              <span>
                {isDownloadingPdf
                  ? "Downloading..."
                  : isCancelled
                  ? "Download Cancellation Slip"
                  : "Download Check-In Slip"}
              </span>
            </button>

            {/* Master Folio Button */}
            {isCheckedOut && (
              <button
                type="button"
                onClick={() => setShowMasterFolio(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D3B66] hover:bg-[#092844] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <FiFileText size={13} />
                <span>Master Receipt</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer ml-1"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading reservation profile & records...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Stay Particulars & Operational Context
                  </h3>

                  <div className="mt-3 space-y-4 text-xs">
                    {/* Dates & Extension Block */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Scheduled Dates
                          </span>
                          <p className="text-slate-800 font-medium mt-0.5">
                            {activeBooking?.checkInDate} &rarr; {activeBooking?.checkOutDate} (
                            {nights} {nights === 1 ? "night" : "nights"})
                          </p>
                        </div>

                        {canExtend && !showExtendSection && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCheckOutDate(getMinExtensionDate());
                              setShowExtendSection(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                          >
                            <FiCalendar size={12} />
                            <span>Extend Stay</span>
                          </button>
                        )}
                      </div>

                      {showExtendSection && canExtend && (
                        <form
                          onSubmit={handleExtendStaySubmit}
                          className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <FiCalendar size={12} /> Extend Check-Out Date
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              required
                              min={getMinExtensionDate()}
                              value={newCheckOutDate}
                              onChange={(e) => setNewCheckOutDate(e.target.value)}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 flex-1 outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setShowExtendSection(false);
                                setNewCheckOutDate("");
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/70 rounded text-xs font-semibold cursor-pointer transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isExtending || !newCheckOutDate}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer transition disabled:opacity-50"
                            >
                              {isExtending ? "Extending..." : "Confirm"}
                            </button>
                          </div>
                          <p className="text-[10px] text-amber-700 leading-tight">
                            System verifies calendar availability and updates nights, charges, and ledger due balance.
                          </p>
                        </form>
                      )}
                    </div>

                    {/* Room Allocation & Stacked Individual Switch Block */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Room Allocation & Guests ({totalGuestsCount} Guests)
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {allocatedRooms.map((roomItem, idx) => {
                          const roomNum = roomItem.roomNumber || roomItem.room?.roomNumber;
                          const roomTyp = roomItem.roomType || roomItem.room?.roomType;
                          const roomId = roomItem.id || roomItem.room?.id || roomNum;
                          const isSwitchingThisRoom = String(activeSwitchRoomId) === String(roomId);
                          const roomInputState = roomSwitchInputs[roomId] || { targetRoomId: "", reason: "" };

                          return (
                            <div key={roomId || idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-slate-800 font-bold text-xs">
                                    Room {roomNum} <span className="text-slate-500 font-normal">({roomTyp})</span>
                                  </p>
                                  {roomItem.previousRoomNumber && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200 text-slate-700 mt-0.5">
                                      Moved from Room {roomItem.previousRoomNumber}
                                    </span>
                                  )}
                                </div>

                                {canSwitchRoom && !isSwitchingThisRoom && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveSwitchRoomId(roomId);
                                      setRoomSwitchInputs((prev) => ({
                                        ...prev,
                                        [roomId]: { targetRoomId: "", reason: "" },
                                      }));
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                  >
                                    <FiRepeat size={12} />
                                    <span>Switch Room</span>
                                  </button>
                                )}
                              </div>

                              {isSwitchingThisRoom && canSwitchRoom && (
                                <form
                                  onSubmit={(e) => handleSwitchRoomSubmit(e, roomId)}
                                  className="mt-2 p-3 bg-blue-50/90 rounded-xl border border-blue-200 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-blue-900">
                                      Transfer Room {roomNum} to:
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <select
                                      required
                                      value={roomInputState.targetRoomId}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setRoomSwitchInputs((prev) => ({
                                          ...prev,
                                          [roomId]: { ...prev[roomId], targetRoomId: val },
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                      <option value="">-- Choose Available Ready Room --</option>
                                      {(roomListFromStore || [])
                                        .filter(
                                          (r) =>
                                            r.roomStatus === "AVAILABLE" &&
                                            !allocatedRooms.some((ar) => String(ar.id || ar.room?.id || ar.roomNumber) === String(r.id || r.roomNumber))
                                        )
                                        .map((r) => (
                                          <option key={r.id} value={r.id}>
                                            Room {r.roomNumber} ({r.roomType}) &mdash; ₹{r.pricePerNight}/night
                                          </option>
                                        ))}
                                    </select>

                                    <input
                                      type="text"
                                      placeholder="Reason for room switch (optional)"
                                      value={roomInputState.reason}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setRoomSwitchInputs((prev) => ({
                                          ...prev,
                                          [roomId]: { ...prev[roomId], reason: val },
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <div className="flex items-center justify-end pt-1 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setActiveSwitchRoomId(null)}
                                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200/70 rounded text-xs font-semibold cursor-pointer transition"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={isSwitching || !roomInputState.targetRoomId}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer transition disabled:opacity-50"
                                    >
                                      {isSwitching ? "Transferring..." : "Confirm Move"}
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attached Extra Services */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Attached Extra Services ({allServices.length})
                    </span>
                    {!isClosed && (
                      <button
                        type="button"
                        onClick={() => setShowAddSection(!showAddSection)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <FiUpload size={12} />
                        <span>{showAddSection ? "Cancel" : "Add Service"}</span>
                      </button>
                    )}
                  </div>

                  {showAddSection && !isClosed && (
                    <form
                      onSubmit={handleAddService}
                      className="p-3.5 mb-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex gap-2 border-b border-slate-200 pb-2">
                        <button
                          type="button"
                          onClick={() => setServiceMode("MANUAL")}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            serviceMode === "MANUAL"
                              ? "bg-slate-900 text-white"
                              : "bg-white text-slate-600 border border-slate-200"
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
                                ? "bg-slate-900 text-white"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            Catalog
                          </button>
                        )}
                      </div>

                      {serviceMode === "MANUAL" ? (
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Service Name (e.g. Laundry)"
                            value={manualService.serviceName}
                            onChange={(e) =>
                              setManualService({ ...manualService, serviceName: e.target.value })
                            }
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs col-span-1"
                          />
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Price (₹)"
                            value={manualService.price}
                            onChange={(e) =>
                              setManualService({ ...manualService, price: e.target.value })
                            }
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold"
                          />
                          <select
                            value={manualService.taxRate}
                            onChange={(e) =>
                              setManualService({ ...manualService, taxRate: e.target.value })
                            }
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
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
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value="">-- Choose Preset Service --</option>
                          {availableServices.map((s) => {
                            const isAvailable = isServiceAvailableNow(s.availability);
                            return (
                              <option
                                key={s.id}
                                value={s.id}
                                disabled={!isAvailable}
                                className={!isAvailable ? "text-slate-400 bg-slate-50" : ""}
                              >
                                {s.name} &mdash; ₹{s.price} ({s.taxRate || 18}% GST)
                                {s.availability ? ` ${s.availability}` : ""}
                                {!isAvailable ? " [CLOSED NOW]" : ""}
                              </option>
                            );
                          })}
                        </select>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isAdding}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs cursor-pointer disabled:opacity-50"
                        >
                          {isAdding ? "Billing..." : "Confirm & Charge"}
                        </button>
                      </div>
                    </form>
                  )}

                  {allServices.length === 0 ? (
                    <p className="text-slate-400 text-xs py-2 italic">
                      No extra services charged.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                          <tr>
                            <th className="px-3.5 py-2">Service / Item</th>
                            <th className="px-3.5 py-2">GST Rate</th>
                            <th className="px-3.5 py-2">Price</th>
                            <th className="px-3.5 py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allServices.map((srv) => {
                            const isItemSettled = srv.paid === true || totalBalanceDue === 0;

                            return (
                              <tr key={srv.id} className="hover:bg-slate-50/50">
                                <td className="px-3.5 py-2 font-medium text-slate-800">
                                  {srv.name}
                                </td>
                                <td className="px-3.5 py-2 text-slate-500 font-mono">
                                  {srv.taxRate || 18}%
                                </td>
                                <td className="px-3.5 py-2 font-bold text-slate-900 font-mono">
                                  ₹{Number(srv.price).toLocaleString("en-IN")}
                                </td>
                                <td className="px-3.5 py-2 text-right">
                                  {isCancelled ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                      Refunded
                                    </span>
                                  ) : isItemSettled ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      <FiLock size={10} /> Paid
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveService(srv.id, srv.name)}
                                      className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                      title="Remove charge"
                                    >
                                      <FiTrash2 size={13} />
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
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Details</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Guest Particulars
                    </span>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name:</span>
                        <strong className="text-slate-900">
                          {activeBooking?.guestName ||
                            `${activeBooking?.guest?.firstName || ""} ${activeBooking?.guest?.lastName || ""}`.trim()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span>
                          {activeBooking?.guestPhone || activeBooking?.guest?.phone || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-600">
                          {activeBooking?.guestEmail || activeBooking?.guest?.email || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Headcount:</span>
                        <span className="font-bold text-slate-800">
                          {totalGuestsCount} Guests
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Accounting Valuation
                    </span>

                    {/* Cancellation & Refund Banner */}
                    {isCancelled && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-bold flex items-center justify-between">
                        <span>Reservation Cancelled</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-rose-200/60 rounded">
                          Refund Processed & Folio Cleared
                        </span>
                      </div>
                    )}

                    <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1 text-[11px] text-slate-600 font-mono">
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block font-sans border-b border-slate-200 pb-1">
                        1. Initial Stay Reservation
                      </span>
                      <div className="flex justify-between font-sans pt-1">
                        <span>Rooms Tariff ({nights} nights):</span>
                        <strong className="text-slate-800 font-mono">
                          {formatCurrency(roomCharges)}
                        </strong>
                      </div>
                      <div className="flex justify-between font-sans">
                        <span>Initial Attached Services:</span>
                        <strong className="text-slate-800 font-mono">
                          {formatCurrency(initialServicesBase)}
                        </strong>
                      </div>
                      <div className="flex justify-between font-sans text-slate-700">
                        <span>Initial Taxable Base:</span>
                        <strong className="text-slate-900 font-mono">
                          {formatCurrency(initialTaxableAmount)}
                        </strong>
                      </div>
                      <div className="flex justify-between font-sans text-slate-700">
                        <span>Initial GST (Itemized):</span>
                        <strong className="text-slate-900 font-mono">
                          {formatCurrency(initialGst)}
                        </strong>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 font-sans border-t border-slate-200 pt-1">
                        <span>Initial Gross Spend:</span>
                        <span className="font-mono">{formatCurrency(initialGross)}</span>
                      </div>

                      {couponVal > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold font-sans">
                          <span>Coupon ({activeBooking?.couponCode || "COUPON"}):</span>
                          <span className="font-mono">-{formatCurrency(couponVal)}</span>
                        </div>
                      )}

                      {deskConcession > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold font-sans">
                          <span>Desk Concession:</span>
                          <span className="font-mono">-{formatCurrency(deskConcession)}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-slate-900 font-sans border-t border-slate-200 pt-1">
                        <span>Initial Net Payable:</span>
                        <span className="font-mono">{formatCurrency(initialNetPayable)}</span>
                      </div>

                      <div
                        className={`flex justify-between font-bold font-sans ${
                          isCancelled ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        <span>
                          {isCancelled
                            ? "Initial Advance Deposit (Refunded):"
                            : "Initial Advance Deposit Paid:"}
                        </span>
                        <span className="font-mono">
                          {isCancelled
                            ? `-${formatCurrency(initialDepositPaid)}`
                            : formatCurrency(initialDepositPaid)}
                        </span>
                      </div>

                      <div className="flex justify-between text-amber-700 font-bold font-sans">
                        <span>Initial Room Balance Carried:</span>
                        <span className="font-mono">
                          {formatCurrency(roomBalanceRemaining)}
                        </span>
                      </div>
                    </div>

                    {paidMidStayServices.length > 0 && (
                      <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 text-[11px] font-mono space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-sans border-b border-emerald-200 pb-0.5">
                          2. Settled Mid-Stay Additions (Paid)
                        </span>
                        {paidMidStayServices.map((s) => (
                          <div
                            key={s.id}
                            className="flex justify-between font-sans text-slate-700"
                          >
                            <span>
                              {s.name} (+{s.taxRate || 18}% GST):
                            </span>
                            <span className="font-mono font-bold text-emerald-800">
                              {formatCurrency(
                                Number(s.price) * (1 + Number(s.taxRate || 18) / 100)
                              )}{" "}
                              (Paid)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {unpaidMidStayServices.length > 0 && (
                      <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-200 text-[11px] font-mono space-y-1">
                        <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block font-sans border-b border-rose-200 pb-0.5">
                          3. New Mid-Stay Additions (Unpaid)
                        </span>
                        {unpaidMidStayServices.map((s) => {
                          const itemTotal =
                            Number(s.price) * (1 + Number(s.taxRate || 18) / 100);
                          return (
                            <div
                              key={s.id}
                              className="flex justify-between font-sans text-slate-700"
                            >
                              <span>
                                {s.name} (+{s.taxRate || 18}% GST):
                              </span>
                              <span className="font-mono font-bold text-rose-800">
                                {formatCurrency(itemTotal)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between font-sans font-bold text-rose-900 border-t border-rose-200 pt-1">
                          <span>Unpaid Additions Total:</span>
                          <span className="font-mono">{formatCurrency(unpaidAddons.total)}</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-300 pt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>Total Bill:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(totalGrossBill)}
                        </span>
                      </div>

                      {totalConcessions > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Total Concessions:</span>
                          <span className="font-mono font-bold">
                            -{formatCurrency(totalConcessions)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                        <span>Net Payable:</span>
                        <span className="text-[#0D3B66] font-mono font-black text-sm">
                          {formatCurrency(totalNetPayable)}
                        </span>
                      </div>

                      {isCancelled ? (
                        <div className="flex justify-between font-bold text-rose-700">
                          <span>Total Refunded to Guest:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(initialDepositPaid)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Total Paid:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(totalPaidSoFar)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-amber-700">
                        <span>Remaining Due:</span>
                        <span
                          className={`font-mono font-black ${
                            isCancelled ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(totalBalanceDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-3.5 border-t border-slate-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition"
          >
            Close
          </button>
        </div>
      </div>

      {showMasterFolio && (
        <MasterFolioModal
          isOpen={showMasterFolio}
          booking={activeBooking}
          payments={payments}
          onClose={() => setShowMasterFolio(false)}
        />
      )}
    </div>
  );
}