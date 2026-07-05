import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Share2, QrCode, Copy, CheckCircle, Power, Globe, Users } from 'lucide-react';

export default function RegistrationManager() {
  const { workspace } = useAuth();
  const [isActive, setIsActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, total: 0 });

  const registrationUrl = `${window.location.origin}/${workspace?.slug}/register`;
  const qrCodeUrl = `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(registrationUrl)}&scale=6`;

  useEffect(() => {
	if (!workspace) return;
	
	const fetchSettings = async () => {
	  // Fetch Workspace Settings
	  const { data } = await supabase
		.from('workspaces')
		.select('is_registration_active')
		.eq('id', workspace.id)
		.single();
		
	  if (data) setIsActive(data.is_registration_active);

	  // Fetch Quick Stats (Pending Registrations)
	  const { count: pendingCount } = await supabase
		.from('residents')
		.select('*', { count: 'exact', head: true })
		.eq('workspace_id', workspace.id)
		.eq('status', 'pending');

	  const { count: totalCount } = await supabase
		.from('residents')
		.select('*', { count: 'exact', head: true })
		.eq('workspace_id', workspace.id);

	  setStats({ pending: pendingCount || 0, total: totalCount || 0 });
	  setLoading(false);
	};

	fetchSettings();
  }, [workspace]);

  const toggleRegistration = async () => {
	const newState = !isActive;
	setIsActive(newState);
	await supabase
	  .from('workspaces')
	  .update({ is_registration_active: newState })
	  .eq('id', workspace.id);
  };

  const copyToClipboard = () => {
	navigator.clipboard.writeText(registrationUrl);
	setCopied(true);
	setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold font-['Tajawal']">جاري تحميل الإعدادات...</div>;

  return (
	<div className="flex flex-col gap-6 h-full font-['Tajawal']" dir="rtl">
	  
	  {/* Header */}
	  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shrink-0 flex items-center justify-between">
		<div>
		  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
			<Globe className="text-blue-500" size={24} /> 
			إدارة بوابة حصر السكان
		  </h3>
		  <p className="text-sm text-slate-500 font-bold">
			التحكم في رابط التسجيل الخارجي الخاص بـ {workspace?.name}
		  </p>
		</div>
		
		{/* Toggle Switch */}
		<div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
		  <div className="text-sm font-bold text-slate-700">حالة البوابة:</div>
		  <button 
			onClick={toggleRegistration}
			className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
		  >
			<span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? '-translate-x-1' : '-translate-x-8'}`} />
		  </button>
		  <span className={`text-xs font-black px-2 py-1 rounded ${isActive ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-200'}`}>
			{isActive ? 'مفتوح للتسجيل' : 'مغلق'}
		  </span>
		</div>
	  </div>

	  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
		
		{/* Share Link & Stats */}
		<div className="lg:col-span-8 flex flex-col gap-6">
		  
		  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
			<h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
			  <Share2 className="text-red-500" size={20} /> مشاركة الرابط مع السكان
			</h4>
			<p className="text-sm text-slate-500 font-bold mb-6">
			  قم بنسخ هذا الرابط ومشاركته عبر مجموعات الواتساب أو الرسائل النصية ليتمكن السكان من التسجيل وتحديث بياناتهم بأنفسهم.
			</p>
			
			<div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2">
			  <div className="flex-1 px-3 text-left font-['IBM_Plex_Mono'] text-sm text-slate-700 overflow-x-auto whitespace-nowrap scrollbar-hide" dir="ltr">
				{registrationUrl}
			  </div>
			  <button 
				onClick={copyToClipboard}
				className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-black transition-all ${
				  copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
				}`}
			  >
				{copied ? <><CheckCircle size={16} /> تم النسخ</> : <><Copy size={16} /> نسخ الرابط</>}
			  </button>
			</div>
		  </div>

		  <div className="grid grid-cols-2 gap-6">
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
			  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
				<Users size={24} />
			  </div>
			  <div>
				<div className="text-2xl font-black text-slate-800 font-['IBM_Plex_Mono']">{stats.pending}</div>
				<div className="text-xs font-bold text-slate-500">طلبات بانتظار المراجعة</div>
			  </div>
			</div>
			<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
			  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-200">
				<CheckCircle size={24} />
			  </div>
			  <div>
				<div className="text-2xl font-black text-slate-800 font-['IBM_Plex_Mono']">{stats.total}</div>
				<div className="text-xs font-bold text-slate-500">إجمالي السجلات المدخلة</div>
			  </div>
			</div>
		  </div>

		</div>

		{/* QR Code Panel */}
		<div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
		  <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mb-4 text-slate-700">
			<QrCode size={24} />
		  </div>
		  <h4 className="text-lg font-black text-slate-800 mb-2">رمز الاستجابة السريعة</h4>
		  <p className="text-xs text-slate-500 font-bold mb-8">
			يمكنك طباعة هذا الرمز وتعليقه في المكاتب الإدارية ليقوم السكان بمسحه بهواتفهم.
		  </p>
		  
		  <div className="bg-white border-2 border-slate-800 p-4 rounded-2xl shadow-lg mb-6 relative group">
			<img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
		  </div>
		  
		  <a 
			href={qrCodeUrl} 
			download={`QR_${workspace?.slug}_Registration.png`}
			className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 border-b border-blue-200 pb-0.5"
		  >
			تنزيل صورة الرمز للطباعة
		  </a>
		</div>

	  </div>
	</div>
  );
}