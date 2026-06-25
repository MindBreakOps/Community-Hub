import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

export default function WorkspaceGate() {
  const [slug, setSlug] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e) => {
	e.preventDefault();
	if (slug.trim()) {
	  // Redirect to the tenant-specific login page
	  navigate(`/${slug.trim().toLowerCase()}/login`);
	}
  };

  return (
	<div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center overflow-hidden font-['Tajawal']" dir="rtl">
	  {/* Background Effects */}
	  <div className="absolute inset-0 overflow-hidden pointer-events-none">
		<div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.12)_0%,transparent_70%)] animate-[pulse_8s_ease-in-out_infinite_alternate]" />
		<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
	  </div>

	  <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 w-full max-w-[420px] mx-4 shadow-2xl">
		<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-800 via-red-500 to-red-800 rounded-t-2xl" />
		
		<div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
		   <Building2 size={32} className="text-white" />
		</div>
		
		<div className="text-2xl font-black text-white text-center tracking-tight mb-2">مرحباً بك في حصاد</div>
		<div className="text-xs text-white/50 text-center mb-8 leading-relaxed">
		  يرجى إدخال المعرف الخاص بمجتمعك السكني للوصول إلى بوابة الدخول الخاصة بك.
		</div>

		<form onSubmit={handleContinue}>
		  <div className="mb-6">
			<label className="block text-xs font-bold text-white/70 mb-2">معرف المجتمع (Workspace ID)</label>
			<div className="relative">
			  <input 
				type="text" 
				value={slug}
				onChange={(e) => setSlug(e.target.value)}
				className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 text-white text-left font-['IBM_Plex_Mono'] outline-none focus:bg-black/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
				placeholder="e.g. alnaseem"
				required
				dir="ltr"
			  />
			</div>
		  </div>

		  <button 
			type="submit" 
			className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 font-extrabold text-[15px] rounded-lg shadow-lg hover:bg-slate-100 hover:-translate-y-px transition-all"
		  >
			<span>متابعة</span>
			<ArrowLeft size={18} />
		  </button>
		</form>
	  </div>
	</div>
  );
}