import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Building2, ShieldCheck, Zap, X, Loader2, Sparkles, Mail, Phone, FileText } from 'lucide-react';

const OPS_API = 'https://script.google.com/macros/s/AKfycby7xDEoYBzGM7sAAAkX0LDTKNHo63LjbgmaC-0VLXESPFj7BSl10GE-sIqM-Ss3wE8/exec';
const TARGET_EMAIL = 'info@operix-solutions.com';

const plans = [
  {
	key: 'basic',
	name: 'الأساسية',
	desc: 'مثالية للمجمعات الصغيرة ولجان الأحياء الناشئة',
	price: 'تواصل معنا',
	icon: Building2,
	iconColor: 'text-slate-600',
	iconBg: 'bg-slate-100',
	badge: null,
	features: [
	  'قاعدة بيانات السكان الأساسية',
	  'نظام إدارة لجنة الحي',
	  'لوحة تحكم المشرف',
	  'دعم عبر البريد الإلكتروني',
	],
  },
  {
	key: 'pro',
	name: 'الاحترافية',
	desc: 'النظام المتكامل للمجتمعات السكنية المتنامية',
	price: 'تواصل معنا',
	icon: Zap,
	iconColor: 'text-red-600',
	iconBg: 'bg-red-50',
	badge: 'الأكثر طلباً',
	features: [
	  'عدد غير محدود من السجلات',
	  'الخريطة التفاعلية (GIS)',
	  'إصدار الهويات الذكية (E-ID)',
	  'طباعة الشهادات المعتمدة',
	  'تقارير وتحليلات متقدمة',
	  'دعم فني مخصص على مدار الساعة',
	],
  },
  {
	key: 'enterprise',
	name: 'المؤسسات',
	desc: 'حلول مخصصة للجهات الحكومية والشركات العقارية',
	price: 'مخصصة',
	icon: ShieldCheck,
	iconColor: 'text-violet-600',
	iconBg: 'bg-violet-50',
	badge: null,
	features: [
	  'تخصيص كامل (White-label)',
	  'ربط مع السجل المدني (API)',
	  'استضافة سحابية خاصة',
	  'مدير حساب مخصص',
	],
  },
];

const countries = [
  { code: 'SA', name: 'السعودية',     dial: '+966' },
  { code: 'SD', name: 'السودان',      dial: '+249' },
  { code: 'QA', name: 'قطر',          dial: '+974' },
  { code: 'OM', name: 'عُمان',        dial: '+968' },
  { code: 'KW', name: 'الكويت',       dial: '+965' },
  { code: 'BH', name: 'البحرين',      dial: '+973' },
  { code: 'EG', name: 'مصر',          dial: '+20'  },
  { code: 'JO', name: 'الأردن',       dial: '+962' },
  { code: 'IQ', name: 'العراق',       dial: '+964' },
  { code: 'YE', name: 'اليمن',        dial: '+967' },
  { code: 'LB', name: 'لبنان',        dial: '+961' },
  { code: 'SY', name: 'سوريا',        dial: '+963' },
  { code: 'PS', name: 'فلسطين',       dial: '+970' },
  { code: 'LY', name: 'ليبيا',        dial: '+218' },
  { code: 'MA', name: 'المغرب',       dial: '+212' },
  { code: 'TN', name: 'تونس',         dial: '+216' },
  { code: 'DZ', name: 'الجزائر',      dial: '+213' },
];

const faqs = [
  { q: 'هل توجد تكاليف إضافية بعد الاشتراك؟', a: 'لا توجد تكاليف خفية. السعر المتفق عليه يشمل جميع الميزات المذكورة في الباقة.' },
  { q: 'هل يمكن الترقية بين الباقات لاحقاً؟', a: 'نعم، يمكنك الترقية في أي وقت وسيُحتسب الفرق بالتناسب مع المدة المتبقية.' },
  { q: 'كم يستغرق التهيئة والإعداد؟', a: 'يستغرق الإعداد الأساسي 3-5 أيام عمل، أما المشاريع المؤسسية فقد تستغرق 2-4 أسابيع.' },
];

