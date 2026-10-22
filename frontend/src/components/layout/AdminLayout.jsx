import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuthStore from "../../app/useAuthStore";
import { fetchProfile, updateProfile } from "../../apis/api";
import { MdFaceUnlock } from "react-icons/md";
import { FiLogIn } from "react-icons/fi";

function ProfileModal({ token, onClose, onSaved }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    fetchProfile(token)
      .then((response) => {
        if (!active) return;
        const data = response?.data;
        setProfile(data);
        setForm({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          username: data?.username || "",
          password: "",
        });
      })
      .catch(async (requestError) => {
        let message = "Could not load your profile. Please try again.";
        try {
          const body = await requestError.response.json();
          message = body?.message || message;
        } catch {
          // Keep the fallback message when no JSON error body is available.
        }
        if (active) setError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
    };
    if (form.password.trim()) payload.password = form.password;

    try {
      const response = await updateProfile(payload, token);
      const updatedProfile = response?.data;
      setProfile(updatedProfile);
      setForm((current) => ({ ...current, password: "" }));
      onSaved(updatedProfile);
      setSuccess("Your profile has been updated.");
    } catch (requestError) {
      let message = "Could not update your profile. Please try again.";
      try {
        const body = await requestError.response.json();
        message = body?.message || message;
      } catch {
        // Keep the fallback message when no JSON error body is available.
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Account</p>
            <h2 id="profile-title" className="mt-1 text-xl font-bold text-slate-900">Your profile</h2>
            <p className="mt-1 text-sm text-slate-500">Update your account details and password.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading profile…</div>
        ) : error && !profile ? (
          <div className="p-6">
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            <button type="button" onClick={onClose} className="mt-4 text-sm font-semibold text-slate-600 hover:text-slate-900">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                First name
                <input
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Last name
                <input
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="text-sm font-medium text-slate-700">
                Email address
                <p className="mt-1.5 truncate rounded-lg bg-slate-50 px-3 py-2.5 font-normal text-slate-500">{profile?.email || "—"}</p>
              </div>
              <div className="text-sm font-medium text-slate-700">
                Role
                <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2.5 font-normal capitalize text-slate-500">{profile?.role?.toLowerCase() || "—"}</p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              New password <span className="font-normal text-slate-400">(optional)</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Leave blank to keep your current password"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default function AdminLayout() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [profileOpen, setProfileOpen] = useState(false);

  // Determine admin name and avatar initial
  const adminName = user?.name || user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Admin";
  const avatarInitial = adminName.charAt(0).toUpperCase();

  if (!token) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4">
        {/* Icon badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shadow-sm ring-1 ring-amber-200">
          <MdFaceUnlock className="h-7 w-7 text-amber-600" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Please login first
          </h1>
          <p className="max-w-sm text-sm text-gray-500">
            You need to be signed in to access this page.
          </p>
        </div>
        <a
          href="/login"
          className="group inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-amber-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          <FiLogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            <span className="h-4 w-[1px] bg-slate-200"></span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-600 font-medium">
                Logged in as <span className="font-bold text-slate-800">{adminName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="date"
              defaultValue="2026-05-12"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
            />

            {/* Admin Avatar & Profile Badge */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open your profile"
              className="flex items-center gap-2.5 rounded-xl border-l border-slate-200 pl-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200">
                {avatarInitial}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{adminName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">System Administrator</p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
      {profileOpen && (
        <ProfileModal
          token={token}
          onClose={() => setProfileOpen(false)}
          onSaved={(updatedProfile) => {
            useAuthStore.setState((state) => ({
              user: { ...state.user, ...updatedProfile },
            }));
          }}
        />
      )}
    </div>
  );
}
