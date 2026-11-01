import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../app/useAuthStore";
import {
  fetchReportApi,
  downloadReportApi,
  fetchAllReceptionist,
  downloadMasterFolioReceiptApi,
} from "../../apis/api";


const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const toWeekValue = (date) => {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  const wk = 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  return `${t.getFullYear()}-W${pad(wk)}`;
};

const weekToRange = (v) => {
  const [y, w] = v.split("-W").map(Number);
  const jan4 = new Date(y, 0, 4);
  const mon = new Date(y, 0, 4 - ((jan4.getDay() + 6) % 7) + (w - 1) * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return [fmt(mon), fmt(sun)];
};

const formatINR = (n = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const niceDate = (s) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const statusBadge = (status = "") => {
  switch (String(status).toUpperCase()) {
    case "CHECKED_IN":
    case "OCCUPIED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CHECKED_OUT":
    case "COMPLETED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "BOOKED":
    case "RESERVED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const PERIODS = [
  { key: "DAY", label: "Day" },
  { key: "WEEK", label: "Week" },
  { key: "MONTH", label: "Month" },
  { key: "YEAR", label: "Year" },
  { key: "CUSTOM", label: "Custom" },
];


export default function ReportView({ role = "admin" }) {
  const token = useAuthStore((s) => s.token);
  const isAdmin = role === "admin";
  const accent = isAdmin
    ? { btn: "bg-[#D96B43] hover:bg-[#c25a34]", tab: "bg-[#D96B43] text-white", ring: "focus:ring-[#D96B43]", bar: "bg-[#D96B43]", text: "text-[#D96B43]" }
    : { btn: "bg-emerald-600 hover:bg-emerald-700", tab: "bg-emerald-600 text-white", ring: "focus:ring-emerald-500", bar: "bg-emerald-500", text: "text-emerald-600" };

  const today = new Date();
  const [period, setPeriod] = useState("MONTH");
  const [day, setDay] = useState(fmt(today));
  const [week, setWeek] = useState(toWeekValue(today));
  const [month, setMonth] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`);
  const [year, setYear] = useState(today.getFullYear());
  const [customFrom, setCustomFrom] = useState(fmt(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [customTo, setCustomTo] = useState(fmt(today));

  const [receptionists, setReceptionists] = useState([]);
  const [receptionistId, setReceptionistId] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  
  const range = useMemo(() => {
    try {
      if (period === "DAY") return day ? [day, day] : null;
      if (period === "WEEK") return week ? weekToRange(week) : null;
      if (period === "MONTH") {
        if (!month) return null;
        const [y, m] = month.split("-").map(Number);
        return [fmt(new Date(y, m - 1, 1)), fmt(new Date(y, m, 0))];
      }
      if (period === "YEAR") return year ? [`${year}-01-01`, `${year}-12-31`] : null;
      return customFrom && customTo ? [customFrom, customTo] : null;
    } catch {
      return null;
    }
  }, [period, day, week, month, year, customFrom, customTo]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllReceptionist(token)
      .then((res) => setReceptionists(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setReceptionists([]));
  }, [isAdmin, token]);

  useEffect(() => {
    if (!range) return;
    if (range[1] < range[0]) {
      setError("'To' date cannot be before 'From' date.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchReportApi(role, { from: range[0], to: range[1], receptionistId: isAdmin ? receptionistId : "" }, token)
      .then((data) => !cancelled && setReport(data))
      .catch(() => !cancelled && setError("Could not load report. Please try again."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range, receptionistId, role, isAdmin, token]);

  const handleDownload = async (type) => {
    if (!range) return;
    try {
      setDownloading(type);
      await downloadReportApi(role, type, { from: range[0], to: range[1], receptionistId: isAdmin ? receptionistId : "" }, token);
    } catch {
      setError(`Could not download ${type.toUpperCase()}.`);
    } finally {
      setDownloading("");
    }
  };

 
  const chart = useMemo(() => {
    const daily = report?.daily || [];
    if (daily.length <= 31) {
      return daily.map((d) => ({ label: d.date.slice(8), full: d.date, bookings: d.bookings, amount: Number(d.totalAmount) }));
    }
    const map = new Map();
    daily.forEach((d) => {
      const k = d.date.slice(0, 7);
      const cur = map.get(k) || { label: k.slice(5), full: k, bookings: 0, amount: 0 };
      cur.bookings += d.bookings;
      cur.amount += Number(d.totalAmount);
      map.set(k, cur);
    });
    return [...map.values()];
  }, [report]);
  const maxAmount = Math.max(1, ...chart.map((c) => c.amount));

  const s = report?.summary;
  const kpis = [
    { label: "Total Bookings", value: s?.totalBookings ?? 0, note: `${s?.cancelledBookings ?? 0} cancelled` },
    { label: "Total Amount", value: formatINR(s?.totalAmount), note: "Excluding cancelled" },
    { label: "Total Paid", value: formatINR(s?.totalPaid), note: "Successful payments" },
    { label: "Balance Due", value: formatINR(s?.totalBalance), note: "Still to be collected" },
  ];

  const inputCls = `px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 ${accent.ring}`;

  return (
    <div className="space-y-6">
     
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin ? "All bookings and payments" : "Your own bookings and payments"}
            {range && ` · ${niceDate(range[0])} - ${niceDate(range[1])}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleDownload("pdf")} disabled={!report || !!downloading}
            className={`px-4 py-1.5 ${accent.btn} text-white text-sm font-semibold rounded-lg transition shadow-xs disabled:opacity-50`}>
            {downloading === "pdf" ? "Preparing..." : "Download PDF"}
          </button>
          <button onClick={() => handleDownload("csv")} disabled={!report || !!downloading}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition disabled:opacity-50">
            {downloading === "csv" ? "Preparing..." : "Download CSV"}
          </button>
        </div>
      </div>

      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex bg-slate-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition ${period === p.key ? accent.tab : "text-slate-600 hover:text-slate-900"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {period === "DAY" && <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} />}
        {period === "WEEK" && <input type="week" value={week} onChange={(e) => setWeek(e.target.value)} className={inputCls} />}
        {period === "MONTH" && <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />}
        {period === "YEAR" && (
          <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} className={`${inputCls} w-28`} />
        )}
        {period === "CUSTOM" && (
          <>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={inputCls} />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={inputCls} />
          </>
        )}

        {isAdmin && (
          <select value={receptionistId} onChange={(e) => setReceptionistId(e.target.value)} className={`${inputCls} sm:ml-auto`}>
            <option value="">All receptionists</option>
            {receptionists.map((r) => (
              <option key={r.id} value={r.id}>
                {`${r.firstName || ""} ${r.lastName || ""}`.trim() || r.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((m) => (
          <div key={m.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase">{m.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{loading ? "…" : m.value}</h3>
            <p className="text-xs text-slate-400 mt-1">{m.note}</p>
          </div>
        ))}
      </div>

      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          {chart.length > 0 && report?.daily?.length > 31 ? "Month wise revenue" : "Day wise revenue"}
        </h3>
        <div className="flex items-end gap-1 h-44 overflow-x-auto">
          {chart.map((c) => (
            <div key={c.full} className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group relative">
              <div className="absolute -top-1 hidden group-hover:block bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                {c.full} · {c.bookings} bookings · {formatINR(c.amount)}
              </div>
              <div className={`w-full rounded-t ${accent.bar} opacity-80 group-hover:opacity-100 transition`}
                style={{ height: `${Math.max(2, (c.amount / maxAmount) * 100)}%` }} />
              <span className="text-[10px] text-slate-400 mt-1">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

     
      {isAdmin && !receptionistId && report?.byReceptionist?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-800">Receptionist wise summary</h3>
            <p className="text-xs text-slate-500">Click a row to see only that receptionist's bookings</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Receptionist</th>
                  <th className="px-6 py-3">Bookings</th>
                  <th className="px-6 py-3">Cancelled</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.byReceptionist.map((r) => (
                  <tr key={r.receptionistId ?? "online"}
                    onClick={() => r.receptionistId && setReceptionistId(String(r.receptionistId))}
                    className={`${r.receptionistId ? "cursor-pointer hover:bg-slate-50" : ""}`}>
                    <td className="px-6 py-3 font-medium text-slate-800">{r.receptionistName}</td>
                    <td className="px-6 py-3">{r.bookings}</td>
                    <td className="px-6 py-3">{r.cancelled}</td>
                    <td className="px-6 py-3">{formatINR(r.totalAmount)}</td>
                    <td className="px-6 py-3 text-emerald-700">{formatINR(r.totalPaid)}</td>
                    <td className="px-6 py-3 text-rose-600">{formatINR(r.totalBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Booking details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Stay</th>
                {isAdmin && <th className="px-4 py-3">Receptionist</th>}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={isAdmin ? 10 : 9} className="px-6 py-8 text-center text-slate-400">Loading report...</td></tr>
              )}
              {!loading && (report?.bookings || []).length === 0 && (
                <tr><td colSpan={isAdmin ? 10 : 9} className="px-6 py-8 text-center text-slate-400">No bookings in this period.</td></tr>
              )}
              {!loading && (report?.bookings || []).map((b) => (
                <tr key={b.bookingId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{b.bookingReference}</div>
                    <div className="text-xs text-slate-400">{niceDate(b.bookedAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{b.guestName}</div>
                    <div className="text-xs text-slate-400">{b.guestPhone}</div>
                  </td>
                  <td className="px-4 py-3">{b.rooms || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{niceDate(b.checkInDate)} → {niceDate(b.checkOutDate)}</td>
                  {isAdmin && <td className="px-4 py-3">{b.receptionistId ? b.receptionistName : <span className="text-slate-400">Online / Guest</span>}</td>}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(b.status)}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">{formatINR(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-emerald-700">{formatINR(b.totalPaid)}</td>
                  <td className={`px-4 py-3 ${Number(b.balanceDue) > 0 ? "text-rose-600 font-medium" : "text-slate-400"}`}>{formatINR(b.balanceDue)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => downloadMasterFolioReceiptApi(b.bookingId, token).catch(() => setError("Could not open receipt."))}
                      className={`text-xs font-semibold ${accent.text} hover:underline`}>
                      View
                    </button>
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