export default function Subscription() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', country: '', phone: '', company: '', size: '1-50' });
  const [openFaq, setOpenFaq] = useState(null);

  const openModal = (planKey) => {
	setSelectedPlan(planKey);
	setIsModalOpen(true);
  };

  const handleCountryChange = (e) => {
	const code = e.target.value;
	const country = countries.find(c => c.code === code);
	setFormData(prev => ({ ...prev, country: code, phone: country ? `${country.dial} ` : '' }));
  };

  const handleQuoteRequest = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	const planName = plans.find(p => p.key === selectedPlan)?.name ?? '';
	try {
	  await fetch(OPS_API, {
		method: 'POST', mode: 'no-cors',
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify({
		  action: 'send_email',
		  emailTo: TARGET_EMAIL,
		  subject: `طلب عرض سعر - باقة ${planName}: ${formData.company}`,
		  body: `الاسم: ${formData.name}\nالبريد: ${formData.email}\nالدولة: ${countries.find(c => c.code === formData.country)?.name || formData.country}\nالهاتف: ${formData.phone}\nالجهة: ${formData.company}\nعدد الوحدات: ${formData.size}\nالباقة المطلوبة: ${planName}`,
		}),
	  });
	  alert('تم إرسال طلبك بنجاح! سيتواصل معك فريق المبيعات قريباً.');
	  setIsModalOpen(false);
	  setFormData({ name: '', email: '', country: '', phone: '', company: '', size: '1-50' });
	} catch {
	  alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
	} finally {
	  setIsSubmitting(false);
	}
  };

  return (
	<>
	  <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
		* { box-sizing: border-box; }
		body { margin: 0; }
		@keyframes fadeUp {
		  from { opacity: 0; transform: translateY(16px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		@keyframes shimmer {
		  0%   { background-position: 200% 0; }
		  100% { background-position: -200% 0; }
		}
		.fade-up   { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
		.fade-up-1 { animation-delay: .08s; }
		.fade-up-2 { animation-delay: .16s; }
		.shimmer-bar {
		  background: linear-gradient(90deg,#dc2626,#f87171,#dc2626);
		  background-size: 200% 100%;
		  animation: shimmer 2.5s linear infinite;
		}
		.navbar-link { position: relative; }
		.navbar-link::after {
		  content: '';
		  position: absolute; right: 16px; left: 16px; bottom: 6px;
		  height: 2px; background: #dc2626; border-radius: 2px;
		  transform: scaleX(0); transform-origin: center;
		  transition: transform .25s ease;
		}
		.navbar-link:hover::after { transform: scaleX(1); }
		.plan-card { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s ease, border-color .3s ease; }
		.plan-card:hover .plan-icon-wrap { transform: scale(1.12) rotate(-4deg); }
		.plan-icon-wrap { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
		.faq-chevron { transition: transform .25s cubic-bezier(.16,1,.3,1); }
		@media (prefers-reduced-motion: reduce) {
		  .fade-up,.fade-up-1,.fade-up-2 { animation: none; }
		  .plan-icon-wrap { transition: none; }
		}
	  `}</style>

	  <div style={{ fontFamily: "'Tajawal', sans-serif" }} className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">

		{/* ── Navbar ── */}
		<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
		  <div className="max-w-7xl mx-auto px-5 h-[68px] flex items-center justify-between">
			<div className="flex items-center gap-3">
			  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow">
				<Building2 size={18} className="text-white" />
			  </div>
			  <span style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-xl tracking-tight text-slate-900">حصاد</span>
			</div>
			<div className="flex items-center gap-2">
			  <Link to="/" className="navbar-link px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-1.5">
				<ArrowRight size={15} />
				الرئيسية
			  </Link>
			  <Link to="/gate" className="mr-1 px-5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-red-600/20">
				تسجيل الدخول
			  </Link>
			</div>
		  </div>
		</nav>

		{/* ── Hero header ── */}
		<div className="bg-white border-b border-slate-200 py-20 px-5">
		  <div className="max-w-3xl mx-auto text-center">
			<div className="fade-up inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-xs font-bold text-red-600">
			  <Sparkles size={13} />
			  باقات الاشتراك في نظام حصاد
			</div>
			<h1 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="fade-up fade-up-1 text-4xl md:text-[52px] leading-[1.3] text-slate-900 mb-5">
			  اختر الباقة المناسبة<br />لمجتمعك السكني
			</h1>
			<p className="fade-up fade-up-2 text-lg text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
			  جميع باقاتنا مدعومة ومطورة بواسطة Operix Solutions لضمان أعلى مستويات الموثوقية والأداء.
			</p>
		  </div>
		</div>

		{/* ── Pricing cards ── */}
		<div className="max-w-6xl mx-auto px-5 py-16">
		  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
			{plans.map((plan) => (
			  <div
				key={plan.key}
				className={`plan-card relative bg-white rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1 group ${
				  plan.badge ? 'border-2 border-red-500 shadow-xl shadow-red-500/10 md:-translate-y-3' : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
				}`}
			  >
				{plan.badge && (
				  <div className="bg-red-600 text-white text-xs font-black text-center py-2 tracking-wide">⭐ {plan.badge}</div>
				)}
				<div className="p-7 flex flex-col flex-1">
				  <div className={`plan-icon-wrap w-11 h-11 ${plan.iconBg} rounded-xl flex items-center justify-center mb-4`}>
					<plan.icon size={20} className={plan.iconColor} />
				  </div>
				  <h3 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-slate-900 mb-1">{plan.name}</h3>
				  <p className="text-sm text-slate-500 font-medium mb-6 min-h-[40px] leading-relaxed">{plan.desc}</p>
				  <div className="mb-6 pb-6 border-b border-slate-100">
					<span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className={`text-2xl font-bold ${plan.badge ? 'text-red-600' : 'text-slate-800'}`}>
					  {plan.price}
					</span>
				  </div>
				  <ul className="space-y-3 mb-8 flex-1">
					{plan.features.map((f, i) => (
					  <li key={i} className="flex items-start gap-3">
						<Check size={16} className="text-emerald-500 shrink-0 mt-0.5 font-bold" />
						<span className="text-sm text-slate-700 font-bold leading-snug">{f}</span>
					  </li>
					))}
				  </ul>
				  <button
					onClick={() => openModal(plan.key)}
					className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
					  plan.badge ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
					}`}
				  >
					طلب عرض سعر
				  </button>
				</div>
			  </div>
			))}
		  </div>

		  {/* ── FAQ ── */}
		  <div className="mt-20">
			<h2 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-slate-900 mb-8 text-center">أسئلة شائعة</h2>
			<div className="max-w-2xl mx-auto space-y-3">
			  {faqs.map((faq, i) => (
				<div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
				  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-right font-bold text-slate-900 hover:bg-slate-50 transition-colors">
					<span>{faq.q}</span>
					<span className={`faq-chevron text-slate-400 text-xl leading-none ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
				  </button>
				  {openFaq === i && (
					<div className="px-6 pb-5 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-4">{faq.a}</div>
				  )}
				</div>
			  ))}
			</div>
		  </div>

		  {/* ── Contact banner ── */}
		  <div className="mt-16 bg-slate-900 rounded-2xl p-10 text-center relative overflow-hidden">
			<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%,rgba(220,38,38,0.6),transparent 50%),radial-gradient(circle at 80% 50%,rgba(99,102,241,0.4) 0%,transparent 50%)' }} />
			<div className="relative z-10">
			  <h4 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-white mb-3">هل تحتاج إلى استشارة متخصصة؟</h4>
			  <p className="text-slate-400 mb-7 font-medium max-w-xl mx-auto">فريقنا التقني جاهز لدراسة متطلباتك وتقديم الحل المناسب لحجم مجتمعك.</p>
			  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
				<a href="mailto:info@operix-solutions.com" dir="ltr" style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-xl transition-all">
				  <Mail size={15} />
				  info@operix-solutions.com
				</a>
			  </div>
			</div>
		  </div>
		</div>

		{/* ── Footer ── */}
		<footer className="border-t border-slate-200 bg-white">
		  <div className="max-w-7xl mx-auto px-5 py-10">
			<div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
			  <span className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} Operix Solutions. جميع الحقوق محفوظة.</span>
			  <div className="flex items-center gap-4">
				<button onClick={() => setIsTermsOpen(true)} className="text-xs text-slate-500 hover:text-red-600 font-bold transition-colors">الشروط والأحكام وسياسة الخصوصية</button>
				<span className="text-xs text-slate-400 font-medium">نظام حصاد لإدارة المجتمعات السكنية</span>
			  </div>
			</div>
		  </div>
		</footer>

		{/* ── Quote modal ── */}
		{isModalOpen && (
		  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
			<div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
			<div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" style={{ animation: 'fadeUp .3s cubic-bezier(.16,1,.3,1) both' }}>
			  <div className="h-1 shimmer-bar" />
			  <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
				<div>
				  <h3 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-xl text-slate-900">طلب عرض سعر مخصص</h3>
				  {selectedPlan && (
					<div className="text-xs text-slate-500 font-bold mt-0.5">باقة {plans.find(p => p.key === selectedPlan)?.name}</div>
				  )}
				</div>
				<button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
				  <X size={18} />
				</button>
			  </div>
			  <form onSubmit={handleQuoteRequest} className="p-6 space-y-4">
				{[
				  { label: 'الاسم الكامل',      key: 'name',    type: 'text',  dir: 'rtl', mono: false },
				  { label: 'البريد الإلكتروني', key: 'email',   type: 'email', dir: 'ltr', mono: true  },
				].map(({ label, key, type, dir, mono }) => (
				  <div key={key}>
					<label className="block text-xs font-black text-slate-500 mb-1.5">{label}</label>
					<input
					  type={type} required dir={dir}
					  value={formData[key]}
					  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
					  style={mono ? { fontFamily: "'IBM Plex Mono', monospace" } : {}}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
					/>
				  </div>
				))}
				<div className="grid grid-cols-2 gap-3">
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">الدولة</label>
					<select
					  required
					  value={formData.country}
					  onChange={handleCountryChange}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all cursor-pointer"
					>
					  <option value="" disabled>اختر الدولة</option>
					  {countries.map(c => (
						<option key={c.code} value={c.code}>{c.name}</option>
					  ))}
					</select>
				  </div>
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">رقم الهاتف</label>
					<input
					  type="tel" required dir="ltr"
					  value={formData.phone}
					  onChange={e => setFormData({ ...formData, phone: e.target.value })}
					  placeholder="اختر الدولة أولاً"
					  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
					/>
				  </div>
				</div>
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
				  type="submit" disabled={isSubmitting}
				  className="w-full h-12 bg-red-600 text-white font-bold text-[15px] rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-60 flex justify-center items-center gap-2 mt-1"
				>
				  {isSubmitting ? <><Loader2 size={17} className="animate-spin" /> جاري الإرسال...</> : 'إرسال الطلب'}
				</button>
			  </form>
			</div>
		  </div>
		)}

		{/* ── Terms & Privacy Modal ── */}
		{isTermsOpen && (
		  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
			<div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsTermsOpen(false)} />
			<div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col" style={{ animation: 'fadeUp .3s cubic-bezier(.16,1,.3,1) both', maxHeight: '85vh' }}>
			  <div className="h-1 shimmer-bar shrink-0" />
			  <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100 shrink-0">
				<div className="flex items-center gap-3">
				  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
					<ShieldCheck size={16} className="text-white" />
				  </div>
				  <div>
					<h3 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-lg text-slate-900 leading-tight">الشروط والأحكام وسياسة الخصوصية</h3>
					<p className="text-xs text-slate-400 font-bold mt-0.5">نظام حصاد — من إنتاج Operix Solutions</p>
				  </div>
				</div>
				<button onClick={() => setIsTermsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all shrink-0">
				  <X size={18} />
				</button>
			  </div>
			  <div className="px-6 py-6 overflow-y-auto space-y-6">
				<div>
				  <div className="flex items-center gap-2 mb-2">
					<div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center shrink-0"><Building2 size={12} className="text-red-600" /></div>
					<h4 className="font-black text-slate-900 text-sm">المنتج والملكية</h4>
				  </div>
				  <p className="text-sm text-slate-600 leading-relaxed font-medium pr-8">
					نظام "حصاد" هو منتج برمجي مقدَّم من Operix Solutions لإدارة المجتمعات السكنية. جميع الحقوق البرمجية والفكرية المتعلقة بالنظام مملوكة لـ Operix Solutions، ويُمنح المشترك حق استخدام النظام وفق باقة الاشتراك المختارة فقط.
				  </p>
				</div>
				<div>
				  <div className="flex items-center gap-2 mb-2">
					<div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0"><AlertTriangleIcon /></div>
					<h4 className="font-black text-slate-900 text-sm">إخلاء المسؤولية عن الاستخدام</h4>
				  </div>
				  <p className="text-sm text-slate-600 leading-relaxed font-medium pr-8">
					لا تتحمّل Operix Solutions أي مسؤولية عن أي إساءة استخدام للنظام من قِبل المشترك أو مستخدميه، أو عن أي قرارات أو نتائج مترتبة على البيانات المُدخلة أو المُدارة عبر النظام. تقع مسؤولية صحة البيانات المُدخلة وطريقة استخدام صلاحيات الوصول بالكامل على عاتق الجهة المشتركة وإدارتها.
				  </p>
				</div>
				<div>
				  <div className="flex items-center gap-2 mb-2">
					<div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0"><ShieldCheck size={12} className="text-emerald-600" /></div>
					<h4 className="font-black text-slate-900 text-sm">حماية البيانات والتشفير</h4>
				  </div>
				  <p className="text-sm text-slate-600 leading-relaxed font-medium pr-8">
					تلتزم Operix Solutions بتشفير جميع البيانات المخزَّنة والمنقولة عبر النظام من جهتنا وفق أفضل الممارسات الأمنية المتاحة، حفاظاً على خصوصية السكان وسرية المعلومات الإدارية والمالية للمجتمع السكني.
				  </p>
				</div>
				<div>
				  <div className="flex items-center gap-2 mb-2">
					<div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0"><FileText size={12} className="text-blue-600" /></div>
					<h4 className="font-black text-slate-900 text-sm">استخدام البيانات</h4>
				  </div>
				  <p className="text-sm text-slate-600 leading-relaxed font-medium pr-8">
					تُستخدم البيانات المُدخلة في النظام حصراً لتقديم الخدمة للمجتمع السكني المشترك، ولا تُشارَك مع أي طرف ثالث دون موافقة صريحة، إلا في الحالات التي يقتضيها القانون أو حماية النظام من الاستخدام غير المشروع.
				  </p>
				</div>
				<div>
				  <div className="flex items-center gap-2 mb-2">
					<div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center shrink-0"><Mail size={12} className="text-violet-600" /></div>
					<h4 className="font-black text-slate-900 text-sm">التواصل بخصوص هذه السياسة</h4>
				  </div>
				  <p className="text-sm text-slate-600 leading-relaxed font-medium pr-8">
					لأي استفسار متعلق بالشروط والأحكام أو سياسة الخصوصية، يرجى التواصل عبر{' '}
					<a href="mailto:support@operix-solutions.com" style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-red-600 font-bold hover:underline" dir="ltr">support@operix-solutions.com</a>.
				  </p>
				</div>
				<div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
				  <Sparkles size={15} className="text-slate-400 shrink-0 mt-0.5" />
				  <p className="text-xs text-slate-500 font-medium leading-relaxed">
					باستخدامك لنظام حصاد، فإنك تُقرّ بموافقتك على هذه الشروط والأحكام وسياسة الخصوصية. قد يتم تحديث هذه السياسة من وقت لآخر، وسيتم إعلام المشتركين بأي تغييرات جوهرية.
				  </p>
				</div>
			  </div>
			  <div className="px-6 py-4 border-t border-slate-100 shrink-0">
				<button onClick={() => setIsTermsOpen(false)} className="w-full h-11 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">فهمت، إغلاق</button>
			  </div>
			</div>
		  </div>
		)}
	  </div>
	</>
  );
}

function AlertTriangleIcon() {
  return (
	<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
	  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
	  <path d="M12 9v4" />
	  <path d="M12 17h.01" />
	</svg>
  );
}