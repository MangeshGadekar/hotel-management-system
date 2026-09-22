import { useEffect, useState } from "react";
import GuestForm from "../../components/forms/GuestForm";
import useGuestStore from "../../app/useGuestStore";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showGuestForm, setShowGuestForm] = useState(false);

  // Get state from Zustand
  const guestList = useGuestStore((state) => state.guestList);
  const getGuestList = useGuestStore((state) => state.getGuestList);

  // Fetch guests when component mounts
  useEffect(() => {
    getGuestList();
  }, [getGuestList]);

  const filteredCustomers = guestList.filter(
    (guest) =>
      `${guest.firstName} ${guest.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Customer Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            View guest profiles, stay history, and lifetime value
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowGuestForm(true)}
            className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold"
          >
            Add Guest
          </button>

          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43] w-full sm:w-72"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Customer ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">ID Proof</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((guest) => (
                <tr
                  key={guest.id}
                  className="hover:bg-slate-50/60 transition"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    #{guest.id}
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {guest.firstName} {guest.lastName}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-800">{guest.email}</p>
                      <p className="text-slate-400">{guest.phone}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-800">{guest.address}</p>

                      <p className="text-slate-400">
                        {guest.city}, {guest.state} - {guest.postalCode}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-800">{guest.idProofType}</p>
                      <p className="text-slate-400">
                        {guest.idProofNumber}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(guest)}
                      className="text-xs font-semibold text-[#D96B43] hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h3>

              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                Guest
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">
                  Customer ID:
                </span>{" "}
                #{selectedCustomer.id}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  Email:
                </span>{" "}
                {selectedCustomer.email}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  Phone:
                </span>{" "}
                {selectedCustomer.phone}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  Address:
                </span>{" "}
                {selectedCustomer.address}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  City:
                </span>{" "}
                {selectedCustomer.city}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  State:
                </span>{" "}
                {selectedCustomer.state}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  Postal Code:
                </span>{" "}
                {selectedCustomer.postalCode}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  ID Proof Type:
                </span>{" "}
                {selectedCustomer.idProofType}
              </p>

              <p>
                <span className="font-semibold text-slate-800">
                  ID Proof Number:
                </span>{" "}
                {selectedCustomer.idProofNumber}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Add Guest
              </h3>

              <button
                onClick={() => setShowGuestForm(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <GuestForm
              onSuccess={() => {
                setShowGuestForm(false);
                getGuestList();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

