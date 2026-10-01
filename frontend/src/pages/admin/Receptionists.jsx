import { useState } from 'react';
import useReceptionistStore from "../../app/useReceptionistStore";

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
};

export default function Receptionists() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Zustand Store Hooks
  const { receptionistList, addReceptionist, deleteReceptionist } = useReceptionistStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    const payload = {
      firstName: newStaff.firstName.trim(),
      lastName: newStaff.lastName.trim(),
      username: newStaff.username.trim(),
      email: newStaff.email.trim(),
      password: newStaff.password,
    };

    setIsLoading(true);

    try {
      // Calling addReceptionist from Zustand store
      await addReceptionist(payload);
      setNewStaff(INITIAL_FORM_STATE);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create receptionist:', error);
      alert('Error creating receptionist account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this receptionist account?')) {
      await deleteReceptionist(id);
    }
  };

  const handleModalClose = () => {
    setNewStaff(INITIAL_FORM_STATE);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Receptionist Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage staff access, shifts, and credentials</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Add New Receptionist
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Staff ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receptionistList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No receptionist accounts found. Click "+ Add New Receptionist" to create one.
                  </td>
                </tr>
              ) : (
                receptionistList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{staff.id || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {staff.firstName} {staff.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-800 font-medium">{staff.email}</p>
                        <p className="text-slate-400">@{staff.username}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          staff.status === 'Active' || !staff.status
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {staff.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 text-xs">
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="px-2.5 py-1 rounded-md border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Receptionist Modal Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Add Receptionist Account</h3>
            <form onSubmit={handleAddStaff} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={newStaff.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={newStaff.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={newStaff.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={newStaff.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newStaff.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isLoading}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg font-semibold text-xs shadow-xs transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}