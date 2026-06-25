import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ArrowLeft, Mail, Globe, LifeBuoy,
  LayoutDashboard, Map, CreditCard, FileText,
  ChevronLeft, BarChart3, Users, ShieldCheck,
  X, Loader2, TrendingUp, CheckCircle2, Zap,
  Home, ArrowRight
} from 'lucide-react';

const OPS_API = 'https://script.google.com/macros/s/AKfycby7xDEoYBzGM7sAAAkX0LDTKNHo63LjbgmaC-0VLXESPFj7BSl10GE-sIqM-Ss3wE8/exec';
const TARGET_EMAIL = 'info@operix-solutions.com';

/* ─── stat counter hook ─── */
function useCounter(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
	const obs = new IntersectionObserver(([e]) => {
	  if (e.isIntersecting && !started.current) {
		started.current = true;
		const start = performance.now();
		const tick = (now) => {
		  const p = Math.min((now - start) / duration, 1);
		  const ease = 1 - Math.pow(1 - p, 3);
		  setCount(Math.round(ease * target));
		  if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	  }
	}, { threshold: 0.3 });
	if (ref.current) obs.observe(ref.current);
	return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

const tabs = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة القيادة' },
  { id: 'gis',       icon: Map,            label: 'الخريطة التفاعلية (GIS)' },
  { id: 'eid',       icon: CreditCard,     label: 'الهوية الذكية (E-ID)' },
  { id: 'certs',     icon: FileText,       label: 'إصدار الشهادات' },
];

const features = [
  { icon: LayoutDashboard, color: 'text-blue-600',   bg: 'bg-blue-50',    title: 'لوحة قيادة ذكية',      desc: 'مؤشرات أداء حية لكل الوحدات والمرافق والأحداث' },
  { icon: Map,             color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'خريطة GIS تفاعلية',    desc: 'ربط كل وحدة سكنية بموقعها الجغرافي الدقيق' },
  { icon: CreditCard,      color: 'text-violet-600',  bg: 'bg-violet-50',  title: 'هويات رقمية مشفرة',    desc: 'بطاقات ذكية قابلة للمسح لكل فرد في المجتمع' },
  { icon: FileText,        color: 'text-amber-600',   bg: 'bg-amber-50',   title: 'وثائق معتمدة فورية',   desc: 'إصدار وطباعة الشهادات والتقارير الرسمية بضغطة' },
  { icon: ShieldCheck,     color: 'text-red-600',     bg: 'bg-red-50',     title: 'أمان وصلاحيات متقدمة', desc: 'تحكم دقيق في الأدوار والوصول لكل مستخدم' },
  { icon: TrendingUp,      color: 'text-cyan-600',    bg: 'bg-cyan-50',    title: 'تقارير وتحليلات',       desc: 'تقارير قابلة للتصدير بمرئيات بيانية متطورة' },
];

export default function Landing() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', size: '1-50' });
  const [residents, residentsRef]   = useCounter(1240);
  const [units, unitsRef]           = useCounter(320);
  const [occupancy, occupancyRef]   = useCounter(85);

  const handleDemoRequest = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	try {
	  await fetch(OPS_API, {
		method: 'POST', mode: 'no-cors',
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify({
		  action: 'send_email', emailTo: TARGET_EMAIL,
		  subject: `طلب تجربة/تواصل جديد: ${formData.company}`,
		  body: `الاسم: ${formData.name}\nالبريد: ${formData.email}\nالجهة: ${formData.company}\nعدد الوحدات: ${formData.size}`,
		}),
	  });
	  alert('تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً.');
	  setIsModalOpen(false);
	  setFormData({ name: '', email: '', company: '', size: '1-50' });
	} catch {
	  alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
	} finally {
	  setIsSubmitting(false);
	}
  };

  return (
	<>
	  <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
		* { box-sizing: border-box; }
		body { margin: 0; }
		@keyframes fadeUp {
		  from { opacity: 0; transform: translateY(18px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		@keyframes shimmer {
		  0%   { background-position: 200% 0; }
		  100% { background-position: -200% 0; }
		}
		@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
		.fade-up    { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
		.fade-up-1  { animation-delay: .08s; }
		.fade-up-2  { animation-delay: .16s; }
		.fade-up-3  { animation-delay: .24s; }
		.fade-up-4  { animation-delay: .32s; }
		.tab-panel  { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) both; }
		.shimmer-bar {
		  background: linear-gradient(90deg,#dc2626,#f87171,#dc2626);
		  background-size: 200% 100%;
		  animation: shimmer 2.5s linear infinite;
		}
		@media (prefers-reduced-motion: reduce) {
		  .fade-up,.fade-up-1,.fade-up-2,.fade-up-3,.fade-up-4,.tab-panel { animation: none; }
		}
	  `}</style>

	  <div
		style={{ fontFamily: "'Tajawal', sans-serif" }}
		className="min-h-screen bg-slate-50 text-slate-900"
		dir="rtl"
	  >

		{/* ── Navbar ── */}
		<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
		  <div className="max-w-7xl mx-auto px-5 h-[68px] flex items-center justify-between">
			{/* Brand */}
			<div className="flex items-center gap-3">
			  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow">
				<img
				  src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png"
				  alt="Logo"
				  className="w-5 h-5 object-contain invert"
				  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>'; }}
				/>
			  </div>
			  <span className="text-xl font-black tracking-tight text-slate-900">حصاد</span>
			</div>

			{/* Nav links */}
			<div className="flex items-center gap-2">
			  <Link
				to="/subscriptions"
				className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
			  >
				الباقات والاشتراكات
			  </Link>
			  <Link
				to="/gate"
				className="mr-1 px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
			  >
				<span>تسجيل الدخول</span>
				<ArrowLeft size={15} />
			  </Link>
			</div>
		  </div>
		</nav>

		{/* ── Hero ── */}
		<section className="max-w-7xl mx-auto px-5 pt-28 pb-20 text-center flex flex-col items-center">
		  <div className="fade-up inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
			<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
			النظام المؤسسي لإدارة المجتمعات السكنية
		  </div>

		  <h1 className="fade-up fade-up-1 text-5xl md:text-[68px] font-black leading-[1.12] text-slate-900 tracking-tight max-w-4xl mb-7">
			إدارة رقمية متكاملة<br />
			<span className="text-red-600">لمجتمعك السكني</span>
		  </h1>

		  <p className="fade-up fade-up-2 text-lg md:text-xl text-slate-500 mb-11 max-w-2xl leading-relaxed font-medium">
			بنية تحتية برمجية متطورة توفر لوحات قياس ذكية، خرائط جغرافية&nbsp;(GIS)،
			وهويات رقمية لضمان أعلى معايير التنظيم والأمان.
		  </p>

		  <div className="fade-up fade-up-3 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
			<button
			  onClick={() => setIsModalOpen(true)}
			  className="group w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-900/10"
			>
			  <span>طلب تجربة النظام</span>
			  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
			</button>
			<Link
			  to="/subscriptions"
			  className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2"
			>
			  <span>عرض الباقات والتسعير</span>
			</Link>
		  </div>
		</section>

		{/* ── Stats strip ── */}
		<section className="border-y border-slate-200 bg-white py-10 mb-20">
		  <div className="max-w-4xl mx-auto px-5 grid grid-cols-3 gap-0 divide-x divide-x-reverse divide-slate-100">
			{[
			  { ref: residentsRef, val: residents, suffix: '+', label: 'ساكن مسجل' },
			  { ref: unitsRef,     val: units,     suffix: '+', label: 'وحدة سكنية' },
			  { ref: occupancyRef, val: occupancy, suffix: '%', label: 'نسبة الإشغال' },
			].map((s, i) => (
			  <div key={i} ref={s.ref} className="flex flex-col items-center py-2">
				<div
				  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
				  className="text-4xl font-bold text-slate-900"
				>
				  {s.val.toLocaleString()}{s.suffix}
				</div>
				<div className="text-sm text-slate-500 font-bold mt-1">{s.label}</div>
			  </div>
			))}
		  </div>
		</section>

		{/* ── Interactive Simulator ── */}
		<section className="max-w-6xl mx-auto px-5 mb-24">
		  <div className="text-center mb-10">
			<h2 className="text-3xl font-black text-slate-900 mb-2">استكشف الواجهات</h2>
			<p className="text-slate-500 font-medium">نظرة داخلية على إمكانيات النظام</p>
		  </div>

		  <div className="bg-white rounded-2xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] border border-slate-200 overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 480 }}>

			{/* Sidebar */}
			<div className="w-full md:w-64 bg-slate-50/80 border-b md:border-b-0 md:border-l border-slate-200 p-5 flex flex-col gap-1 shrink-0">
			  <div className="text-[10px] font-black text-slate-400 mb-3 tracking-widest uppercase">الواجهات</div>
			  {tabs.map((tab) => (
				<button
				  key={tab.id}
				  onClick={() => setActiveTab(tab.id)}
				  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
					activeTab === tab.id
					  ? 'bg-white shadow-sm border border-slate-200 text-red-600'
					  : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
				  }`}
				>
				  <div className="flex items-center gap-2.5">
					<tab.icon size={16} className={activeTab === tab.id ? 'text-red-500' : 'text-slate-400'} />
					{tab.label}
				  </div>
				  {activeTab === tab.id && <ChevronLeft size={14} className="text-slate-300" />}
				</button>
			  ))}
			</div>

			{/* Panel */}
			<div className="flex-1 p-8 md:p-10 flex flex-col justify-center overflow-hidden">
			  {activeTab === 'dashboard' && (
				<div className="tab-panel w-full">
				  <div className="flex items-start justify-between mb-7">
					<div>
					  <h3 className="text-2xl font-black text-slate-900">مؤشرات الأداء</h3>
					  <p className="text-sm text-slate-500 mt-1">نظرة عامة على البيانات الحية</p>
					</div>
					<BarChart3 size={40} className="text-slate-200" />
				  </div>
				  <div className="grid grid-cols-2 gap-4 mb-5">
					<div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
					  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-3">
						<Users size={13} className="text-blue-500" /> إجمالي السكان
					  </div>
					  <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-4xl font-bold text-slate-900">1,240</div>
					  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-bold">
						<TrendingUp size={12} /> <span>+3.2% هذا الشهر</span>
					  </div>
					</div>
					<div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
					  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-3">
						<Home size={13} className="text-emerald-500" /> نسبة الإشغال
					  </div>
					  <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-4xl font-bold text-slate-900">
						85<span className="text-xl text-slate-400">%</span>
					  </div>
					  <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
						<div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
					  </div>
					</div>
				  </div>
				  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
					<Zap size={15} className="text-amber-500 shrink-0" />
					<span className="text-xs text-slate-600 font-bold">آخر تحديث: منذ ٣ دقائق</span>
					<span className="mr-auto text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">مباشر</span>
				  </div>
				</div>
			  )}

			  {activeTab === 'gis' && (
				<div className="tab-panel w-full">
				  <div className="mb-6">
					<h3 className="text-2xl font-black text-slate-900">الربط الجغرافي الدقيق</h3>
					<p className="text-sm text-slate-500 mt-1">تتبع الوحدات والمرافق على الخريطة</p>
				  </div>
				  <div className="w-full bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-wrap gap-2 p-6 items-center justify-center" style={{ minHeight: 240 }}>
					<div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
					{[...Array(12)].map((_, i) => (
					  <div
						key={i}
						className={`w-[72px] h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
						  i === 4 ? 'bg-red-50 border-red-400 shadow-md shadow-red-200' :
						  i === 7 ? 'bg-blue-50 border-blue-300' :
						  'bg-white border-slate-200'
						}`}
					  >
						<span className="text-[10px] font-bold text-slate-400 font-mono">B{i + 1}</span>
					  </div>
					))}
					<div className="absolute bottom-3 left-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-sm">
					  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600"><span className="w-2 h-2 rounded bg-red-400" />مُحدد</span>
					  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><span className="w-2 h-2 rounded bg-blue-300" />مميز</span>
					  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded bg-slate-200" />عادي</span>
					</div>
				  </div>
				</div>
			  )}

			  {activeTab === 'eid' && (
				<div className="tab-panel w-full flex flex-col items-center">
				  <div className="mb-8 text-center">
					<h3 className="text-2xl font-black text-slate-900">هويات رقمية مشفرة</h3>
					<p className="text-sm text-slate-500 mt-1">إصدار بطاقات ذكية لكل فرد في المجتمع</p>
				  </div>
				  <div
					className="w-full max-w-[360px] rounded-2xl shadow-2xl p-6 flex flex-col justify-between border relative overflow-hidden hover:scale-[1.03] transition-transform duration-500 cursor-pointer"
					style={{ background: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', aspectRatio: '85/54', borderColor: '#334155' }}
				  >
					<div className="absolute left-[-15%] top-[-30%] w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle,rgba(220,38,38,0.25),transparent 70%)' }} />
					<div className="absolute bottom-[-20%] right-[-10%] w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)' }} />
					<div className="flex justify-between items-start z-10 relative">
					  <div>
						<div className="text-[9px] font-bold text-slate-400 mb-1 tracking-widest">CITY RESIDENT · حصاد</div>
						<div className="font-black text-base text-white">أحمد محمد عبدالله</div>
						<div className="text-[10px] text-slate-400 mt-1">مجمع النسيم — بلوك أ</div>
					  </div>
					  <div className="w-11 h-13 bg-slate-700/60 rounded-lg border border-slate-600 flex items-center justify-center">
						<div className="w-6 h-6 bg-slate-600/60 rounded" />
					  </div>
					</div>
					<div className="z-10 relative">
					  <div className="text-[9px] font-bold text-slate-500 mb-1 tracking-widest">RESIDENT ID</div>
					  <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-white font-bold tracking-[3px] text-sm">1234 5678 9012</div>
					</div>
					<div className="z-10 relative flex justify-between items-center">
					  <div className="flex gap-1">
						{[...Array(5)].map((_, i) => (
						  <div key={i} className="w-4 h-1 rounded-full bg-slate-600" />
						))}
					  </div>
					  <ShieldCheck className="text-red-500 opacity-70" size={20} />
					</div>
				  </div>
				</div>
			  )}

			  {activeTab === 'certs' && (
				<div className="tab-panel w-full">
				  <div className="mb-7">
					<h3 className="text-2xl font-black text-slate-900">إصدار الوثائق</h3>
					<p className="text-sm text-slate-500 mt-1">توليد وطباعة الشهادات المعتمدة بضغطة زر</p>
				  </div>
				  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center">
					<div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
					  <div className="absolute top-4 left-4 w-11 h-11 rounded-full border-2 border-red-200 flex items-center justify-center text-red-300 font-black text-[10px] -rotate-12">ختم</div>
					  <div className="h-3 w-2/5 bg-slate-200 rounded mb-6 mx-auto" />
					  <div className="space-y-2.5 mb-7">
						<div className="h-2 w-full bg-slate-100 rounded" />
						<div className="h-2 w-5/6 bg-slate-100 rounded" />
						<div className="h-2 w-4/6 bg-slate-100 rounded" />
					  </div>
					  <div className="h-px w-full bg-slate-100 mb-4" />
					  <div className="flex justify-between items-center">
						<div className="h-2 w-16 bg-slate-200 rounded" />
						<div className="h-2 w-24 bg-slate-200 rounded" />
					  </div>
					</div>
					<button className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-md shadow-red-600/20">
					  <FileText size={15} />
					  طباعة الشهادة
					</button>
				  </div>
				</div>
			  )}
			</div>
		  </div>
		</section>

		{/* ── Features grid ── */}
		<section className="max-w-6xl mx-auto px-5 mb-24">
		  <div className="text-center mb-12">
			<h2 className="text-3xl font-black text-slate-900 mb-2">كل ما تحتاجه في مكان واحد</h2>
			<p className="text-slate-500 font-medium">منظومة متكاملة مصممة لاحتياجات لجان الأحياء والمجمعات السكنية</p>
		  </div>
		  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{features.map((f, i) => (
			  <div
				key={i}
				className="bg-white rounded-2xl border border-slate-200 p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-300 group"
			  >
				<div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
				  <f.icon size={20} className={f.color} />
				</div>
				<h3 className="font-black text-slate-900 mb-1.5">{f.title}</h3>
				<p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
			  </div>
			))}
		  </div>
		</section>

		{/* ── CTA banner ── */}
		<section className="max-w-6xl mx-auto px-5 mb-24">
		  <div className="bg-slate-900 rounded-2xl p-10 md:p-14 text-center relative overflow-hidden">
			<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(220,38,38,0.6) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(99,102,241,0.4) 0%,transparent 50%)' }} />
			<div className="relative z-10">
			  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">ابدأ رحلتك الرقمية اليوم</h2>
			  <p className="text-slate-400 mb-8 max-w-xl mx-auto font-medium leading-relaxed">
				فريق Operix Solutions جاهز لتقديم عرض توضيحي مخصص لمجتمعك السكني
			  </p>
			  <div className="flex flex-col sm:flex-row gap-3 justify-center">
				<button
				  onClick={() => setIsModalOpen(true)}
				  className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/30 hover:-translate-y-0.5"
				>
				  طلب عرض توضيحي
				</button>
				<Link
				  to="/subscriptions"
				  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 transition-all"
				>
				  استعرض الباقات
				</Link>
			  </div>
			</div>
		  </div>
		</section>

		{/* ── Footer ── */}
		<footer className="border-t border-slate-200 bg-white">
		  <div className="max-w-7xl mx-auto px-5 py-12">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
			  <div>
				<div className="flex items-center gap-2.5 mb-3">
				  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
					<Building2 size={16} className="text-white" />
				  </div>
				  <span className="font-black text-slate-900">حصاد</span>
				</div>
				<p className="text-slate-500 text-sm leading-relaxed font-medium">
				  النظام المؤسسي لإدارة المجتمعات السكنية، مدعوم بواسطة Operix Solutions.
				</p>
			  </div>
			  <div>
				<div className="text-xs font-black text-slate-400 mb-4 tracking-widest uppercase">روابط</div>
				<div className="flex flex-col gap-2">
				  <Link to="/"             className="text-sm text-slate-600 hover:text-red-600 font-bold transition-colors">الصفحة الرئيسية</Link>
				  <Link to="/subscriptions" className="text-sm text-slate-600 hover:text-red-600 font-bold transition-colors">الباقات والاشتراكات</Link>
				  <Link to="/gate"          className="text-sm text-slate-600 hover:text-red-600 font-bold transition-colors">تسجيل الدخول</Link>
				</div>
			  </div>
			  <div>
				<div className="text-xs font-black text-slate-400 mb-4 tracking-widest uppercase">تواصل معنا</div>
				<div className="flex flex-col gap-3">
				  <a href="https://www.operix-solutions.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
					<Globe size={15} className="text-slate-400" />
					<span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>www.operix-solutions.com</span>
				  </a>
				  <a href="mailto:info@operix-solutions.com" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
					<Mail size={15} className="text-slate-400" />
					<span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>info@operix-solutions.com</span>
				  </a>
				  <a href="mailto:support@operix-solutions.com" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
					<LifeBuoy size={15} className="text-slate-400" />
					<span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>support@operix-solutions.com</span>
				  </a>
				</div>
			  </div>
			</div>
			<div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
			  <span className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} Operix Solutions. جميع الحقوق محفوظة.</span>
			  <span className="text-xs text-slate-400 font-medium">نظام حصاد لإدارة المجتمعات السكنية</span>
			</div>
		  </div>
		</footer>

		{/* ── Request Modal ── */}
		{isModalOpen && (
		  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
			<div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
			<div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" style={{ animation: 'fadeUp .3s cubic-bezier(.16,1,.3,1) both' }}>
			  <div className="h-1 shimmer-bar" />
			  <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
				<h3 className="text-xl font-black text-slate-900">طلب تجربة النظام</h3>
				<button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
				  <X size={18} />
				</button>
			  </div>
			  <div className="p-6 space-y-4">
				{[
				  { label: 'الاسم الكامل',          key: 'name',    type: 'text',  dir: 'rtl', mono: false },
				  { label: 'البريد الإلكتروني',     key: 'email',   type: 'email', dir: 'ltr', mono: true  },
				].map(({ label, key, type, dir, mono }) => (
				  <div key={key}>
					<label className="block text-xs font-black text-slate-500 mb-1.5">{label}</label>
					<input
					  type={type}
					  required
					  dir={dir}
					  value={formData[key]}
					  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
					  style={mono ? { fontFamily: "'IBM Plex Mono', monospace" } : {}}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
					/>
				  </div>
				))}
				<div className="grid grid-cols-2 gap-3">
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">اسم المجمع / الجهة</label>
					<input
					  type="text" required
					  value={formData.company}
					  onChange={e => setFormData({ ...formData, company: e.target.value })}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
					/>
				  </div>
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">عدد الوحدات</label>
					<select
					  value={formData.size}
					  onChange={e => setFormData({ ...formData, size: e.target.value })}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all cursor-pointer"
					>
					  <option value="1-50">1 – 50</option>
					  <option value="51-200">51 – 200</option>
					  <option value="201-500">201 – 500</option>
					  <option value="+500">+500</option>
					</select>
				  </div>
				</div>
				<button
				  type="button"
				  disabled={isSubmitting}
				  onClick={handleDemoRequest}
				  className="w-full h-12 bg-red-600 text-white font-bold text-[15px] rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-60 flex justify-center items-center gap-2 mt-1"
				>
				  {isSubmitting
					? <><Loader2 size={17} className="animate-spin" /> جاري الإرسال...</>
					: 'إرسال الطلب'}
				</button>
			  </div>
			</div>
		  </div>
		)}
	  </div>
	</>
  );
}