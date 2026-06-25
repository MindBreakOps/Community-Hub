import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Building2, ShieldCheck, Zap, X, Loader2 } from 'lucide-react';

const OPS_API = 'https://script.google.com/macros/s/AKfycby7xDEoYBzGM7sAAAkX0LDTKNHo63LjbgmaC-0VLXESPFj7BSl10GE-sIqM-Ss3wE8/exec';
const TARGET_EMAIL = 'info@operix-solutions.com';

export default function Subscription() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', size: '1-50' });

  const handleQuoteRequest = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	try {
	  const payload = {
		action: 'send_email',
		emailTo: TARGET_EMAIL,
		subject: `طلب عرض سعر جديد: ${formData.company}`,
		body: `الاسم: ${formData.name}\nالبريد الإلكتروني: ${formData.email}\nالمجمع السكني/الجهة: ${formData.company}\nعدد الوحدات: ${formData.size}\n\nطلب الحصول على عرض سعر/تواصل بخصوص باقات نظام حصاد للمجتمعات السكنية.`
	  };
	  
	  await fetch(OPS_API, { 
		method: 'POST', 
		mode: 'no-cors', 
		headers: { 'Content-Type': 'text/plain' }, 
		body: JSON.stringify(payload) 
	  });
	  
	  alert("تم إرسال طلبك بنجاح! سيتواصل معك فريق المبيعات قريباً.");
	  setIsModalOpen(false);
	  setFormData({ name: '', email: '', company: '', size: '1-50' });
	} catch (err) {
	  alert("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.");
	} finally {
	  setIsSubmitting(false);
	}
  };

  const plans = [
	{
	  name: 'الأساسية',
	  desc: 'مثالية للمجمعات السكنية واللجان الصغيرة',
	  price: 'تواصل معنا',
	  icon: <Building2 size={24} className="text-slate-400" />,
	  features: ['قاعدة بيانات السكان الأساسية', 'نظام إدارة لجنة الحي', 'لوحة تحكم المشرف', 'دعم عبر البريد الإلكتروني'],
	  popular: false
	},
	{
	  name: 'الاحترافية',
	  desc: 'النظام المتكامل لإدارة المجتمعات السكنية المتنامية',
	  price: 'تواصل معنا',
	  icon: <Zap size={24} className="text-red-500" />,
	  features: ['عدد غير محدود من السجلات', 'الخريطة التفاعلية (GIS)', 'إصدار الهويات الذكية (E-ID)', 'طباعة الشهادات المعتمدة', 'تقارير وتحليلات متقدمة', 'دعم فني مخصص'],
	  popular: true
	},
	{
	  name: 'المؤسسات',
	  desc: 'حلول مخصصة للجهات الحكومية والشركات العقارية',
	  price: 'مخصصة',
	  icon: <ShieldCheck size={24} className="text-slate-600" />,
	  features: ['تخصيص كامل للنظام (White-label)', 'ربط مع أنظمة السجل المدني (API)', 'استضافة سحابية خاصة', 'مدير حساب مخصص'],
	  popular: false
	}
  ];

  return (
	<div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-slate-50 font-['Tajawal'] text-slate-900 pb-24" dir="rtl">
	  
	  {/* Header */}
	  <div className="pt-12 pb-24 px-6 bg-white border-b border-slate-200 relative overflow-hidden">
		<div className="absolute inset-0 bg-gradient-to-b from-red-50 to-transparent opacity-50 pointer-events-none"></div>
		<div className="max-w-7xl mx-auto relative z-10">
		  <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-12 transition-colors">
			<ArrowRight size={20} />
			<span className="font-bold">العودة للرئيسية</span>
		  </Link>
		  
		  <div className="text-center max-w-3xl mx-auto">
			<h1 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">باقات الاشتراك في نظام حصاد</h1>
			<p className="text-lg text-slate-600 leading-relaxed font-medium">
			  اختر الباقة التي تناسب حجم مجتمعك السكني أو مؤسستك. جميع باقاتنا مدعومة ومطورة بواسطة Operix Solutions لضمان أعلى مستويات الموثوقية.
			</p>
		  </div>
		</div>
	  </div>

	  {/* Pricing Cards */}
	  <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
		  {plans.map((plan, idx) => (
			<div key={idx} className={`relative bg-white rounded-2xl p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${plan.popular ? 'border-2 border-red-500 shadow-xl shadow-red-500/10 md:-translate-y-4 hover:md:-translate-y-5' : 'border border-slate-200 shadow-sm'}`}>
			  {plan.popular && (
				<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-wide shadow-md whitespace-nowrap">
				  النظام المتكامل (الأكثر طلباً)
				</div>
			  )}
			  
			  <div className="mb-4">{plan.icon}</div>
			  <h3 className="text-2xl font-black mb-2 text-slate-900">{plan.name}</h3>
			  <p className="text-sm text-slate-500 mb-6 min-h-[40px] font-medium">{plan.desc}</p>
			  <div className="text-3xl font-bold mb-8 text-slate-900">{plan.price}</div>
			  
			  <ul className="space-y-4 mb-10 flex-1">
				{plan.features.map((feature, i) => (
				  <li key={i} className="flex items-start gap-3">
					<Check size={18} className="text-emerald-500 shrink-0 mt-0.5 font-bold" />
					<span className="text-sm text-slate-700 font-bold">{feature}</span>
				  </li>
				))}
			  </ul>

			  <button 
				onClick={() => setIsModalOpen(true)}
				className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.popular ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
			  >
				طلب عرض سعر
			  </button>
			</div>
		  ))}
		</div>

		{/* Contact Info Footer */}
		<div className="mt-20 text-center bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
		  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
			 <Building2 size={32} />
		  </div>
		  <h4 className="text-2xl font-black mb-3 text-slate-900">هل تحتاج إلى استشارة متخصصة؟</h4>
		  <p className="text-slate-600 mb-8 font-medium max-w-xl mx-auto">فريق المبيعات التقني لدينا جاهز لدراسة متطلبات لجان الأحياء والمجمعات السكنية وتقديم الحلول التقنية المناسبة.</p>
		  <a href="mailto:subscriptions@operix-solutions.com" className="inline-flex text-xl font-['IBM_Plex_Mono'] font-bold tracking-wide text-red-600 hover:text-red-700 transition-colors" dir="ltr">
			subscriptions@operix-solutions.com
		  </a>
		</div>
	  </div>

	  {/* Quote Request Modal */}
	  {isModalOpen && (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
		  <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
			<div className="flex justify-between items-center p-6 border-b border-slate-100">
			  <h3 className="text-xl font-black text-slate-900">طلب عرض سعر مخصص</h3>
			  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
			</div>
			<form onSubmit={handleQuoteRequest} className="p-6 space-y-5">
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