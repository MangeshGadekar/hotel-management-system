import StatCard from '../../components/common/StatCard';

export default function Dashboard() {
  const stats = [
    { title: 'Total Revenue', value: '₹2,45,600', change: '↑ 12%', isPositive: true },
    { title: 'Total Bookings', value: '128', change: '↑ 8%', isPositive: true },
    { title: 'Occupied Rooms', value: '45', change: '↑ 9%', isPositive: true },
    { title: 'Available Rooms', value: '35', change: '↓ 4%', isPositive: false },
  ];

  const recentBookings = [
    { id: 'HM10254', name: 'Rahul Sharma', checkIn: '12 May', checkOut: '14 May', amount: '₹11,200', status: 'Confirmed' },
    { id: 'HM10253', name: 'Neha Verma', checkIn: '12 May', checkOut: '13 May', amount: '₹6,500', status: 'Confirmed' },
    { id: 'HM10252', name: 'Amit Patel', checkIn: '11 May', checkOut: '13 May', amount: '₹9,000', status: 'Checked-In' },
    { id: 'HM10251', name: 'Priya Singh', checkIn: '11 May', checkOut: '12 May', amount: '₹4,500', status: 'Checked-Out' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Checked-In':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Checked-Out':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* 2. Visual Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Placeholder Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Revenue Overview</h3>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            [ Line Chart: Revenue Trends ]
          </div>
        </div>

        {/* Room Occupancy Gauge Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 w-full text-left mb-4">Room Occupancy</h3>
          <div className="relative flex items-center justify-center my-4">
            <div className="w-36 h-36 rounded-full border-8 border-slate-100 border-t-[#D96B43] border-r-[#D96B43] flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">56%</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]"></span> Occupied (45)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Available (35)</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Bookings</h3>
          <button className="text-xs font-semibold text-[#D96B43] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Check-in</th>
                <th className="px-6 py-3">Check-out</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{b.id}</td>
                  <td className="px-6 py-4">{b.name}</td>
                  <td className="px-6 py-4">{b.checkIn}</td>
                  <td className="px-6 py-4">{b.checkOut}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{b.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}