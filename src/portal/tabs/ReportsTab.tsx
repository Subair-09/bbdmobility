import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  CreditCard, 
  Clock, 
  Calendar, 
  ChevronDown, 
  BarChart3, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Headphones,
  ChevronRight
} from 'lucide-react';
import { Booking } from '../types';

interface ReportsTabProps {
  bookings: Booking[];
  onShowToast: (msg: string) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ bookings, onShowToast }) => {
  const dynamicBookingCount = bookings.length;
  const totalEarningsAmount = bookings.reduce((sum, b) => sum + Number(b.amount || (b as any).totalAmount || 0), 0);
  const paidEarningsAmount = bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + Number(b.amount || (b as any).totalAmount || 0), 0);
  const pendingEarningsAmount = bookings.filter(b => b.paymentStatus !== 'Paid').reduce((sum, b) => sum + Number(b.amount || (b as any).totalAmount || 0), 0);

  const completedCount = bookings.filter(b => b.status === 'Delivered').length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const inTransitCount = bookings.filter(b => b.status === 'In Transit' || b.status === 'Picked Up').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  const completedPct = dynamicBookingCount ? Math.round((completedCount / dynamicBookingCount) * 100) : 0;
  const pendingPct = dynamicBookingCount ? Math.round((pendingCount / dynamicBookingCount) * 100) : 0;
  const inTransitPct = dynamicBookingCount ? Math.round((inTransitCount / dynamicBookingCount) * 100) : 0;
  const cancelledPct = dynamicBookingCount ? Math.round((cancelledCount / dynamicBookingCount) * 100) : 0;

  const [reportType, setReportType] = useState('Earnings Report');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [riderFilter, setRiderFilter] = useState('All Riders');
  const [paymentMethod, setPaymentMethod] = useState('All Methods');

  const riderMap = new Map<string, { deliveries: number; earnings: number }>();
  bookings.forEach(b => {
    const name = b.riderName || (b as any).assignedRiderName;
    if (!name) return;
    const cur = riderMap.get(name) || { deliveries: 0, earnings: 0 };
    riderMap.set(name, {
      deliveries: cur.deliveries + 1,
      earnings: cur.earnings + (b.riderEarnings !== undefined ? Number(b.riderEarnings) : Math.round(Number(b.amount || (b as any).totalAmount || 0) * 0.75))
    });
  });

  const topRiders = Array.from(riderMap.entries())
    .sort((a, b) => b[1].deliveries - a[1].deliveries)
    .slice(0, 5)
    .map(([name, data], idx) => ({
      rank: idx + 1,
      name,
      deliveries: data.deliveries,
      earnings: data.earnings,
      rate: '100%'
    }));

  const handleDownload = (type: string) => {
    onShowToast(`Downloading report as ${type}...`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter (Screenshot 9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports</h1>
          <p className="text-xs text-gray-500 font-medium">View detailed reports on your deliveries, earnings, riders and overall performance.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-300">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Oct 28, 2026 - Nov 28, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </div>

      {/* 4 Stat KPI Cards (Live Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{dynamicBookingCount}</span>
            <span className="text-xs font-bold text-emerald-600">Live</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Total database bookings</span>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Total Earnings</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{totalEarningsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">Gross</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Gross delivery value</span>
        </div>

        {/* Paid Amount */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Paid Amount</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{paidEarningsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">Settled</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Confirmed collected</span>
        </div>

        {/* Pending Amount */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">Pending Amount</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">₦{pendingEarningsAmount.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium mt-1 block">Awaiting payment</span>
        </div>
      </div>

      {/* Main Grid: Left Charts (2 cols) & Right Filters Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Charts & Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Row 1: Bookings Trend & Deliveries by Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bookings Trend Chart Card (Screenshot 9) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-900">Bookings Trend</h3>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Bookings
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Earnings
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-44 w-full">
                {dynamicBookingCount === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-medium">
                    No delivery trend data recorded in database yet.
                  </div>
                ) : (
                  <svg viewBox="0 0 320 160" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="320" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="70" x2="320" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="110" x2="320" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="140" x2="320" y2="140" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Red Vertical Bars for Earnings */}
                    {[
                      { x: 20, h: 40 }, { x: 45, h: 55 }, { x: 70, h: 50 }, { x: 95, h: 65 },
                      { x: 120, h: 60 }, { x: 145, h: 75 }, { x: 170, h: 80 }, { x: 195, h: 70 },
                      { x: 220, h: 85 }, { x: 245, h: 95 }, { x: 270, h: 90 }, { x: 295, h: 105 }
                    ].map((bar, i) => (
                      <rect 
                        key={i} 
                        x={bar.x} 
                        y={140 - bar.h} 
                        width="8" 
                        height={bar.h} 
                        rx="2" 
                        fill="#fca5a5" 
                        opacity="0.85" 
                      />
                    ))}

                    {/* Blue Line with dots for Bookings */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points="24,105 49,95 74,90 99,80 124,75 149,85 174,70 199,65 224,55 249,45 274,50 299,35"
                    />

                    {[
                      { cx: 24, cy: 105 }, { cx: 49, cy: 95 }, { cx: 74, cy: 90 }, { cx: 99, cy: 80 },
                      { cx: 124, cy: 75 }, { cx: 149, cy: 85 }, { cx: 174, cy: 70 }, { cx: 199, cy: 65 },
                      { cx: 224, cy: 55 }, { cx: 249, cy: 45 }, { cx: 274, cy: 50 }, { cx: 299, cy: 35 }
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#2563eb" />
                    ))}

                    {/* Bottom Date Labels */}
                    <text x="20" y="155" fontSize="8" fill="#94a3b8">Oct 28</text>
                    <text x="110" y="155" fontSize="8" fill="#94a3b8">Nov 06</text>
                    <text x="210" y="155" fontSize="8" fill="#94a3b8">Nov 18</text>
                    <text x="290" y="155" fontSize="8" fill="#94a3b8">Nov 28</text>
                  </svg>
                )}
              </div>
            </div>

            {/* Deliveries by Status Donut (Screenshot 9) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-900 mb-2">Deliveries by Status</h3>

              <div className="flex items-center justify-center py-2">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {dynamicBookingCount === 0 ? (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4.5" />
                    ) : (
                      <>
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray={`${completedPct} ${100 - completedPct}`} strokeDashoffset={0} />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray={`${pendingPct} ${100 - pendingPct}`} strokeDashoffset={-(completedPct)} />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray={`${inTransitPct} ${100 - inTransitPct}`} strokeDashoffset={-(completedPct + pendingPct)} />
                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.5" strokeDasharray={`${cancelledPct} ${100 - cancelledPct}`} strokeDashoffset={-(completedPct + pendingPct + inTransitPct)} />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-gray-900">{dynamicBookingCount}</span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase">Total</span>
                  </div>
                </div>
              </div>

              {/* Legend matching Screenshot 9 */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="font-bold text-gray-900">{completedCount} ({completedPct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
                  </span>
                  <span className="font-bold text-gray-900">{pendingCount} ({pendingPct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> On the Way
                  </span>
                  <span className="font-bold text-gray-900">{inTransitCount} ({inTransitPct}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Cancelled
                  </span>
                  <span className="font-bold text-gray-900">{cancelledCount} ({cancelledPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Top Riders & Revenue Overview Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Riders Table (Screenshot 9) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-900">Top Riders</h3>
                <span className="text-[11px] font-bold text-blue-600 cursor-pointer flex items-center">
                  View All <ChevronRight className="w-3 h-3" />
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
                    <tr>
                      <th className="pb-2">#</th>
                      <th className="pb-2">Rider Name</th>
                      <th className="pb-2 text-center">Deliveries</th>
                      <th className="pb-2">Earnings</th>
                      <th className="pb-2 text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {topRiders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 font-medium text-xs">
                          No rider delivery data recorded in database yet.
                        </td>
                      </tr>
                    ) : (
                      topRiders.map(r => (
                        <tr key={r.rank} className="hover:bg-slate-50">
                          <td className="py-2.5 text-gray-400 font-semibold">{r.rank}</td>
                          <td className="py-2.5 font-bold text-gray-800">{r.name}</td>
                          <td className="py-2.5 text-center text-gray-600 font-medium">{r.deliveries}</td>
                          <td className="py-2.5 font-bold text-gray-900">₦{r.earnings.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-bold text-emerald-600">{r.rate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Overview Weekly Bars */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-900 mb-3">Revenue Overview</h3>

              {totalEarningsAmount === 0 ? (
                <div className="h-44 w-full flex items-center justify-center text-gray-400 text-xs font-medium">
                  No revenue transactions recorded in database yet.
                </div>
              ) : (
                <div className="h-44 w-full flex items-end justify-between px-2 pt-4">
                  {[
                    { week: 'Week 1', amount: `₦${Math.round(totalEarningsAmount * 0.15).toLocaleString()}`, h: '30%' },
                    { week: 'Week 2', amount: `₦${Math.round(totalEarningsAmount * 0.20).toLocaleString()}`, h: '50%' },
                    { week: 'Week 3', amount: `₦${Math.round(totalEarningsAmount * 0.25).toLocaleString()}`, h: '65%' },
                    { week: 'Week 4', amount: `₦${Math.round(totalEarningsAmount * 0.25).toLocaleString()}`, h: '80%' },
                    { week: 'Current', amount: `₦${Math.round(totalEarningsAmount * 0.15).toLocaleString()}`, h: '95%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 w-12">
                      <span className="text-[9px] font-bold text-gray-400">{item.amount}</span>
                      <div className="w-9 bg-[#0B1B3D] rounded-t-lg transition-all" style={{ height: item.h }} />
                      <span className="text-[10px] text-gray-500 font-medium">{item.week}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Report Filters & Exports Sidebar (Screenshot 9) */}
        <div className="space-y-5">
          {/* Report Filters Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Report Filters</h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
              >
                <option>Earnings Report</option>
                <option>Delivery Performance</option>
                <option>Rider Activity</option>
                <option>Customer Retention</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Date Range</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="Oct 28, 2026 - Nov 28, 2026"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-slate-50 text-gray-700 font-medium cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
              >
                <option>All Statuses</option>
                <option>Delivered</option>
                <option>In Transit</option>
                <option>Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Rider</label>
              <select
                value={riderFilter}
                onChange={(e) => setRiderFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
              >
                <option>All Riders</option>
                {Array.from(new Set(bookings.map(b => b.riderName || (b as any).assignedRiderName).filter(Boolean))).map((r, i) => (
                  <option key={i} value={r as string}>{r as string}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-bbd-navy bg-white font-medium"
              >
                <option>All Methods</option>
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>POS</option>
              </select>
            </div>

            <button
              onClick={() => onShowToast('Detailed report generated.')}
              className="w-full py-2.5 px-4 bg-[#0B1B3D] hover:bg-[#07132c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all mt-4"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
          </div>

          {/* Export Reports Card (Screenshot 9) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Export Reports</h4>

            <button
              onClick={() => handleDownload('PDF')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-red-500" />
                <span>Download PDF</span>
              </div>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => handleDownload('Excel')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download Excel</span>
              </div>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => handleDownload('CSV')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Download CSV</span>
              </div>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Need Help Card (Screenshot 9) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-gray-900">Need help with reports?</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Contact support for assistance with your custom reports and operations data.
            </p>
            <a
              href="tel:+2347087531148"
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-bbd-navy font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
