import { useState } from 'react';

const INITIAL_STAFF = [
  { id: 'REC-101', name: 'Ananya Roy', email: 'ananya@hotelparadise.com', phone: '+91 98765 43210', shift: 'Morning (06:00 - 14:00)', status: 'Active' },
  { id: 'REC-102', name: 'Vikram Joshi', email: 'vikram@hotelparadise.com', phone: '+91 98765 43211', shift: 'Evening (14:00 - 22:00)', status: 'Active' },
  { id: 'REC-103', name: 'Siddharth Rao', email: 'siddharth@hotelparadise.com', phone: '+91 98765 43212', shift: 'Night (22:00 - 06:00)', status: 'Inactive' },
];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  shift: 'Morning (06:00 - 14:00)',
  password: '',
};

export default function Receptionists() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [newStaff, setNewStaff] = useState(INITIAL_FORM_STATE);

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) return;

    setStaffList((prevStaff) => {
      // Find maximum existing numeric ID to prevent duplicate keys after deletions
      const lastIdNum = prevStaff.reduce((max, s) => {
        const num = parseInt(s.id.replace('REC-', ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 100);

      const nextStaffMember = {
        id: `REC-${lastIdNum + 1}`,
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        phone: newStaff.phone.trim() || 'N/A',
        shift: newStaff.shift,
        status: 'Active',
      };

      return [...prevStaff, nextStaffMember];
    });

    setNewStaff(INITIAL_FORM_STATE);
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    setStaffList((prevStaff) =>
      prevStaff.map((staff) =>
        staff.id === id
          ? { ...staff, status: staff.status === 'Active' ? 'Inactive' : 'Active' }
          : staff
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this receptionist account?')) {
      setStaffList((prevStaff) => prevStaff.filter((staff) => staff.id !== id));
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
                <th className="px-6 py-3">Assigned Shift</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No receptionist accounts found. Click "+ Add New Receptionist" to create one.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{staff.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{staff.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-800 font-medium">{staff.email}</p>
                        <p className="text-slate-400">{staff.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">{staff.shift}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          staff.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 text-xs">
                      <button
                        onClick={() => toggleStatus(staff.id)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                      >
                        {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
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

      {/* Add Receptionist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Add Receptionist Account</h3>
            <form onSubmit={handleAddStaff} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="ananya@hotelparadise.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Timing</label>
                <select
                  value={newStaff.shift}
                  onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                >
                  <option>Morning (06:00 - 14:00)</option>
                  <option>Evening (14:00 - 22:00)</option>
                  <option>Night (22:00 - 06:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white rounded-lg font-semibold text-xs shadow-xs transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}