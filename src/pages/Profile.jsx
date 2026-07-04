import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, Download, User, Activity, PhoneCall, Briefcase } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Profile() {
  const { workspace } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [resident, setResident] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
	const searchResidents = async () => {
	  if (searchTerm.length < 2) {
		setSearchResults([]);
		return;
	  }
	  const { data } = await supabase
		.from('residents')
		.select('*')
		.eq('status', 'approved')
		.ilike('full_name', `%${searchTerm}%`)
		.limit(8);
	  
	  setSearchResults(data || []);
	};
	
	const timeoutId = setTimeout(searchResidents, 300);
	return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (selected) => {
	setResident(selected);
	setSearchTerm(selected.full_name);
	setSearchResults([]);
  };

  const handleExportEID = async () => {
	if (!resident) return;
	setExporting(true);
	const wrapElement = document.getElementById('eid-export-wrap');
	
	try {
	  const canvas = await html2canvas(wrapElement, { scale: 3, useCORS: true, backgroundColor: '#f8fafc' });
	  const link = document.createElement('a');
	  link.download = `National_ID_${resident.full_name.replace(/\s+/g, '_')}.png`;
	  link.href = canvas.toDataURL('image/png');
	  link.click();
	} catch (err) {
	  alert('حدث خطأ أثناء تصدير البطاقة');
	  console.error(err);
	} finally {
	  setExporting(false);
	}
  };

  // MRZ Data Formatting
  const mrzName = resident ? (resident.full_name || 'SUDANESE').substring(0, 25).replace(/\s/g, '<').toUpperCase() : '';
  const paddedNid = resident ? String(resident.national_id || '000000000').padEnd(15, '<') : '';

  return (
	<div className="flex flex-col gap-6 h-full font-['Tajawal']" dir="rtl">
	  {/* Search Header */}
	  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shrink-0">
		<h3 className="text-lg font-black text-slate-900 mb-4">الملف الشامل والهوية الذكية</h3>
		<div className="relative max-w-xl">
		  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
		  <input 
			type="text" 
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			placeholder="ابحث بالاسم أو الرقم الوطني لاستعراض الملف..." 
			className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 pl-3 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
		  />
		  {searchResults.length > 0 && (
			<ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
			  {searchResults.map((res) => (
				<li 
				  key={res.id} 
				  onClick={() => handleSelect(res)}
				  className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer flex justify-between items-center"
				>
				  <span className="font-bold text-slate-900">{res.full_name}</span>
				  <span className="font-['IBM_Plex_Mono'] text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{res.national_id}</span>
				</li>
			  ))}
			</ul>
		  )}
		</div>
	  </div>

	  {resident ? (
		<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto pb-8">
		  
		  {/* Right Column: Profile Data */}
		  <div className="xl:col-span-7 flex flex-col gap-4">
			
			{/* Professional Data */}
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
			  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
				<Briefcase size={18} className="text-blue-500" />
				<h4 className="font-extrabold text-slate-800">البيانات المهنية والسيرة الذاتية</h4>
			  </div>
			  <div className="grid grid-cols-2 gap-6">
				<div><div className="text-xs font-bold text-slate-400">المهنة الحالية</div><div className="font-bold text-slate-900 mt-1">{resident.profession || '—'}</div></div>
				<div><div className="text-xs font-bold text-slate-400">جهة العمل</div><div className="font-bold text-slate-900 mt-1">{resident.company_name || '—'}</div></div>
				<div><div className="text-xs font-bold text-slate-400">المؤهل الأكاديمي</div><div className="font-bold text-slate-900 mt-1">{resident.academic_degree || '—'}</div></div>
				<div className="col-span-2"><div className="text-xs font-bold text-slate-400">السيرة الذاتية (CV)</div><div className="text-sm text-slate-600 mt-1 leading-relaxed">{resident.cv_summary || 'لا توجد سيرة ذاتية مسجلة.'}</div></div>
			  </div>
			</div>

			{/* Health Data */}
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
			  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
				<Activity size={18} className="text-red-500" />
				<h4 className="font-extrabold text-slate-800">السجل الصحي</h4>
			  </div>
			  <div className="space-y-4">
				<div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">فصيلة الدم</span><span className="font-black text-red-600 font-['IBM_Plex_Mono'] text-lg">{resident.blood_type || '—'}</span></div>
				<div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">أمراض مزمنة</span><span className="font-bold text-slate-800">{resident.chronic_diseases || 'لا يوجد'}</span></div>
				<div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">حساسية أدوية</span><span className="font-bold text-slate-800">{resident.allergies || 'لا يوجد'}</span></div>
			  </div>
			</div>

			{/* Emergency Data */}
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
			  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
				<PhoneCall size={18} className="text-amber-500" />
				<h4 className="font-extrabold text-slate-800">بيانات الطوارئ</h4>
			  </div>
			  <div className="grid grid-cols-3 gap-4">
				<div><div className="text-[10px] font-bold text-slate-400 mb-1">شخص الطوارئ</div><div className="font-bold text-slate-900 text-sm">{resident.emergency_contact_name || '—'}</div></div>
				<div><div className="text-[10px] font-bold text-slate-400 mb-1">صلة القرابة</div><div className="font-bold text-slate-900 text-sm">{resident.emergency_relation || '—'}</div></div>
				<div><div className="text-[10px] font-bold text-slate-400 mb-1">رقم الهاتف</div><div className="font-bold text-blue-600 font-['IBM_Plex_Mono']">{resident.emergency_phone || '—'}</div></div>
			  </div>
			</div>

		  </div>

		  {/* Left Column: E-ID Card */}
		  <div className="xl:col-span-5 flex flex-col gap-4 items-center">
			<div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
			  <div className="text-xs font-extrabold text-slate-400 uppercase tracking-[2px] mb-4 font-['IBM_Plex_Mono']">الهوية الوطنية الذكية</div>
			  
			  <div id="eid-export-wrap" className="flex flex-col gap-4 w-full items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
				
				{/* ID Front */}
				<div className="w-[380px] aspect-[85/54] bg-gradient-to-br from-[#f0fdf0] via-white to-[#f0fff0] border-[1.5px] border-[#2D6A4F] rounded-lg shadow-md overflow-hidden flex flex-col relative">
				  <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-3 py-1.5 flex items-center justify-between text-white relative z-10">
					<img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" className="w-6 h-6 p-0.5 bg-white/10 rounded" alt="logo" />
					<div className="text-center">
					  <div className="text-[9px] font-black opacity-90">جمهورية السودان</div>
					  <div className="text-[7px] opacity-60">الهيئة القومية للتسجيل المدني — {workspace?.name}</div>
					  <div className="text-[11px] font-black text-yellow-400 tracking-wide">بطاقة الرقم الوطني</div>
					</div>
					<img src="https://flagcdn.com/w40/sd.png" className="w-7 h-4 border border-white/20 object-cover" alt="flag" />
				  </div>
				  <div className="h-[3px] bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] z-10" />
				  
				  <div className="flex-1 p-2.5 flex gap-3 relative z-10">
					<div className="w-[60px] bg-[#f0fdf4] border-2 border-[#2D6A4F] flex items-center justify-center shrink-0 overflow-hidden">
					  {resident.id_image_url ? (
						<img src={resident.id_image_url} className="w-full h-full object-cover" alt="Photo" />
					  ) : (
						<User className="text-[#2D6A4F] opacity-50" size={24} />
					  )}
					</div>
					<div className="flex-1 flex flex-col justify-between py-1">
					  <div>
						<div className="text-[6.5px] font-black text-[#2D6A4F] uppercase">الرقم الوطني / National ID No.</div>
						<div className="text-[11px] font-black text-[#1B4332] font-['IBM_Plex_Mono'] tracking-widest">{resident.national_id}</div>
					  </div>
					  <div>
						<div className="text-[6.5px] font-black text-[#2D6A4F] uppercase mt-1">الاسم / Full Name</div>
						<div className="text-[11px] font-black text-[#1B4332] leading-tight">{resident.full_name}</div>
					  </div>
					  <div>
						<div className="text-[6.5px] font-black text-[#2D6A4F] uppercase mt-1">العنوان / Address</div>
						<div className="text-[9px] font-bold text-[#1B4332]">{workspace?.name} - {resident.location} ق {resident.house_number || '-'}</div>
					  </div>
					</div>
				  </div>
				  
				  <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-3 py-1 flex justify-between items-center text-white z-10">
					<div className="text-[8px] font-bold opacity-80">صالحة حتى: <span className="text-yellow-400 font-['IBM_Plex_Mono'] ml-1">2036/12/31</span></div>
					<div className="text-[7px] font-['IBM_Plex_Mono'] opacity-50">{workspace?.slug.toUpperCase()}.GOV.SD</div>
				  </div>
				</div>

				{/* ID Back */}
				<div className="w-[380px] aspect-[85/54] bg-white border-[1.5px] border-[#2D6A4F] rounded-lg shadow-md overflow-hidden flex flex-col">
				  <div className="h-3 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]" />
				  <div className="h-[3px] bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B]" />
				  
				  <div className="flex-1 p-3 flex justify-between">
					<div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 items-start">
					  <div className="col-span-2">
						<div className="text-[7px] font-black text-[#2D6A4F] uppercase">فصيلة الدم / Blood Type</div>
						<div className="text-[13px] font-black text-red-600 font-['IBM_Plex_Mono']">{resident.blood_type || '—'}</div>
					  </div>
					  <div>
						<div className="text-[7px] font-black text-[#2D6A4F] uppercase">الجنس / Gender</div>
						<div className="text-[10px] font-black text-[#1B4332]">ذكر / M</div>
					  </div>
					  <div>
						<div className="text-[7px] font-black text-[#2D6A4F] uppercase">الحالة / Status</div>
						<div className="text-[10px] font-black text-[#1B4332]">مقيم</div>
					  </div>
					  <div className="col-span-2">
						<div className="text-[7px] font-black text-[#2D6A4F] uppercase">المهنة / Occupation</div>
						<div className="text-[10px] font-black text-[#1B4332]">{resident.profession || '—'}</div>
					  </div>
					</div>
					
					<div className="w-[64px] flex flex-col items-center gap-1 shrink-0 ml-2">
					  <img src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=NID:${resident.national_id}|Name:${resident.full_name}&scale=3`} className="w-[58px] h-[58px] border border-slate-300 p-0.5" alt="QR" />
					  <div className="text-[8px] font-['IBM_Plex_Mono'] text-slate-500">SN:{String(resident.national_id).substring(0,8)}</div>
					</div>
				  </div>

				  <div className="bg-white border-t border-slate-300 px-3 py-1.5 font-['IBM_Plex_Mono'] text-[9.5px] font-medium tracking-widest text-slate-900 leading-snug" dir="ltr">
					<div>I&lt;SDN{paddedNid}</div>
					<div>9001015M3612316SDN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;9</div>
					<div>{mrzName}{'<'.repeat(Math.max(0, 30 - mrzName.length))}</div>
				  </div>
				  
				  <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-3 py-0.5 flex justify-between items-center text-[7px] font-bold text-white/60">
					<div>الهيئة القومية للتسجيل المدني — جمهورية السودان</div>
					<div dir="ltr">NATIONAL CIVIL REGISTRATION AUTHORITY</div>
				  </div>
				</div>

			  </div>
			  
			  <button 
				onClick={handleExportEID}
				disabled={exporting}
				className="mt-6 w-full max-w-[380px] flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
			  >
				{exporting ? 'جاري التصدير...' : <><Download size={18} /> تصدير البطاقة (وجه + ظهر)</>}
			  </button>
			</div>
		  </div>

		</div>
	  ) : (
		<div className="flex-1 flex flex-col items-center justify-center text-slate-400">
		  <User size={48} className="mb-4 opacity-20" />
		  <p className="font-bold">يرجى البحث عن مواطن لاستعراض ملفه الشامل</p>
		</div>
	  )}
	</div>
  );
}