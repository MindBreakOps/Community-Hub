import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Map, Globe, Award, Shield, Settings, 
  FileText, User, LayoutDashboard, Activity, ChevronRight, ChevronLeft 
} from 'lucide-react';

export default function Sidebar() {
  const { user, workspace, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const role = user?.role?.toLowerCase() || 'citizen';
  const isManager = role === 'admin' || role === 'manager';

  if (!workspace) return null;

  const basePath = `/${workspace.slug}`;

  // تحسين التباين: خطوط أفتح وأكثر بروزاً
  const navItemClass = ({ isActive }) =>
	`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-bold transition-all mb-2 relative group ${
	  isActive
		? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
		: 'text-slate-300 hover:bg-slate-800 hover:text-white'
	}`;

  return (
	<aside 
	  className={`${isExpanded ? 'w-[260px]' : 'w-[80px]'} bg-slate-950 flex flex-col h-full relative z-30 transition-all duration-300 font-['Tajawal'] border-l border-slate-800 shadow-2xl`} 
	  dir="rtl"
	>
	  {/* Brand Header */}
	  <div className="p-6 pb-5 flex items-center gap-3 overflow-hidden">
		<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
		  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-7 h-7 object-contain" />
		</div>
		{isExpanded && (
		  <div className="whitespace-nowrap animate-in fade-in slide-in-from-right-4 duration-500">
			<div className="text-[18px] font-black text-white">{workspace.name}</div>
			<div className="text-[10px] text-orange-400 uppercase tracking-[2px] font-['IBM_Plex_Mono'] font-black">Unified System</div>
		  </div>
		)}
	  </div>

	  {/* Main Navigation */}
	  <div className="flex-1 overflow-y-auto px-4 pt-4">
		{isExpanded && <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] px-2 mb-4">القائمة الرئيسية</div>}
		
		<NavLink to={`${basePath}/dashboard`} className={navItemClass}>
		  <LayoutDashboard size={22} />{isExpanded && <span>لوحة القيادة</span>}
		</NavLink>
		<NavLink to={`${basePath}/residents`} className={navItemClass}>
		  <Users size={22} />{isExpanded && <span>قاعدة السكان</span>}
		</NavLink>
		<NavLink to={`${basePath}/profile`} className={navItemClass}>
		  <User size={22} />{isExpanded && <span>الملف الشامل</span>}
		</NavLink>
		<NavLink to={`${basePath}/map`} className={navItemClass}>
		  <Map size={22} />{isExpanded && <span>الخريطة التفاعلية</span>}
		</NavLink>
		<NavLink to={`${basePath}/competencies`} className={navItemClass}>
		  <Activity size={22} />{isExpanded && <span>الكفاءات</span>}
		</NavLink>

		{isManager && (
		  <>
			{isExpanded && <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] px-2 mt-8 mb-4">إدارة المجتمع</div>}
			<NavLink to={`${basePath}/committee`} className={navItemClass}>
			  <Award size={22} />{isExpanded && <span>لجنة الحي</span>}
			</NavLink>
			<NavLink to={`${basePath}/portal-manager`} className={navItemClass}>
			  <Globe size={22} />{isExpanded && <span>بوابة التسجيل</span>}
			</NavLink>
			<NavLink to={`${basePath}/certificates`} className={navItemClass}>
			  <FileText size={22} />{isExpanded && <span>الشهادات</span>}
			</NavLink>
			<NavLink to={`${basePath}/settings`} className={navItemClass}>
			  <Settings size={22} />{isExpanded && <span>الإعدادات</span>}
			</NavLink>
		  </>
		)}
	  </div>

	  {/* Expand/Shrink Button */}
	  <button 
		onClick={() => setIsExpanded(!isExpanded)}
		className="mx-4 mb-4 p-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800 flex items-center justify-center transition-all"
	  >
		{isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
	  </button>

	  {/* User Footer */}
	  <div className="border-t border-slate-800 p-4 bg-slate-950">
		<div className="flex items-center gap-3 p-2">
		  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg shadow-red-900/20">
			{user?.name?.charAt(0) || 'م'}
		  </div>
		  {isExpanded && (
			<div className="flex-1 min-w-0 animate-in fade-in duration-500">
			  <div className="text-sm font-black text-white truncate">{user?.name || 'مستخدم'}</div>
			  <div className="text-[10px] text-orange-400 uppercase tracking-[1px] font-['IBM_Plex_Mono'] font-bold">{role}</div>
			</div>
		  )}
		  <button onClick={signOut} className="text-slate-500 hover:text-red-400 transition-colors" title="تسجيل الخروج">
			<Shield size={20} />
		  </button>
		</div>
	  </div>
	</aside>
  );
}