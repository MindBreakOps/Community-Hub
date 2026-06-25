import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { workspace } = useAuth();

  return (
	<header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center justify-between shrink-0 sticky top-0 z-20 font-['Tajawal']" dir="rtl">
	  <div className="flex items-center gap-3">
		<div>
		  <div className="text-[17px] font-black text-slate-900 tracking-tight">نظام الإدارة الموحد</div>
		  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
			<div className="w-1.5 h-1.5 rounded-full bg-red-500" />
			<span>{workspace?.name || 'Hased Community'}</span>
		  </div>
		</div>
	  </div>
	  
	  <div className="flex items-center gap-2">
		<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[11.5px] font-bold text-slate-700">
		  <div className="relative flex h-2 w-2">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
			<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
		  </div>
		  متصل
		</div>
	  </div>
	</header>
  );
}