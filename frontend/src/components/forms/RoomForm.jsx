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
} from "react-icons/fa";

const ROOM_TYPES = ["STANDARD", "DELUXE", "SUITE", "PRESIDENTIAL"];
const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];

const EMPTY_FORM = {
  roomNumber: "",
  roomType: "DELUXE",
  pricePerNight: "",
  capacity: "",
  roomStatus: "AVAILABLE",
};

const RoomForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = "",
}) => {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  // entry: { kind: "new", file: File, preview: blobUrl }
  //      | { kind: "existing", url: string, preview: string }
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const blobUrlsRef = useRef([]);

  useEffect(() => {
    if (!initialData) {
      setFormData(EMPTY_FORM);
      setImages([]);
      return;
    }
    setFormData({
      roomNumber: initialData.roomNumber ?? "",
      roomType: initialData.roomType ?? "DELUXE",
      pricePerNight: initialData.pricePerNight ?? "",
      capacity: initialData.capacity ?? "",
      roomStatus: initialData.roomStatus ?? "AVAILABLE",
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
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, []);

  // ---------- IMAGE HANDLING (preview only, no base64) ----------
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

  const moveImage = (index, direction) => {
    setImages((prev) => {
      const updated = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  // ---------- VALIDATION / CHANGE ----------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber.trim())
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

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateForm()) return;

    const roomData = {
      roomNumber: formData.roomNumber.trim(),
      roomType: formData.roomType,
      pricePerNight: parseFloat(formData.pricePerNight),
      capacity: parseInt(formData.capacity),
      roomStatus: formData.roomStatus,
    };

    // Parent uploads new files and turns them into URLs (List<String>)
    const imagePayload = images.map((img) =>
      img.kind === "new"
        ? { type: "new", file: img.file }
        : { type: "existing", url: img.url }
    );

    try {
      await onSubmit(roomData, imagePayload);
      setSuccessMessage(
        isEditMode
          ? `Room ${roomData.roomNumber} updated successfully!`
          : `Room ${roomData.roomNumber} added successfully!`
      );
      if (!isEditMode) {
        blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        blobUrlsRef.current = [];
        setFormData(EMPTY_FORM);
        setImages([]);
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      /* parent surfaces submitError */
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
    "w-full px-4 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-[#D96B43]/30 focus:border-[#D96B43]";
  const inputOk = "border-slate-300";
  const inputErr = "border-rose-400 bg-rose-50";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-lg bg-[#D96B43]/10 flex items-center justify-center">
          <FaHotel className="text-xl text-[#D96B43]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          {isEditMode ? "Edit Room" : "Add New Room"}
        </h2>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm">
          <FaCheckCircle className="text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-sm">
          <FaTimesCircle className="text-rose-500" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaDoorOpen className="inline mr-2 text-[#D96B43]" />
            Room Number
          </label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="e.g., 101, A-201"
            className={`${inputBase} ${errors.roomNumber ? inputErr : inputOk}`}
          />
          {errors.roomNumber && (
            <p className="mt-1 text-xs text-rose-600">{errors.roomNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaTag className="inline mr-2 text-[#D96B43]" />
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
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.roomType && (
            <p className="mt-1 text-xs text-rose-600">{errors.roomType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaMoneyBillWave className="inline mr-2 text-[#D96B43]" />
            Price Per Night
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
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
            <p className="mt-1 text-xs text-rose-600">{errors.pricePerNight}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaUsers className="inline mr-2 text-[#D96B43]" />
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
            <p className="mt-1 text-xs text-rose-600">{errors.capacity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaCheckCircle className="inline mr-2 text-[#D96B43]" />
            Room Status
          </label>
          <select
            name="roomStatus"
            value={formData.roomStatus}
            onChange={handleChange}
            className={`${inputBase} ${errors.roomStatus ? inputErr : inputOk}`}
          >
            {ROOM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.roomStatus && (
            <p className="mt-1 text-xs text-rose-600">{errors.roomStatus}</p>
          )}
        </div>

        {/* ---------- IMAGES ---------- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FaImage className="inline mr-2 text-[#D96B43]" />
            Room Images
            <span className="ml-2 text-xs text-slate-400">
              (Max 5, up to 5MB each)
            </span>
          </label>

          <label
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
              errors.images
                ? "border-rose-400 bg-rose-50"
                : "border-slate-300 hover:border-[#D96B43] hover:bg-[#D96B43]/5"
            }`}
          >
            <FaPlus className="text-[#D96B43]" />
            <span className="text-sm text-slate-600">
              Click to upload images
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
            <p className="mt-1 text-xs text-rose-600">{errors.images}</p>
          )}

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div
                  key={`${img.kind}-${index}`}
                  className="relative group rounded-lg overflow-hidden border border-slate-200"
                >
                  <img
                    src={img.preview}
                    alt={`Room preview ${index + 1}`}
                    className="w-full h-28 object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-[#D96B43] text-white text-[10px] px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        className="px-2 py-1 text-xs bg-white text-slate-700 rounded hover:bg-slate-100"
                      >
                        ←
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                      title="Remove image"
                    >
                      <FaTrash size={12} />
                    </button>
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        className="px-2 py-1 text-xs bg-white text-slate-700 rounded hover:bg-slate-100"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D96B43] text-white text-sm font-semibold rounded-lg hover:bg-[#c25a34] focus:ring-4 focus:ring-[#D96B43]/30 transition-all ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isEditMode ? <FaSave /> : <FaPlus />}
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Adding..."
              : isEditMode
              ? "Save Changes"
              : "Add Room"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-all"
          >
            Reset
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-all"
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