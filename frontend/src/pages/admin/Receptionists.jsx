import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import ReceptionistForm from "../../components/forms/ReceptionistForm";
import useReceptionistStore from "../../app/useReceptionistStore";

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-orange-500",
];

const getInitials = (first = "", last = "") => {
  const f = first.trim().charAt(0).toUpperCase();
  const l = last.trim().charAt(0).toUpperCase();
  return `${f}${l}` || "?";
};

const colorFromString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function Receptionists() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newStaff, setNewStaff] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const receptionistList = useReceptionistStore((s) => s.receptionistList);
  const getAllReceptionist = useReceptionistStore((s) => s.getAllReceptionist);
  const addReceptionist = useReceptionistStore((s) => s.addReceptionist);
  const updateReceptionist = useReceptionistStore((s) => s.updateReceptionist);
  const deleteReceptionist = useReceptionistStore((s) => s.deleteReceptionist);

  const loadReceptionists = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      await getAllReceptionist();
    } catch (err) {
      console.error("Failed to load receptionists:", err);
      setLoadError(err?.message || "Failed to load receptionists.");
    } finally {
      setIsLoading(false);
    }
  }, [getAllReceptionist]);

  useEffect(() => {
    loadReceptionists();
  }, [loadReceptionists]);

  const validateForm = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newStaff.firstName.trim())
      nextErrors.firstName = "First name is required.";
    if (!newStaff.lastName.trim())
      nextErrors.lastName = "Last name is required.";

    if (!editingId && !newStaff.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (!newStaff.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(newStaff.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
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

  const handleModalClose = () => {
    setNewStaff(INITIAL_FORM_STATE);
    setErrors({});
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setNewStaff(INITIAL_FORM_STATE);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (staff) => {
    setEditingId(staff.id);
    setNewStaff({
      firstName: staff.firstName ?? "",
      lastName: staff.lastName ?? "",
      email: staff.email ?? "",
      password: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    const payload = {
      firstName: newStaff.firstName.trim(),
      lastName: newStaff.lastName.trim(),
      email: newStaff.email.trim(),
    };

    if (newStaff.password.trim()) {
      payload.password = newStaff.password.trim();
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateReceptionist(editingId, payload);
      } else {
        await addReceptionist(payload);
      }
      handleModalClose();
    } catch (err) {
      console.error("Failed to save receptionist:", err);
      setErrors((prev) => ({
        ...prev,
        email: err?.response?.data?.message || err?.message || "Operation failed.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (staff) => {
    setDeleteTarget(staff);
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteReceptionist(deleteTarget.id);
    } catch (err) {
      console.error("Failed to delete receptionist:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Receptionist Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff access and credentials &middot;{" "}
            <span className="text-emerald-600 font-medium">
              {receptionistList.length} total
            </span>
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
        >
          + Add New Receptionist
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Staff ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">
                    Loading receptionists…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-rose-500 text-sm">
                    {loadError}
                  </td>
                </tr>
              ) : receptionistList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No receptionist accounts found. Click &ldquo;+ Add New Receptionist&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                receptionistList.map((staff, index) => {
                  const initials = getInitials(staff.firstName, staff.lastName);
                  const avatarColor = colorFromString(
                    `${staff.firstName}${staff.lastName}${staff.id ?? ""}`
                  );

                  return (
                    <tr key={staff.id ?? staff.email ?? index} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        REC-{staff.id ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 flex-shrink-0 rounded-full ${avatarColor} text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shadow-sm`}>
                            {initials}
                          </div>
                          <p className="font-medium text-slate-800 truncate">
                            {`${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        {staff.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(staff)}
                            title="Edit receptionist"
                            className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(staff)}
                            title="Delete receptionist"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ReceptionistForm
          values={newStaff}
          errors={errors}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={handleModalClose}
          isSubmitting={isSubmitting}
          isEditMode={Boolean(editingId)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800">Delete receptionist?</h2>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {`${deleteTarget.firstName ?? ""} ${deleteTarget.lastName ?? ""}`.trim()}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}