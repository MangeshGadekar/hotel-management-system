import { useEffect, useState } from "react";
import GuestForm from "../../components/forms/GuestForm";
import useGuestStore from "../../app/useGuestStore";

export default function Customers({ token: propToken }) {
  // Fallback to localStorage or auth store if propToken is missing
  const token =
    propToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("authToken");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const { guestList, getGuestList, removeGuest, loading } = useGuestStore();

  useEffect(() => {
    if (token) {
      getGuestList(token);
    }
  }, [token, getGuestList]);

  // Updated handleDelete with missing token check and error handling
  const handleDelete = async (id) => {
    if (!token) {
      alert("Authentication error: Token missing. Please log in again.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to delete this guest?");
    if (!isConfirmed) return;

    try {
      await removeGuest(id, token);
      if (String(selectedCustomer?.id || selectedCustomer?._id) === String(id)) {
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error("Delete Guest Error:", error);
      alert(error?.message || error || "Failed to delete guest.");
    }
  };

  // Safe search logic (Supports DB snake_case & camelCase)
  const filteredCustomers = (guestList || []).filter((guest) => {
    const firstName = guest.first_name || guest.firstName || "";
    const lastName = guest.last_name || guest.lastName || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = (guest.email || "").toLowerCase();
    const phone = (guest.phone || "").toString();
    const query = searchQuery.toLowerCase().trim();

    return fullName.includes(query) || email.includes(query) || phone.includes(query);
  });

  // Helper function to format 'Created By' column
  const getCreatedByText = (guest) => {
    const creator = guest.created_by || guest.createdBy;
    if (!creator || creator.toLowerCase() === "self" || creator.toLowerCase() === "online") {
      return { text: "Online", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (creator.toLowerCase() === "admin") {
      return { text: "Admin", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    return { text: creator, badgeClass: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Customer Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage guest accounts, verification statuses, and contact details
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowGuestForm(true);
            }}
            className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold hover:bg-[#c55e39] transition-all cursor-pointer"
          >
            Add / Update Guest
          </button>

          <input
            type="text"
            placeholder="Filter list by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43] w-full sm:w-72"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Created By</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((guest) => {
                const guestId = guest.id || guest._id;
                const firstName = guest.first_name || guest.firstName || "";
                const lastName = guest.last_name || guest.lastName || "";
                const isVerified = Boolean(guest.is_verified ?? guest.isVerified);
                const creatorInfo = getCreatedByText(guest);

                return (
                  <tr key={guestId} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      #{guestId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {firstName} {lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-800">{guest.email || "N/A"}</p>
                        <p className="text-slate-400">{guest.phone || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-800">{guest.address || "N/A"}</p>
                        <p className="text-slate-400">
                          {[guest.city, guest.state, guest.postalCode || guest.postal_code]
                            .filter(Boolean)
                            .join(", ") || "No locality info"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${creatorInfo.badgeClass}`}>
                        {creatorInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* View Icon */}
                        <button
                          onClick={() => setSelectedCustomer(guest)}
                          title="View Guest"
                          className="p-1.5 text-slate-500 hover:text-[#D96B43] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Icon */}
                        <button
                          onClick={() => {
                            setEditingCustomer(guest);
                            setShowGuestForm(true);
                          }}
                          title="Edit Guest"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete Icon */}
                        <button
                          onClick={() => handleDelete(guestId)}
                          title="Delete Guest"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedCustomer.first_name || selectedCustomer.firstName} {selectedCustomer.last_name || selectedCustomer.lastName}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  Boolean(selectedCustomer.is_verified ?? selectedCustomer.isVerified)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {Boolean(selectedCustomer.is_verified ?? selectedCustomer.isVerified) ? "Verified" : "Unverified"}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 max-h-[60vh] overflow-y-auto pr-1">
              <p><span className="font-semibold text-slate-800">ID:</span> #{selectedCustomer.id || selectedCustomer._id}</p>
              <p><span className="font-semibold text-slate-800">Created / Registered By:</span> {getCreatedByText(selectedCustomer).text}</p>
              <p><span className="font-semibold text-slate-800">Email:</span> {selectedCustomer.email || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Phone:</span> {selectedCustomer.phone || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">DOB:</span> {selectedCustomer.date_of_birth || selectedCustomer.dateOfBirth || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Address:</span> {selectedCustomer.address || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">City:</span> {selectedCustomer.city || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">State:</span> {selectedCustomer.state || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">Postal Code:</span> {selectedCustomer.postal_code || selectedCustomer.postalCode || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">ID Type:</span> {selectedCustomer.id_proof_type || selectedCustomer.idProofType || "N/A"}</p>
              <p><span className="font-semibold text-slate-800">ID Number:</span> {selectedCustomer.id_proof_number || selectedCustomer.idProofNumber || "N/A"}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCustomer ? "Edit Guest Details" : "Add / Register Guest"}
              </h3>
              <button
                onClick={() => {
                  setShowGuestForm(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <GuestForm
              initialData={editingCustomer}
              token={token}
              onSuccess={() => {
                setShowGuestForm(false);
                setEditingCustomer(null);
                getGuestList(token);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}