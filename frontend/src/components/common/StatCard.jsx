export default function StatCard({ title, value, change, isPositive }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline justify-between mt-3">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {change} vs last week
          </span>
        )}
      </div>
    </div>
  );
}