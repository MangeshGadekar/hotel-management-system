import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaConciergeBell,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSearch,
  FaClock,
  FaPercent,
  FaImage,
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import useExtraServiceStore from "../../app/useExtraServiceStore";
import useAuthStore from "../../app/useAuthStore";
import ExtraServiceFormModal from "../../components/forms/ExtraServiceFormModal";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-200 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
};

const formatPrice = (price) => `₹${Number(price ?? 0).toLocaleString()}`;

const isServiceOpenNow = (availability) => {
  if (!availability || typeof availability !== "string") return true;
  const sched = availability.trim().toLowerCase();

  if (
    sched.includes("24/7") ||
    sched.includes("daily") ||
    sched.includes("no specific") ||
    sched.includes("on request") ||
    sched.includes("on-demand") ||
    sched.includes("advance booking")
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

    if (endMins >= startMins) {
      return currentMins >= startMins && currentMins <= endMins;
    } else {
      return currentMins >= startMins || currentMins <= endMins;
    }
  } catch {
    return true;
  }
};

function AdminServiceCard({ service, onEdit, onDelete, onViewDetails }) {
  const displayStatus = service.active ? "ACTIVE" : "INACTIVE";
  const isOpen = service.active && isServiceOpenNow(service.availability);
  const hasImage = Boolean(service.imageUrl && service.imageUrl.trim());

  return (
    <div
      onClick={() => onViewDetails(service)}
      className={`group relative bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer ${
        service.active
          ? "border-slate-200 hover:border-[#D96B43]/50"
          : "border-slate-200 opacity-60 bg-slate-50/60"
      }`}
    >
      <div>
        {/* Banner Section */}
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100 flex items-center justify-center">
          {hasImage ? (
            <>
              <img
                src={service.imageUrl}
                alt={service.name}
                className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                  service.active ? "group-hover:scale-105" : "grayscale"
                }`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-4 text-center">
              <FaImage className="text-2xl text-slate-300" />
              <span className="text-[11px] font-medium text-slate-500">not preview image yet</span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white shadow-xs">
              {service.category || "General"}
            </span>

            <div className="flex items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shadow-xs ${
                  STATUS_BADGES[displayStatus]
                }`}
              >
                {displayStatus}
              </span>
            </div>
          </div>

          {/* Price Pill */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-white">
            <span className="text-xs font-black font-mono">{formatPrice(service.price)}</span>
            <span className="text-[10px] text-white/70 ml-1">
              /{service.priceType === "PER_NIGHT" ? "night" : "stay"}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 text-[9px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10">
            +{service.taxRate != null ? service.taxRate : 18}% GST
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3.5 space-y-2">
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#D96B43] transition-colors truncate">
            {service.name}
          </h3>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
              <FaClock className="text-[#D96B43] w-2.5 h-2.5" />
              <span className="font-medium truncate max-w-[150px]" title={service.availability || "Daily"}>
                {service.availability || "Daily"}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
              <FaPercent className="text-[#D96B43] w-2.5 h-2.5" />
              <span className="font-medium">{service.taxRate != null ? service.taxRate : 18}% GST</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {service.description || "Pre-defined hotel catalog amenity package."}
          </p>
        </div>
      </div>

      {/* Action Row: Edit & Delete only */}
      <div className="flex items-center gap-2 p-3.5 pt-0 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(service);
          }}
          className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FaEdit className="w-2.5 h-2.5 text-slate-600" /> Edit
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(service);
          }}
          className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FaTrash className="w-2.5 h-2.5" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function ExtraServices() {
  const token =
    useAuthStore((state) => state.token) ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const {
    services,
    fetchAdminServices,
    addService,
    editService,
    removeService,
    loading,
  } = useExtraServiceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedDetailsService, setSelectedDetailsService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      await fetchAdminServices(token);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }, [fetchAdminServices, token]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const adminDefinedServices = useMemo(() => {
    const rawList = Array.isArray(services) ? services : [];

    const nonAdHoc = rawList.filter((s) => {
      const cat = String(s.category || "").toLowerCase().replace(/[\s-_]/g, "");
      if (cat === "roomaddon") return false;

      const desc = String(s.description || "").toLowerCase().trim();
      if (
        desc.includes("custom service") ||
        desc.includes("bespoke charge") ||
        desc.includes("booking #") ||
        desc.includes("reservation #")
      ) {
        return false;
      }

      if (s.bookingId || s.booking_id || s.booking || s.isCustom || s.custom) {
        return false;
      }

      return true;
    });

    const masterMap = new Map();
    const sorted = [...nonAdHoc].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    for (const item of sorted) {
      const dedupeKey = `${String(item.name || "").trim().toLowerCase()}_${String(item.category || "").trim().toLowerCase()}`;
      if (!masterMap.has(dedupeKey)) {
        masterMap.set(dedupeKey, item);
      }
    }

    return Array.from(masterMap.values());
  }, [services]);

  const categories = useMemo(() => {
    const setOfCats = new Set(
      adminDefinedServices
        .map((s) => s.category)
        .filter((cat) => Boolean(cat) && cat.toLowerCase().replace(/[\s-_]/g, "") !== "roomaddon")
    );
    return ["ALL", ...Array.from(setOfCats)];
  }, [adminDefinedServices]);

  const filteredServices = useMemo(() => {
    return adminDefinedServices.filter((service) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        (service.description || "").toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "ALL" || service.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [adminDefinedServices, searchQuery, selectedCategory]);

  const openAddModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleModalSubmit = async (payload) => {
    setModalLoading(true);
    try {
      const serviceName = payload.get ? payload.get("name") : (editingService?.name || "service");
      if (editingService) {
        await editService(editingService.id, payload, token);
        toast.success(`Updated "${serviceName}" successfully!`);
      } else {
        await addService(payload, token);
        toast.success(`Created service "${serviceName}"!`);
      }
      closeModal();
      loadServices();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteService = async (service) => {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await removeService(service.id, token);
      toast.success(`Deleted "${service.name}"`);
      loadServices();
    } catch {
      toast.error("Failed to delete service.");
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D96B43] mx-auto"></div>
          <p className="mt-3 text-slate-500 text-xs">Loading extra services catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Extra Services & Add-Ons
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Extra Services catalog, pricing, and availability for your hotel guests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-[#D96B43]/20 focus:border-[#D96B43]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="shrink-0 px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <FiPlus size={15} /> Add New Service
          </button>
        </div>
      </div>

      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              onEdit={openEditModal}
              onDelete={handleDeleteService}
              onViewDetails={(s) => setSelectedDetailsService(s)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
            <FaConciergeBell className="text-slate-300 text-3xl mx-auto mb-2" />
            <p className="text-slate-500 text-xs font-medium">
              {searchQuery
                ? `No extra services matching "${searchQuery}"`
                : "No pre-defined extra services available in catalog."}
            </p>
          </div>
        )}
      </div>

      {selectedDetailsService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
              {selectedDetailsService.imageUrl && selectedDetailsService.imageUrl.trim() ? (
                <img
                  src={selectedDetailsService.imageUrl}
                  alt={selectedDetailsService.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-4 text-center">
                  <FaImage className="text-3xl text-slate-300" />
                  <span className="text-xs font-medium text-slate-500">not preview image yet</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedDetailsService(null)}
                className="absolute top-3 right-3 text-white/90 bg-black/60 hover:bg-black/90 p-2 rounded-full transition cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDetailsService.name}</h3>
                <span className="text-xs text-[#D96B43] font-semibold">
                  {selectedDetailsService.category || "General"} Catalog Item
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rate</div>
                  <div className="text-sm font-bold text-slate-800 font-mono">
                    {formatPrice(selectedDetailsService.price)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Billing</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedDetailsService.priceType === "PER_NIGHT" ? "Per Night" : "Per Stay"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">GST Rate</div>
                  <div className="text-sm font-bold text-slate-800 font-mono">
                    {selectedDetailsService.taxRate != null ? selectedDetailsService.taxRate : 18}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Operating Hours</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {selectedDetailsService.availability || "Daily"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      isServiceOpenNow(selectedDetailsService.availability)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {isServiceOpenNow(selectedDetailsService.availability) ? "Available Now" : "Currently Closed"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedDetailsService.description || "No extended description provided for this service."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ExtraServiceFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editingService}
        loading={modalLoading}
      />
    </div>
  );
}