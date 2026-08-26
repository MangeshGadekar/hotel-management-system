import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Rooms', path: '/admin/rooms' },
  { label: 'Bookings', path: '/admin/bookings' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Coupons', path: '/admin/coupons' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Settings', path: '/admin/settings' },
  { label: 'Receptionists', path: '/admin/receptionists' },
  { label: 'Home', path: '/' },

];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#1E2530] text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/60">
        <div className="w-7 h-7 rounded-full border-2 border-[#D96B43] flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-[#D96B43] rounded-full"></div>
        </div>
        <span className="text-sm font-bold tracking-widest text-white uppercase">ADMIN PANEL</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#D96B43] text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <button className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white transition">
          Logout
        </button>
      </div>
    </aside>
  );
}