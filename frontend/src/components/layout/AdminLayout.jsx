import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuthStore from "../../app/useAuthStore";
import { MdFaceUnlock } from "react-icons/md";
import { FiLogIn } from "react-icons/fi";

export default function AdminLayout() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

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
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200">
                {avatarInitial}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{adminName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">System Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}