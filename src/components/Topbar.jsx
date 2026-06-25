import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

// Maps route segments → Arabic page title
const PAGE_TITLES = {
  dashboard:    { ar: 'لوحة القيادة',         en: 'Dashboard' },
  residents:    { ar: 'قاعدة السكان',          en: 'Residents' },
  map:          { ar: 'الخريطة الذكية',        en: 'Smart Map' },
  committee:    { ar: 'لجنة الحي',            en: 'Committee' },
  certificates: { ar: 'الشهادات',              en: 'Certificates' },
  settings:     { ar: 'النظام والمستخدمين',    en: 'Settings' },
};

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
	const id = setInterval(() => setTime(new Date()), 60_000);
	return () => clearInterval(id);
  }, []);
  return time;
}

export default function Topbar() {
  const { workspace } = useAuth();
  const location = useLocation();
  const now = useClock();

  // Derive current page from URL
  const segments = location.pathname.split('/').filter(Boolean);
  const pageKey  = segments[segments.length - 1];
  const page     = PAGE_TITLES[pageKey] || { ar: 'حصاد', en: 'Hased' };

  const dateStr = now.toLocaleDateString('ar-SA', {
	weekday: 'long', day: 'numeric', month: 'long',
  });
  const timeStr = now.toLocaleTimeString('ar-SA', {
	hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
	<>
	  <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
	  `}</style>

	  <header
		className="h-[60px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20"
		style={{ fontFamily: "'Tajawal', sans-serif" }}
		dir="rtl"
	  >
		{/* ── Left: page identity ── */}
		<div className="flex items-center gap-3">
		  {/* Page title */}
		  <div>
			<div className="text-[17px] font-black text-slate-900 leading-tight tracking-tight">
			  {page.ar}
			</div>
			<div className="flex items-center gap-1.5 mt-0.5">
			  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
			  <span className="text-[11px] text-slate-400 font-medium">
				{workspace?.name || 'Hased Community'}
			  </span>
			</div>
		  </div>
		</div>

		{/* ── Right: status + actions ── */}
		<div className="flex items-center gap-2">

		  {/* Date / time chip */}
		  <div
			className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-500 font-medium select-none"
			style={{ fontFamily: "'IBM Plex Mono', monospace" }}
		  >
			<span>{dateStr}</span>
			<span className="text-slate-300">·</span>
			<span>{timeStr}</span>
		  </div>

		  {/* Live status pill */}
		  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-emerald-700 select-none">
			<span className="relative flex h-1.5 w-1.5">
			  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
			  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
			</span>
			متصل
		  </div>

		  {/* Divider */}
		  <div className="h-5 w-px bg-slate-200 mx-1" />

		  {/* Bell */}
		  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
			<Bell size={16} />
		  </button>

		  {/* Search */}
		  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
			<Search size={16} />
		  </button>
		</div>
	  </header>
	</>
  );
}