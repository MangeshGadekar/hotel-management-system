import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUserGroup,
  HiOutlineLogout
} from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { LuHotel } from "react-icons/lu";

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard },
  { label: 'Rooms', path: '/admin/rooms', icon: LuHotel},
  { label: 'Bookings', path: '/admin/bookings', icon: HiOutlineCalendar },
  { label: 'Customers', path: '/admin/customers', icon: HiOutlineUsers },
  { label: 'Payments', path: '/admin/payments', icon: HiOutlineCreditCard },
  { label: 'Coupons', path: '/admin/coupons', icon: HiOutlineTicket },
  { label: 'Reports', path: '/admin/reports', icon: HiOutlineChartBar },
  { label: 'Settings', path: '/admin/settings', icon: HiOutlineCog },
  { label: 'Receptionists', path: '/admin/receptionists', icon: HiOutlineUserGroup },
  { label: 'Home', path: '/', icon: HiOutlineHome },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-[#faf7f2] to-[#f5efe8] text-slate-700 flex flex-col h-screen border-r border-[#e8dccc]/60 shrink-0 shadow-lg shadow-black/5">
      {/* Brand Header - Light Amber Themed */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-[#e8dccc]/60 bg-gradient-to-r from-[#faf7f2] to-[#f5efe8] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg shadow-[#F59E0B]/20">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <span className="text-sm font-bold tracking-widest text-[#8B7355] uppercase">
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white shadow-lg shadow-[#F59E0B]/30 scale-[1.02]'
                    : 'text-slate-600 hover:bg-[#F59E0B]/10 hover:text-[#8B7355] hover:translate-x-1'
                }`
              }
            >
              <Icon className={`w-5 h-5 transition-all ${
                location.pathname === item.path 
                  ? 'text-white' 
                  : 'text-slate-400 group-hover:text-[#F59E0B]'
              }`} />
              <span className="flex-1">{item.label}</span>
              {location.pathname === item.path && (
                <span className="w-1 h-6 bg-white rounded-full shadow-lg shadow-white/50"></span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer - Light Amber Themed */}
      <div className="p-4 border-t border-[#e8dccc]/60 bg-gradient-to-b from-transparent to-[#faf7f2]">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 hover:text-[#8B7355] transition-all duration-200 rounded-lg hover:bg-[#F59E0B]/10 hover:translate-x-1 group">
          <HiOutlineLogout className="w-5 h-5 text-slate-400 group-hover:text-[#F59E0B] transition-colors" />
          <span className="flex-1 text-left">Logout</span>
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-[#F59E0B]">→</span>
        </button>
      </div>
    </aside>
  );
}