import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUserGroup,
  HiOutlineLogout,
} from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { LuHotel } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../app/useAuthStore";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role?.toLowerCase() ?? "guest";
  const navigate = useNavigate()

  const adminNavItems = [
    { label: "Dashboard", path: `/admin/dashboard`, icon: MdDashboard },
    { label: "Rooms", path: `/admin/rooms`, icon: LuHotel },
    { label: "Bookings", path: `/admin/bookings`, icon: HiOutlineCalendar },
    { label: "Customers", path: `/admin/customers`, icon: HiOutlineUsers },
    { label: "Payments", path: `/admin/payments`, icon: HiOutlineCreditCard },
    { label: "Coupons", path: `/admin/coupons`, icon: HiOutlineTicket },
    { label: "Reports", path: `/admin/reports`, icon: HiOutlineChartBar },
    { label: "Settings", path: `/admin/settings`, icon: HiOutlineCog },
    {
      label: "Receptionists",
      path: `/admin/receptionists`,
      icon: HiOutlineUserGroup,
    },
    { label: "Home", path: "/", icon: HiOutlineHome },
  ];

  const receptionistNavItems = [
    { label: "Dashboard", path: `/receptionist/dashboard`, icon: MdDashboard },
    { label: "Rooms", path: `/receptionist/rooms`, icon: LuHotel },
    {
      label: "Bookings",
      path: `/receptionist/bookings`,
      icon: HiOutlineCalendar,
    },
    {
      label: "Customers",
      path: `/receptionist/customers`,
      icon: HiOutlineUsers,
    },
    {
      label: "Payments",
      path: `/receptionist/payments`,
      icon: HiOutlineCreditCard,
    },
    { label: "Coupons", path: `/receptionist/coupons`, icon: HiOutlineTicket },
    { label: "Home", path: "/", icon: HiOutlineHome },
  ];

  const handleLogout = async() => {
    try {
        await logout()
        navigate('/login')
    } catch (error) {
        console.log("ERROR", error)
    }
  }

  const navItems =
    role === "admin"
      ? adminNavItems
      : role === "receptionist"
        ? receptionistNavItems
        : [];

  // ---- Theme tokens per role ----
  const theme =
    role === "admin"
      ? {
          sidebarBg: "from-[#FFF7ED] to-[#FFEDD5]",
          sidebarBorder: "border-orange-200/70",
          brandGradient: "from-orange-500 to-amber-400",
          brandShadow: "shadow-orange-500/20",
          brandText: "text-orange-800",
          glow: "bg-orange-400/15",
          activeGradient: "from-orange-500 to-amber-400",
          activeShadow: "shadow-orange-500/30",
          hoverBg: "hover:bg-orange-500/10",
          hoverText: "hover:text-orange-800",
          iconHover: "group-hover:text-orange-600",
          footerBg: "to-[#FFF7ED]",
          footerHover: "hover:text-orange-800 hover:bg-orange-500/10",
          footerIconHover: "group-hover:text-orange-600",
          arrow: "text-orange-600",
        }
      : role === "receptionist"
        ? {
            sidebarBg: "from-[#F5F9F6] to-[#EAF4EE]",
            sidebarBorder: "border-emerald-200/70",
            brandGradient: "from-emerald-500 to-emerald-400",
            brandShadow: "shadow-emerald-500/20",
            brandText: "text-emerald-800",
            glow: "bg-emerald-400/15",
            activeGradient: "from-emerald-500 to-emerald-400",
            activeShadow: "shadow-emerald-500/30",
            hoverBg: "hover:bg-emerald-500/10",
            hoverText: "hover:text-emerald-800",
            iconHover: "group-hover:text-emerald-600",
            footerBg: "to-[#F5F9F6]",
            footerHover: "hover:text-emerald-800 hover:bg-emerald-500/10",
            footerIconHover: "group-hover:text-emerald-600",
            arrow: "text-emerald-600",
          }
        : {
            // fallback (guest / unknown)
            sidebarBg: "from-slate-50 to-slate-100",
            sidebarBorder: "border-slate-200/70",
            brandGradient: "from-slate-500 to-slate-400",
            brandShadow: "shadow-slate-500/20",
            brandText: "text-slate-800",
            glow: "bg-slate-400/15",
            activeGradient: "from-slate-500 to-slate-400",
            activeShadow: "shadow-slate-500/30",
            hoverBg: "hover:bg-slate-500/10",
            hoverText: "hover:text-slate-800",
            iconHover: "group-hover:text-slate-600",
            footerBg: "to-slate-50",
            footerHover: "hover:text-slate-800 hover:bg-slate-500/10",
            footerIconHover: "group-hover:text-slate-600",
            arrow: "text-slate-600",
          };

  return (
    <aside
      className={`w-64 bg-gradient-to-b ${theme.sidebarBg} text-slate-700 flex flex-col h-screen border-r ${theme.sidebarBorder} shrink-0 shadow-lg shadow-black/5`}
    >
      {/* Brand Header */}
      <div
        className={`h-20 flex items-center px-6 gap-3 border-b ${theme.sidebarBorder} bg-gradient-to-r ${theme.sidebarBg} relative overflow-hidden`}
      >
        <div
          className={`absolute top-0 right-0 w-32 h-32 ${theme.glow} rounded-full blur-2xl`}
        />
        <div
          className={`relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br ${theme.brandGradient} flex items-center justify-center shadow-lg ${theme.brandShadow}`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </div>
        <div className="relative z-10">
          <span
            className={`text-sm font-bold tracking-widest ${theme.brandText} uppercase`}
          >
            Paradise
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path.endsWith("/dashboard")}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? `bg-gradient-to-r ${theme.activeGradient} text-white shadow-lg ${theme.activeShadow} scale-[1.02]`
                    : `text-slate-600 ${theme.hoverBg} ${theme.hoverText} hover:translate-x-1`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-all ${
                      isActive
                        ? "text-white"
                        : `text-slate-400 ${theme.iconHover}`
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-1 h-6 bg-white rounded-full shadow-lg shadow-white/50" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div
        className={`p-4 border-t ${theme.sidebarBorder} bg-gradient-to-b from-transparent ${theme.footerBg}`}
      >
        <button
          type="button"
          onClick={() => handleLogout()}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 transition-all duration-200 rounded-lg hover:translate-x-1 group ${theme.footerHover}`}
        >
          <HiOutlineLogout
            className={`w-5 h-5 text-slate-400 transition-colors ${theme.footerIconHover}`}
          />
          <span className="flex-1 text-left">Logout</span>
          <span
            className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${theme.arrow}`}
          >
            →
          </span>
        </button>
      </div>
    </aside>
  );
}