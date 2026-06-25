import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Home, ChevronLeft } from 'lucide-react';

export default function WorkspaceGate() {
  const [slug, setSlug] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleContinue = (e) => {
	e.preventDefault();
	if (slug.trim()) {
	  navigate(`/${slug.trim().toLowerCase()}/login`);
	}
  };

  return (
	<>
	  <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
		* { box-sizing: border-box; }
		body { margin: 0; }
		@keyframes fadeUp {
		  from { opacity: 0; transform: translateY(20px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		.card-in { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
		@media (prefers-reduced-motion: reduce) { .card-in { animation: none; } }
	  `}</style>

	  <div
		style={{ fontFamily: "'Tajawal', sans-serif" }}
		className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12"
		dir="rtl"
	  >
		{/* Back to landing */}
		<Link
		  to="/"
		  className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
		>
		  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
		  العودة للصفحة الرئيسية
		</Link>

		{/* Card */}
		<div className="card-in w-full max-w-[420px]">
		  {/* Brand strip */}
		  <div className="flex items-center gap-3 justify-center mb-8">
			<div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
			  <img
				src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png"
				alt="Logo"
				className="w-6 h-6 object-contain invert"
				onError={(e) => {
				  e.currentTarget.style.display = 'none';
				  e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
				}}
			  />
			</div>
			<span className="text-2xl font-black text-slate-900 tracking-tight">حصاد</span>
		  </div>

		  <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
			{/* Top accent */}
			<div className="h-1 bg-gradient-to-l from-red-800 via-red-500 to-red-800" />

			<div className="p-8">
			  {/* Icon */}
			  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
				<Building2 size={26} className="text-slate-700" />
			  </div>

			  {/* Heading */}
			  <div className="text-center mb-7">
				<h1 className="text-2xl font-black text-slate-900 mb-1.5">أدخل معرّف مجتمعك</h1>
				<p className="text-sm text-slate-500 font-medium leading-relaxed">
				  كل مجتمع سكني لديه معرّف فريد. يمكنك الحصول عليه من مسؤول مجتمعك.
				</p>
			  </div>

			  {/* Input */}
			  <form onSubmit={handleContinue}>
				<div className="mb-5">
				  <label className="block text-xs font-black text-slate-500 mb-1.5 tracking-wide">
					معرّف المجتمع (Workspace ID)
				  </label>
				  <div className={`flex items-center bg-slate-50 border rounded-xl overflow-hidden transition-all duration-200 ${isFocused ? 'border-red-500 ring-2 ring-red-500/15 bg-white' : 'border-slate-200'}`}>
					<span
					  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
					  className="text-slate-400 text-sm px-3 border-l border-slate-200 py-3 select-none bg-slate-100/50"
					>
					  hasad.operix/
					</span>
					<input
					  type="text"
					  value={slug}
					  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
					  onFocus={() => setIsFocused(true)}
					  onBlur={() => setIsFocused(false)}
					  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
					  className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder-slate-400"
					  placeholder="alnaseem"
					  required
					  dir="ltr"
					/>
				  </div>
				  <p className="mt-1.5 text-xs text-slate-400 font-medium">
					أحرف إنجليزية وأرقام وشرطات فقط
				  </p>
				</div>

				<button
				  type="submit"
				  disabled={!slug.trim()}
				  className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all shadow-md shadow-slate-900/10"
				>
				  <span>متابعة</span>
				  <ChevronLeft size={16} />
				</button>
			  </form>
			</div>
		  </div>

		  {/* Footer links */}
		  <div className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-400">
			<Link to="/" className="flex items-center gap-1 hover:text-slate-700 font-bold transition-colors">
			  <Home size={12} />
			  الرئيسية
			</Link>
			<span className="text-slate-200">|</span>
			<Link to="/subscriptions" className="hover:text-slate-700 font-bold transition-colors">
			  الباقات والاشتراكات
			</Link>
			<span className="text-slate-200">|</span>
			<a href="mailto:support@operix-solutions.com" className="hover:text-slate-700 font-bold transition-colors">
			  الدعم الفني
			</a>
		  </div>
		</div>
	  </div>
	</>
  );
}