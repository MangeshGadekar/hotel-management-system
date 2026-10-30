import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";

export default function ExtraServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceType: "PER_STAY",
    taxRate: "18",
    category: "Transportation",
    availability: "24/7 on request",
    active: true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        priceType: initialData.priceType || "PER_STAY",
        taxRate: initialData.taxRate != null ? String(initialData.taxRate) : "18",
        category: initialData.category || "Transportation",
        availability: initialData.availability || "24/7 on request",
        active: initialData.active ?? true,
      });
      setPreviewUrl(initialData.imageUrl || null);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        priceType: "PER_STAY",
        taxRate: "18",
        category: "Transportation",
        availability: "24/7 on request",
        active: true,
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("description", formData.description ? formData.description.trim() : "");
    data.append("price", formData.price);
    data.append("priceType", formData.priceType);
    data.append("taxRate", formData.taxRate);
    data.append("category", formData.category);
    data.append("availability", formData.availability);
    data.append("active", formData.active);

    if (initialData?.imageUrl) {
      data.append("imageUrl", initialData.imageUrl);
    }

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initialData ? "Edit Extra Service" : "Add New Extra Service"}
            </h3>
            <p className="text-xs text-slate-400">
              Upload banner to Cloudinary and set service details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Cloudinary Image Dropzone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Service Banner (Cloudinary)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-[#D96B43] rounded-xl p-3 text-center cursor-pointer transition relative bg-slate-50 group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {previewUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold transition-opacity">
                    Click to change image
                  </div>
                </div>
              ) : (
                <div className="space-y-1 py-3">
                  <FaCloudUploadAlt className="mx-auto text-3xl text-slate-400 group-hover:text-[#D96B43] transition-colors" />
                  <p className="font-semibold text-slate-700">Click to upload photo</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Airport Pickup"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white"
              >
                <option value="Transportation">Transportation</option>
                <option value="Dining">Dining</option>
                <option value="Wellness">Wellness</option>
                <option value="Hospitality">Hospitality</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="1500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Billing Model
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white"
              >
                <option value="PER_STAY">Per Stay</option>
                <option value="PER_NIGHT">Per Night</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                GST Tax (%)
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D96B43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Operating Hours / Timing
            </label>
            <input
              type="text"
              placeholder="e.g. 24/7 on request or 07:00 AM - 10:30 AM"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D96B43]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              placeholder="What does this service include?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#D96B43]"
            />
          </div>

          {/* Single Footer Location for Toggle and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {/* The single Toggle Button */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                formData.active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
              }`}
            >
              {formData.active ? (
                <FaToggleOn size={18} className="text-emerald-600" />
              ) : (
                <FaToggleOff size={18} className="text-slate-400" />
              )}
              <span>{formData.active ? "Active" : "Inactive"}</span>
            </button>

            {/* Cancel & Submit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-pointer hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#D96B43] hover:bg-[#c35a34] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-xs"
              >
                {loading ? (
                  <BiLoaderAlt className="animate-spin text-sm" />
                ) : (
                  <span>{initialData ? "Save Changes" : "Create Service"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}