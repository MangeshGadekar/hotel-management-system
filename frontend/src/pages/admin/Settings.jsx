import { useState } from 'react';

export default function Settings() {
  const [hotelDetails, setHotelDetails] = useState({
    name: 'Hotel Paradise',
    email: 'contact@hotelparadise.com',
    phone: '+91 98765 43210',
    address: '123 Beach Road, Goa, India',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    taxRate: '12',
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Hotel settings updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Hotel Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage property details, policies, and system defaults</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Property Identification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hotel Brand Name</label>
              <input
                type="text"
                value={hotelDetails.name}
                onChange={(e) => setHotelDetails({ ...hotelDetails, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Support Email</label>
              <input
                type="email"
                value={hotelDetails.email}
                onChange={(e) => setHotelDetails({ ...hotelDetails, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={hotelDetails.phone}
                onChange={(e) => setHotelDetails({ ...hotelDetails, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">GST / Tax Rate (%)</label>
              <input
                type="number"
                value={hotelDetails.taxRate}
                onChange={(e) => setHotelDetails({ ...hotelDetails, taxRate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Check-In / Check-Out Timings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Standard Check-In Time</label>
              <input
                type="time"
                value={hotelDetails.checkInTime}
                onChange={(e) => setHotelDetails({ ...hotelDetails, checkInTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Standard Check-Out Time</label>
              <input
                type="time"
                value={hotelDetails.checkOutTime}
                onChange={(e) => setHotelDetails({ ...hotelDetails, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-5 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg transition shadow-xs">
            Save Policy Changes
          </button>
        </div>
      </form>
    </div>
  );
}