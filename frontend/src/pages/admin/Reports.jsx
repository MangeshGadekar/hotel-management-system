import { useState } from 'react';

export default function Reports() {
  const [dateRange, setDateRange] = useState('This Month');

  const reportMetrics = [
    { label: 'Net Occupancy Rate', value: '74.2%', note: '+3.1% vs last month' },
    { label: 'Average Daily Rate (ADR)', value: '₹5,820', note: 'Avg revenue per occupied room' },
    { label: 'RevPAR', value: '₹4,318', note: 'Revenue per available room' },
    { label: 'Total Cancellations', value: '14', note: '3.8% cancellation rate' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">High-level financial summaries and operational metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
          <button className="px-4 py-1.5 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg transition shadow-xs">
            Export PDF / CSV
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {reportMetrics.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">{m.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{m.value}</h3>
            <p className="text-xs text-slate-400 mt-1">{m.note}</p>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown Visual Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-800">Monthly Revenue Comparison</h3>
          <div className="h-56 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            [ Bar Chart: Monthly Revenue vs Projections ]
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-800">Room Type Popularity</h3>
          <div className="h-56 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            [ Pie Chart: Deluxe vs Executive vs Suite Bookings ]
          </div>
        </div>
      </div>
    </div>
  );
}