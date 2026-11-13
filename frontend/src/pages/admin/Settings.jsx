import { useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    hotelName: "Hotel Paradise",
    email: "contact@hotelparadise.com",
    phone: "+91 98765 43210",
    address: "123 Beach Road, Goa, India",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    taxRate: "12",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("hotel_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Hotel Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your property profile, contact information, and stay timings
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
            <HiOutlineCheckCircle className="text-sm" />
            Changes saved
          </div>
        )}
      </div>

      {/* Main Settings Card */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100"
      >
        {/* Section 1: Property Info */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Property Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Hotel Name
              </label>
              <input
                type="text"
                name="hotelName"
                value={settings.hotelName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                GST / Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Support Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Timings */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Check-In & Check-Out
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Check-In Time
              </label>
              <input
                type="time"
                name="checkInTime"
                value={settings.checkInTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Check-Out Time
              </label>
              <input
                type="time"
                name="checkOutTime"
                value={settings.checkOutTime}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-[#D96B43]"
              />
            </div>
          </div>
        </div>

        {/* Footer with Save Action */}
        <div className="px-6 py-4 bg-slate-50/60 rounded-b-xl flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-[#D96B43] hover:bg-[#c45a34] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}