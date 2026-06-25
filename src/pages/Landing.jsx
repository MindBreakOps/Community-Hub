import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ArrowLeft, Mail, Globe, LifeBuoy, 
  LayoutDashboard, Map, CreditCard, FileText,
  ChevronLeft, BarChart3, Users, ShieldCheck,
  X, Loader2
} from 'lucide-react';

const OPS_API = 'https://script.google.com/macros/s/AKfycby7xDEoYBzGM7sAAAkX0LDTKNHo63LjbgmaC-0VLXESPFj7BSl10GE-sIqM-Ss3wE8/exec';
const TARGET_EMAIL = 'info@operix-solutions.com';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', size: '1-50' });

  const handleDemoRequest = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	try {
	  const payload = {
		action: 'send_email',
		emailTo: TARGET_EMAIL,
		subject: `طلب تجربة/تواصل جديد: ${formData.company}`,
		body: `الاسم: ${formData.name}\nالبريد الإلكتروني: ${formData.email}\nالمجمع السكني/الجهة: ${formData.company}\nعدد الوحدات: ${formData.size}\n\nطلب الحصول على تجربة تفاعلية لنظام حصاد لإدارة المجتمعات السكنية.`
	  };
	  
	  await fetch(OPS_API, { 
		method: 'POST', 
		mode: 'no-cors', 
		headers: { 'Content-Type': 'text/plain' }, 
		body: JSON.stringify(payload) 
	  });
	  
	  alert("تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً.");
	  setIsModalOpen(false);
	  setFormData({ name: '', email: '', company: '', size: '1-50' });
	} catch (err) {
	  alert("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.");
	} finally {
	  setIsSubmitting(false);
	}
  };

  return (
	<div className="min-h-screen bg-[#F8FAFC] font-['Tajawal'] text-slate-900 flex flex-col" dir="rtl">
	  
	  {/* Navbar */}
	  <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
		<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
		  <div className="flex items-center gap-3">
			<div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
			  <Building2 className="text-white" size={22} />
			</div>
			<span className="text-2xl font-black tracking-tight text-slate-900">حصاد</span>
		  </div>
		  <div className="flex gap-8 items-center">
			<Link to="/subscriptions" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">الباقات والاشتراكات</Link>
			<Link to="/gate" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5">
			  تسجيل الدخول
			</Link>
		  </div>
		</div>
	  </nav>

	  {/* Hero Section */}
	  <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 text-center flex flex-col items-center">
		<div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
		  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
		  النظام المؤسسي لإدارة المجتمعات السكنية
		</div>
		
		<h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.15] text-slate-900 tracking-tight max-w-4xl">
		  إدارة رقمية متكاملة <br />
		  <span className="text-red-600">لمجتمعك السكني</span>
		</h1>
		
		<p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl leading-relaxed font-medium">
		  بنية تحتية برمجية متطورة توفر لوحات قياس ذكية، خرائط جغرافية (GIS)، وهويات رقمية لضمان أعلى معايير التنظيم والأمان.
		</p>
		
		<div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
		  <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 group">
			<span>طلب تجربة النظام</span>
			<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
		  </button>
		  <Link to="/subscriptions" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
			عرض الباقات والتسعير
		  </Link>
		</div>
	  </main>

	  {/* Interactive Simulator */}
	  <section className="w-full max-w-6xl mx-auto px-6 mb-32 relative z-10">
		<div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
		  
		  <div className="w-full md:w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-2 shrink-0">
			<div className="text-[11px] font-black text-slate-400 mb-4 tracking-widest uppercase">الواجهات التفاعلية</div>
			
			{[
			  { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة القيادة' },
			  { id: 'gis', icon: Map, label: 'الخريطة التفاعلية (GIS)' },
			  { id: 'eid', icon: CreditCard, label: 'الهوية الذكية (E-ID)' },
			  { id: 'certs', icon: FileText, label: 'إصدار الشهادات' }
			].map((tab) => (
			  <button 
				key={tab.id}
				onClick={() => setActiveTab(tab.id)} 
				className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
				  activeTab === tab.id 
					? 'bg-white shadow-sm border border-slate-200 text-red-600' 
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
				}`}
			  >
				<div className="flex items-center gap-3">
				  <tab.icon size={18} className={activeTab === tab.id ? 'text-red-500' : 'text-slate-400'} />
				  {tab.label}
				</div>
				{activeTab === tab.id && <ChevronLeft size={16} className="text-slate-300" />}
			  </button>
			))}
		  </div>

		  <div className="flex-1 bg-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
			{activeTab === 'dashboard' && (
			  <div className="w-full animate-[fadeIn_0.5s_ease-out]">
				<div className="flex items-center justify-between mb-8">
				  <div>
					<h3 className="text-2xl font-black text-slate-900">مؤشرات الأداء</h3>
					<p className="text-sm text-slate-500 mt-1">نظرة عامة على البيانات الحية للمجتمع</p>
				  </div>
				  <BarChart3 className="text-slate-200" size={48} />
				</div>
				<div className="grid grid-cols-2 gap-4 mb-6">
				  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
					<div className="flex items-center gap-2 text-sm text-slate-500 font-bold mb-3">
					  <Users size={16} className="text-blue-500"/> إجمالي السكان
					</div>
					<div className="text-4xl font-black font-['IBM_Plex_Mono'] text-slate-900 tracking-tight">1,240</div>
				  </div>
				  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
					<div className="flex items-center gap-2 text-sm text-slate-500 font-bold mb-3">
					  <Building2 size={16} className="text-emerald-500"/> نسبة الإشغال
					</div>
					<div className="text-4xl font-black font-['IBM_Plex_Mono'] text-slate-900 tracking-tight">85<span className="text-2xl text-slate-400">%</span></div>
				  </div>
				</div>
			  </div>
			)}

			{activeTab === 'gis' && (
			  <div className="w-full h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
				<div className="mb-6">
				  <h3 className="text-2xl font-black text-slate-900">الربط الجغرافي الدقيق</h3>
				  <p className="text-sm text-slate-500 mt-1">تتبع الوحدات السكنية والمرافق على الخريطة</p>
				</div>
				<div className="flex-1 w-full min-h-[250px] bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
				  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-transparent bg-[size:24px_24px]"></div>
				  <div className="relative flex flex-wrap gap-3 p-6 w-full h-full justify-center items-center">
					 {[...Array(8)].map((_,i) => (
					   <div key={i} className={`w-20 h-16 rounded-lg border-2 transition-all duration-1000 ${i===3 ? 'bg-red-50 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-white border-slate-200'}`}></div>
					 ))}
				  </div>
				</div>
			  </div>
			)}

			{activeTab === 'eid' && (
			  <div className="w-full h-full flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
				<div className="mb-10 text-center">
				   <h3 className="text-2xl font-black text-slate-900">هويات رقمية مشفرة</h3>
				   <p className="text-sm text-slate-500 mt-1">إصدار بطاقات ذكية لكل فرد في المجتمع</p>
				</div>
				<div className="w-full max-w-[380px] aspect-[85/54] bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col justify-between border border-slate-800 relative overflow-hidden group hover:scale-105 transition-transform duration-500">
				  <div className="absolute right-[-20%] top-[-20%] w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
				  <div className="flex justify-between items-start z-10">
					<div>
					  <div className="text-[10px] font-bold text-slate-400 mb-1">CITY RESIDENT</div>
					  <div className="font-black text-lg text-white">أحمد محمد عبدالله</div>
					</div>
					<div className="w-12 h-14 bg-slate-800 rounded-lg border border-slate-700"></div>
				  </div>
				  <div className="z-10 flex justify-between items-end">
					<div>
					  <div className="text-[10px] font-bold text-slate-400 mb-1">ID NUMBER</div>
					  <div className="font-['IBM_Plex_Mono'] text-white font-bold tracking-widest text-base">1234 5678 9012</div>
					</div>
					<ShieldCheck className="text-red-500 opacity-50" size={24} />
				  </div>
				</div>
			  </div>
			)}

			{activeTab === 'certs' && (
			  <div className="w-full h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
				<div className="mb-8">
				  <h3 className="text-2xl font-black text-slate-900">إصدار الوثائق</h3>
				  <p className="text-sm text-slate-500 mt-1">توليد وطباعة الشهادات المعتمدة بضغطة زر</p>
				</div>
				<div className="flex-1 bg-slate-50 p-8 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
				   <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
					  <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-2 border-red-600/20 flex items-center justify-center text-red-600/20 font-black text-xs -rotate-12">ختم</div>
					  <div className="h-4 w-1/3 bg-slate-200 rounded mb-6 mx-auto"></div>
					  <div className="h-2 w-full bg-slate-100 rounded mb-3"></div>
					  <div className="h-2 w-5/6 bg-slate-100 rounded mb-3"></div>
					  <div className="h-2 w-4/6 bg-slate-100 rounded mb-8"></div>
					  <div className="h-px w-full bg-slate-100 mb-4"></div>
					  <div className="flex justify-between items-center">
						 <div className="h-2 w-16 bg-slate-200 rounded"></div>
						 <div className="h-2 w-24 bg-slate-200 rounded"></div>
					  </div>
				   </div>
				</div>
			  </div>
			)}
		  </div>
		</div>
	  </section>

	  {/* Footer */}
	  <footer className="mt-auto border-t border-slate-200 bg-white">
		<div className="max-w-7xl mx-auto px-6 py-12">
		  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
			<div>
			  <h3 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">Operix Solutions</h3>
			  <p className="text-slate-500 text-sm mb-6 font-medium max-w-md">الشركة المطورة والمنفذة للأنظمة السحابية المتقدمة لإدارة الموارد البشرية والمجتمعات السكنية.</p>
			  <a href="https://www.operix-solutions.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-red-600 font-bold transition-colors">
				<Globe size={16} />
				www.operix-solutions.com
			  </a>
			</div>
			
			<div className="flex flex-col gap-4 md:items-end">
			  <a href="mailto:info@operix-solutions.com" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors font-medium">
				<span dir="ltr" className="text-sm font-['IBM_Plex_Mono']">info@operix-solutions.com</span>
				<Mail size={18} className="text-slate-400" />
			  </a>
			  <a href="mailto:support@operix-solutions.com" className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors font-medium">
				<span dir="ltr" className="text-sm font-['IBM_Plex_Mono']">support@operix-solutions.com</span>
				<LifeBuoy size={18} className="text-slate-400" />
			  </a>
			</div>
		  </div>
		</div>
	  </footer>

	  {/* Request Modal */}
	  {isModalOpen && (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" dir="rtl">
		  <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
			<div className="flex justify-between items-center p-6 border-b border-slate-100">
			  <h3 className="text-xl font-black text-slate-900">طلب تجربة النظام</h3>
			  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
			</div>
			<form onSubmit={handleDemoRequest} className="p-6 space-y-5">
			  <div className="flex flex-col gap-2">
				<label className="text-xs font-bold text-slate-500">الاسم الكامل</label>
				<input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
			  </div>
			  <div className="flex flex-col gap-2">
				<label className="text-xs font-bold text-slate-500">البريد الإلكتروني المؤسسي</label>
				<input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} dir="ltr" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-left font-['IBM_Plex_Mono']" />
			  </div>
			  <div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-2">
				  <label className="text-xs font-bold text-slate-500">اسم المجمع / الجهة</label>
				  <input type="text" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
				</div>
				<div className="flex flex-col gap-2">
				  <label className="text-xs font-bold text-slate-500">عدد الوحدات السكنية</label>
				  <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer">
					<option value="1-50">1 - 50</option>
					<option value="51-200">51 - 200</option>
					<option value="201-500">201 - 500</option>
					<option value="+500">+500</option>
				  </select>
				</div>
			  </div>
			  <button type="submit" disabled={isSubmitting} className="w-full h-12 mt-2 bg-red-600 text-white font-bold text-[15px] rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 flex justify-center items-center gap-2">
				{isSubmitting ? <><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</> : 'إرسال الطلب'}
			  </button>
			</form>
		  </div>
		</div>
	  )}

	  <style dangerouslySetInnerHTML={{__html: `
		@keyframes fadeIn {
		  from { opacity: 0; transform: translateY(10px); }
		  to { opacity: 1; transform: translateY(0); }
		}
	  `}} />
	</div>
  );
}