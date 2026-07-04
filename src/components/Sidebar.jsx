import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Map, Award, Shield, Settings, FileText, User, Share2, QrCode } from 'lucide-react';

export default function Sidebar() {
  const { user, workspace, signOut } = useAuth();
  const role = user?.role?.toLowerCase() || 'citizen';
  const isManager = role === 'admin' || role === 'manager';

  if (!workspace) return null;

  const basePath = `/${workspace.slug}`;

  const navItemClass = ({ isActive }) =>
	`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-1 relative ${
	  isActive
		? 'bg-red-500/15 text-red-400 border border-red-500/20'
		: 'text-white/45 hover:bg-white/5 hover:text-white/80'
	}`;

  return (
	<aside className="w-[240px] min-w-[240px] bg-slate-900 flex flex-col h-full relative z-30 font-['Tajawal']" dir="rtl">
	  {/* Brand Header */}
	  <div className="p-6 pb-5 border-b border-white/5 flex items-center gap-3">
		<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 ring-2 ring-red-500/30">
		  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-7 h-7 object-contain" />
		</div>
		<div>
		  <div className="text-[17px] font-black text-white leading-tight">{workspace.name}</div>
		  <div className="text-[9px] text-white/30 uppercase tracking-[2px] font-['IBM_Plex_Mono'] mt-0.5">Unified System</div>
		</div>
	  </div>

	  {/* Main Navigation */}
	  <div className="flex-1 overflow-y-auto px-3 pt-4">
		<div className="text-[9px] font-extrabold text-white/20 uppercase tracking-[2px] px-2 mb-2 font-['IBM_Plex_Mono']">رئيسي</div>
		
		<NavLink to={`${basePath}/dashboard`} className={navItemClass}>
		  <Home size={18} /><span>لوحة القيادة</span>
		</NavLink>
		<NavLink to={`${basePath}/residents`} className={navItemClass}>
		  <Users size={18} /><span>قاعدة السكان</span>
		</NavLink>
		<NavLink to={`${basePath}/map`} className={navItemClass}>
		  <Map size={18} /><span>الخريطة الذكية</span>
		</NavLink>
		<NavLink to={`${basePath}/competencies`} className={navItemClass}>
		  <Award size={18} /><span>الكفاءات والخبرات</span>
		</NavLink>
		<NavLink to={`${basePath}/profile`} className={navItemClass}>
		  <User size={18} /><span>الملف الشامل</span>
		</NavLink>

		{isManager && (
		  <>
			<div className="text-[9px] font-extrabold text-white/20 uppercase tracking-[2px] px-2 mt-6 mb-2 font-['IBM_Plex_Mono']">إدارة</div>
			<NavLink to={`${basePath}/committee`} className={navItemClass}>
			  <Award size={18} /><span>لجنة الحي</span>
			</NavLink>
			<NavLink to={`${basePath}/certificates`} className={navItemClass}>
			  <FileText size={18} /><span>الشهادات</span>
			</NavLink>
			<NavLink to={`${basePath}/settings`} className={navItemClass}>
			  <Settings size={18} /><span>النظام والمستخدمين</span>
			</NavLink>
		  </>
		)}
	  </div>

	  {/* User Footer */}
	  <div className="border-t border-white/5 p-4 bg-black/20">
		<div className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-lg">
		  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-800 to-red-500 flex items-center justify-center text-sm font-black text-white shrink-0">
			{user?.name?.charAt(0) || '?'}
		  </div>
		  <div className="flex-1 min-w-0">
			<div className="text-xs font-bold text-white truncate">{user?.name || '—'}</div>
			<div className="text-[9px] text-white/25 uppercase tracking-[1px] font-['IBM_Plex_Mono']">{role}</div>
		  </div>
		  <button onClick={signOut} className="text-white/30 hover:text-white transition-colors" title="تسجيل الخروج">
			<Shield size={16} />
		  </button>
		</div>
	  </div>
	</aside>
  );
}