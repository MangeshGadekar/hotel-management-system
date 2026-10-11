import { useState, useEffect, useRef } from "react";
import {
  FaHotel,
  FaTag,
  FaMoneyBillWave,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaDoorOpen,
  FaImage,
  FaTrash,
  FaSave,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaCoffee,
  FaCity,
  FaSearch,
  FaTimes,
  FaConciergeBell,
  FaShieldAlt,
  FaBath,
  FaPhoneAlt,
  FaPlug,
  FaBed,
  FaChevronDown,
} from "react-icons/fa";
import { MdBathtub, MdSmokeFree, MdSingleBed } from "react-icons/md";
import { PiDesktopTowerFill, PiTowel, PiTooth, PiWindBold } from "react-icons/pi";
import { GrLounge } from "react-icons/gr";
import { GiBathtub, GiWaterDrop, GiSlippers } from "react-icons/gi";
import { BiFridge } from "react-icons/bi";
import { TbIroning3, TbRazor } from "react-icons/tb";

export const AMENITIES_CATEGORIES = [
  {
    category: "Electronics & Tech",
    items: [
      { name: "Free Wi-Fi", icon: FaWifi, color: "text-blue-500" },
      { name: "Smart TV", icon: FaTv, color: "text-purple-500" },
      { name: "Intercom", icon: FaPhoneAlt, color: "text-[#D96B43]" },
      { name: "Power Outlets", icon: FaPlug, color: "text-amber-500" },
    ],
  },
  {
    category: "Room Features",
    items: [
      { name: "Air Conditioning", icon: FaSnowflake, color: "text-cyan-500" },
      { name: "Premium Bedding", icon: FaBed, color: "text-indigo-500" },
      { name: "Wardrobe", icon: MdSingleBed, color: "text-amber-700" },
      { name: "Luggage Rack", icon: FaConciergeBell, color: "text-[#D96B43]" },
      { name: "Study Desk", icon: PiDesktopTowerFill, color: "text-slate-600" },
      { name: "Full Mirror", icon: FaCity, color: "text-emerald-500" },
      { name: "Blackout Curtains", icon: GrLounge, color: "text-violet-600" },
    ],
  },
  {
    category: "Refreshments",
    items: [
      { name: "Electric Kettle", icon: FaCoffee, color: "text-amber-600" },
      { name: "Tea / Coffee Kit", icon: FaCoffee, color: "text-amber-700" },
      { name: "Bottled Water", icon: GiWaterDrop, color: "text-blue-400" },
      { name: "Mini Fridge", icon: BiFridge, color: "text-cyan-600" },
    ],
  },
  {
    category: "Safety & Essentials",
    items: [
      { name: "Safety Locker", icon: FaShieldAlt, color: "text-emerald-600" },
      { name: "Smoke Detector", icon: MdSmokeFree, color: "text-rose-500" },
    ],
  },
  {
    category: "Bathroom",
    items: [
      { name: "24/7 Hot Water", icon: GiWaterDrop, color: "text-orange-500" },
      { name: "Rain Shower", icon: FaBath, color: "text-blue-500" },
      { name: "Fresh Towels", icon: PiTowel, color: "text-sky-500" },
      { name: "Toiletries", icon: MdBathtub, color: "text-[#D96B43]" },
      { name: "Dental Kit", icon: PiTooth, color: "text-teal-500" },
      { name: "Shaving Kit", icon: TbRazor, color: "text-slate-500" },
      { name: "Slippers", icon: GiSlippers, color: "text-purple-400" },
    ],
  },
  {
    category: "Extra / Luxury",
    items: [
      { name: "Hairdryer", icon: PiWindBold, color: "text-pink-500" },
      { name: "Iron & Board", icon: TbIroning3, color: "text-slate-600" },
      { name: "Bathtub / Jacuzzi", icon: GiBathtub, color: "text-blue-600" },
    ],
  },
];

const ROOM_TYPES = ["SINGLE", "DOUBLE", "DELUXE", "SUITE"];
const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const EMPTY_FORM = {
  roomNumber: "",
  roomType: "DELUXE",
  pricePerNight: "",
  capacity: "",
  roomStatus: "AVAILABLE",
  amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV"],
};

const RoomForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = "",
}) => {
  const isEditMode = Boolean(initialData?.roomNumber || initialData?.id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [amenitySearch, setAmenitySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const blobUrlsRef = useRef([]);

  useEffect(() => {
    if (!initialData) {
      setFormData(EMPTY_FORM);
      setImages([]);
      return;
    }

    const rawAmen = initialData.amenities || initialData.amenityList || [];
    const existingAmenities = Array.isArray(rawAmen)
      ? rawAmen.map((a) => (typeof a === "string" ? a : a.name || a.title || ""))
      : typeof rawAmen === "string"
      ? rawAmen.split(",").map((s) => s.trim())
      : [];

    setFormData({
      roomNumber: initialData.roomNumber ?? "",
      roomType: initialData.roomType ?? "DELUXE",
      pricePerNight: initialData.pricePerNight ?? "",
      capacity: initialData.capacity ?? "",
      roomStatus: initialData.roomStatus ?? "AVAILABLE",
      amenities:
        existingAmenities.length > 0
          ? existingAmenities
          : ["Free Wi-Fi", "Air Conditioning", "Smart TV"],
    });

    setImages(
      (initialData.images || []).map((url) => ({
        kind: "existing",
        url,
        preview: url,
      }))
    );
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, []);

  const handleAddAmenity = (name) => {
    if (!formData.amenities.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, name],
      }));
    }
    setAmenitySearch("");
  };

  const handleRemoveAmenity = (name) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((item) => item !== name),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "You can upload a maximum of 5 images",
      }));
      return;
    }

    const validFiles = [];
    const newErrors = { ...errors };

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        newErrors.images = "Only image files are allowed";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.images = "Each image must be less than 5MB";
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      setErrors(newErrors);
      return;
    }

    const newEntries = validFiles.map((file) => {
      const preview = URL.createObjectURL(file);
      blobUrlsRef.current.push(preview);
      return { kind: "new", file, preview };
    });

    setImages((prev) => [...prev, ...newEntries]);
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.kind === "new" && removed.preview) {
        URL.revokeObjectURL(removed.preview);
        blobUrlsRef.current = blobUrlsRef.current.filter(
          (u) => u !== removed.preview
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber.toString().trim())
      newErrors.roomNumber = "Room number is required";
    if (!formData.roomType) newErrors.roomType = "Room type is required";
    if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0)
      newErrors.pricePerNight = "Price must be greater than 0";
    if (!formData.capacity || parseInt(formData.capacity) <= 0)
      newErrors.capacity = "Capacity must be at least 1";
    if (!formData.roomStatus) newErrors.roomStatus = "Room status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateForm()) return;

    const roomData = {
      roomNumber: formData.roomNumber.toString().trim(),
      roomType: formData.roomType,
      pricePerNight: parseFloat(formData.pricePerNight),
      capacity: parseInt(formData.capacity),
      roomStatus: formData.roomStatus,
      amenities: formData.amenities || [],
    };

    const imagePayload = images.map((img) =>
      img.kind === "new"
        ? { type: "new", file: img.file }
        : { type: "existing", url: img.url }
    );

    try {
      await onSubmit(roomData, imagePayload);
      
      // Clean up blobs if adding new
      if (!isEditMode) {
        blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        blobUrlsRef.current = [];
        setFormData(EMPTY_FORM);
        setImages([]);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const handleReset = () => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];

    if (isEditMode && initialData) {
      setFormData({
        roomNumber: initialData.roomNumber ?? "",
        roomType: initialData.roomType ?? "DELUXE",
        pricePerNight: initialData.pricePerNight ?? "",
        capacity: initialData.capacity ?? "",
        roomStatus: initialData.roomStatus ?? "AVAILABLE",
        amenities: initialData.amenities || ["Free Wi-Fi", "Air Conditioning"],
      });
      setImages(
        (initialData.images || []).map((url) => ({
          kind: "existing",
          url,
          preview: url,
        }))
      );
    } else {
      setFormData(EMPTY_FORM);
      setImages([]);
    }
    setErrors({});
    setSuccessMessage("");
  };

  const inputBase =
    "w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#D96B43]/20 focus:border-[#D96B43]";
  const inputOk = "border-slate-200 hover:border-slate-300";
  const inputErr = "border-rose-400 bg-rose-50/50";

  return (
    <div className="max-w-2xl mx-auto p-2">
      {successMessage && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-sm">
          <FaCheckCircle className="text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {submitError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-sm">
          <FaTimesCircle className="text-rose-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            <FaDoorOpen className="inline mr-1.5 text-[#D96B43]" />
            Room Number
          </label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            disabled={isEditMode}
            placeholder="e.g., 101, A-201"
            className={`${inputBase} ${
              errors.roomNumber ? inputErr : inputOk
            } ${isEditMode ? "bg-slate-100 cursor-not-allowed opacity-75" : ""}`}
          />
          {errors.roomNumber && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.roomNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <FaTag className="inline mr-1.5 text-[#D96B43]" />
              Room Type
            </label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className={`${inputBase} ${errors.roomType ? inputErr : inputOk}`}
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.roomType && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.roomType}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <FaCheckCircle className="inline mr-1.5 text-[#D96B43]" />
              Room Status
            </label>
            <select
              name="roomStatus"
              value={formData.roomStatus}
              onChange={handleChange}
              className={`${inputBase} ${
                errors.roomStatus ? inputErr : inputOk
              }`}
            >
              {ROOM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.roomStatus && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.roomStatus}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <FaMoneyBillWave className="inline mr-1.5 text-[#D96B43]" />
              Price Per Night
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`${inputBase} pl-8 ${
                  errors.pricePerNight ? inputErr : inputOk
                }`}
              />
            </div>
            {errors.pricePerNight && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.pricePerNight}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <FaUsers className="inline mr-1.5 text-[#D96B43]" />
              Capacity (Guests)
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Number of guests"
              min="1"
              className={`${inputBase} ${errors.capacity ? inputErr : inputOk}`}
            />
            {errors.capacity && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.capacity}</p>
            )}
          </div>
        </div>

        
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            <FaConciergeBell className="inline mr-1.5 text-[#D96B43]" />
            In-Room Amenities
          </label>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D96B43]/10 text-[#D96B43] border border-[#D96B43]/20 text-xs font-semibold rounded-lg shadow-2xs"
              >
                <span>{amenity}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search or select amenity..."
              value={amenitySearch}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              onChange={(e) => {
                setAmenitySearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              className={`${inputBase} pl-9 pr-9 cursor-pointer`}
            />
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FaChevronDown size={11} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-30 mt-1.5 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl p-2.5 space-y-3">
              {AMENITIES_CATEGORIES.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(amenitySearch.toLowerCase())
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                      {cat.category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isSelected = formData.amenities.includes(
                          item.name
                        );

                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveAmenity(item.name);
                              } else {
                                handleAddAmenity(item.name);
                              }
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                              isSelected
                                ? "bg-[#D96B43] text-white font-semibold shadow-xs"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className={
                                  isSelected ? "text-white" : item.color
                                }
                              />
                              <span>{item.name}</span>
                            </div>
                            {isSelected && <FaTimes size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            <FaImage className="inline mr-1.5 text-[#D96B43]" />
            Room Images
          </label>

          <label
            className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              errors.images
                ? "border-rose-400 bg-rose-50/50"
                : "border-slate-200 hover:border-[#D96B43] hover:bg-[#D96B43]/5"
            }`}
          >
            <FaPlus className="text-[#D96B43]" />
            <span className="text-xs font-medium text-slate-600">
              Click to upload images (Max 5)
            </span>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {errors.images && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.images}</p>
          )}

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div
                  key={`${img.kind}-${index}`}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-2xs"
                >
                  <img
                    src={img.preview}
                    alt={`Room preview ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-transform hover:scale-105"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-5 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D96B43] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-[#c25a34] active:scale-[0.99] transition-all ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isEditMode ? <FaSave /> : <FaPlus />}
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
              ? "Update Room"
              : "Add Room"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all"
          >
            Reset
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RoomForm;