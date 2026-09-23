import { useState } from "react";
import ReceptionistForm from "../../components/forms/ReceptionistForm";
import useReceptionistStore from "../../app/useReceptionistStore";

const INITIAL_STAFF = [
  {
    id: "REC-101",
    name: "Ananya Roy",
    email: "ananya@hotelparadise.com",
    phone: "+91 98765 43210",
    shift: "Morning (06:00 - 14:00)",
    status: "Active",
  },
  {
    id: "REC-102",
    name: "Vikram Joshi",
    email: "vikram@hotelparadise.com",
    phone: "+91 98765 43211",
    shift: "Evening (14:00 - 22:00)",
    status: "Active",
  },
  {
    id: "REC-103",
    name: "Siddharth Rao",
    email: "siddharth@hotelparadise.com",
    phone: "+91 98765 43212",
    shift: "Night (22:00 - 06:00)",
    status: "Inactive",
  },
];

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};

export default function Receptionists() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [newStaff, setNewStaff] = useState(INITIAL_FORM_STATE);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const addreceptionist = useReceptionistStore(
    (state) => state.addReceptionist,
  );

  const validateForm = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newStaff.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!newStaff.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(newStaff.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!newStaff.password || newStaff.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (
      newStaff.email.trim() &&
      staffList.some(
        (s) => s.email.toLowerCase() === newStaff.email.trim().toLowerCase(),
      )
    ) {
      nextErrors.email = "A receptionist with this email already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setNewStaff((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    console.log("validaform", newStaff);
    // if (!validateForm()) return;

    const nextStaffMember = {
      firstName: newStaff.firstName.trim(),
      lastName: newStaff.lastName.trim(),
      username: newStaff.username.trim(),
      email: newStaff.email.trim(),
      password: newStaff.password.trim(),
    };

    console.log("next", nextStaffMember);
    const res = await addreceptionist(nextStaffMember);

    console.log("res add new receptionist", res);

    handleModalClose();
  };

  const toggleStatus = (id) => {
    setStaffList((prevStaff) =>
      prevStaff.map((staff) =>
        staff.id === id
          ? {
              ...staff,
              status: staff.status === "Active" ? "Inactive" : "Active",
            }
          : staff,
      ),
    );
  };

  const handleDeleteRequest = (id) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    setStaffList((prevStaff) =>
      prevStaff.filter((s) => s.id !== pendingDeleteId),
    );
    setPendingDeleteId(null);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handleModalClose = () => {
    setNewStaff(INITIAL_FORM_STATE);
    setErrors({});
    setIsModalOpen(false);
  };

  const totalActive = staffList.filter((s) => s.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Receptionist Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff access, shifts, and credentials &middot;{" "}
            <span className="text-emerald-600 font-medium">
              {totalActive} active
            </span>{" "}
            / {staffList.length} total
          </p>
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
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-slate-400 text-sm"
                  >
                    No receptionist accounts found. Click &ldquo;+ Add New
                    Receptionist&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/60 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {staff.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {staff.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-800 font-medium">
                          {staff.email}
                        </p>
                        <p className="text-slate-400">{staff.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {staff.shift}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          staff.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            staff.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 text-xs whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(staff.id)}
                        className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                      >
                        {staff.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(staff.id)}
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
        <ReceptionistForm
          values={newStaff}
          errors={errors}
          onChange={handleInputChange}
          onSubmit={handleAddStaff}
          onClose={handleModalClose}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-rose-50 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.72-2.44l-8.48-14.7a2 2 0 0 0-3.42 0Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Remove receptionist?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  This will permanently delete the account for{" "}
                  <span className="font-medium text-slate-700">
                    {staffList.find((s) => s.id === pendingDeleteId)?.name}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDeleteCancel}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-700 text-white transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
