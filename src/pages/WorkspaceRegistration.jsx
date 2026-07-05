import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  UploadCloud, CheckCircle, ShieldCheck, LogOut, ArrowRight, 
  UserCheck, Star, AlertCircle, FileText, ShieldAlert,
  User, CreditCard, Phone, MapPin, Home as HomeIcon, Users,
  Briefcase, Activity, HeartPulse, PhoneCall, GraduationCap
} from 'lucide-react';

export default function WorkspaceRegistration() {
  const { workspaceSlug } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [session, setSession] = useState(null);
  const [record, setRecord] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [showStep2, setShowStep2] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Step 1: Core Data
  const [step1Data, setStep1Data] = useState({
	full_name: '', national_id: '', phone_number: '', profession: '',
	marital_status: 'أعزب', owned_properties_count: 0, location: 'شمال',
	house_number: '', housing_type: 'مالك', family_members_count: 1
  });

  // Step 2: Comprehensive Profile Data
  const [step2Data, setStep2Data] = useState({
	income_level: 'اخضر', special_issues: '', blood_type: '', chronic_diseases: '',
	allergies: '', emergency_contact_name: '', emergency_phone: '',
	academic_degree: '', company_name: '', cv_summary: ''
  });

  useEffect(() => {
	const init = async () => {
	  try {
		const { data: wsData, error: wsError } = await supabase
		  .from('workspaces')
		  .select('*')
		  .eq('slug', workspaceSlug)
		  .maybeSingle();

		if (wsError || !wsData) {
		  throw new Error('بوابة المجتمع غير موجودة.');
		}
		
		// 🛑 الحماية: إذا كانت البوابة مغلقة من الإعدادات
		if (wsData.is_registration_active === false) {
		  setWorkspace(wsData);
		  setError('registration_closed');
		  setLoading(false);
		  return; 
		}
		
		setWorkspace(wsData);

		const { data: { session: activeSession } } = await supabase.auth.getSession();
		if (activeSession) {
		  setSession(activeSession);
		  setStep1Data(prev => ({ ...prev, full_name: activeSession.user.user_metadata?.full_name || '' }));
		  await checkExistingRecord(activeSession.user.id, wsData.id);
		}
	  } catch (err) {
		setError(err.message);
	  } finally {
		setLoading(false);
	  }
	};

	init();
  }, [workspaceSlug]);

  const checkExistingRecord = async (userId, workspaceId) => {
	const { data } = await supabase
	  .from('residents')
	  .select('*')
	  .eq('created_by', userId)
	  .eq('workspace_id', workspaceId)
	  .maybeSingle();
	
	if (data) {
	  setRecord(data);
	  setStep2Data({
		income_level: data.income_level || 'اخضر',
		special_issues: data.special_issues || '',
		blood_type: data.blood_type || '',
		chronic_diseases: data.chronic_diseases || '',
		allergies: data.allergies || '',
		emergency_contact_name: data.emergency_contact_name || '',
		emergency_phone: data.emergency_phone || '',
		academic_degree: data.academic_degree || '',
		company_name: data.company_name || '',
		cv_summary: data.cv_summary || ''
	  });
	}
  };

  const handleGoogleLogin = async () => {
	await supabase.auth.signInWithOAuth({
	  provider: 'google',
	  options: { redirectTo: window.location.href }
	});
  };

  const handleSignOut = async () => {
	await supabase.auth.signOut();
	window.location.reload();
  };

  const handleImageChange = (e) => {
	const file = e.target.files[0];
	if (file) {
	  setImageFile(file);
	  setImagePreview(URL.createObjectURL(file));
	}
  };

  const submitStep1 = async (e) => {
	e.preventDefault();
	if (!imageFile) return alert('يرجى إرفاق صورة المستند');
	setSaving(true);
	
	try {
	  const fileName = `ID_${session.user.id}_${Date.now()}.jpg`;
	  const { error: upError } = await supabase.storage.from('citizen_ids').upload(fileName, imageFile);
	  if (upError) throw upError;
	  
	  const { data: urlData } = supabase.storage.from('citizen_ids').getPublicUrl(fileName);
	  
	  const { error } = await supabase.from('residents').insert([{
		...step1Data,
		id_image_url: urlData.publicUrl,
		status: 'pending',
		created_by: session.user.id,
		workspace_id: workspace.id
	  }]);
	  
	  if (error) throw error;
	  
	  await checkExistingRecord(session.user.id, workspace.id);
	  window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch (err) { 
	  alert('خطأ: ' + err.message); 
	} finally { 
	  setSaving(false); 
	}
  };

  const submitStep2 = async (e) => {
	e.preventDefault();
	setSaving(true);
	try {
	  const { error } = await supabase
		.from('residents')
		.update(step2Data)
		.eq('id', record.id);
	  
	  if (error) throw error;
	  await checkExistingRecord(session.user.id, workspace.id);
	  setShowStep2(false);
	  window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch (err) { 
	  alert('حدث خطأ: ' + err.message); 
	} finally { 
	  setSaving(false); 
	}
  };

  // ==========================================
  // شاشات التحميل، الأخطاء، وحالة إغلاق البوابة
  // ==========================================
  if (loading) {
	return (
	  <div className="min-h-screen flex items-center justify-center bg-slate-50">
		<div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-lg" />
	  </div>
	);
  }

  // 🛑 شاشة إغلاق البوابة
  if (error === 'registration_closed') {
	return (
	  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Tajawal']" dir="rtl">
		<div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
		  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
			<ShieldAlert size={40} className="text-slate-800" />
		  </div>
		  <h2 className="text-2xl font-black text-slate-900 mb-3">التسجيل مغلق حالياً</h2>
		  <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
			عذراً، باب التسجيل وتحديث البيانات لمجتمع <span className="text-orange-600 font-black">"{workspace?.name}"</span> مغلق حالياً من قبل الإدارة. يرجى المحاولة في وقت لاحق.
		  </p>
		  <button 
			onClick={() => window.location.href = '/'}
			className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
		  >
			<span>العودة للصفحة الرئيسية</span>
			<ArrowRight size={16} />
		  </button>
		</div>
	  </div>
	);
  }

  if (error) {
	return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-black text-lg px-4 text-center font-['Tajawal']">{error}</div>;
  }

  const isStep2Complete = record?.blood_type || record?.income_level;

  // ==========================================
  // الشاشة الرئيسية (تسجيل الدخول والنماذج)
  // ==========================================
  return (
	<div className="min-h-screen font-['Tajawal'] bg-slate-50 flex flex-col items-center p-4 md:p-6 pb-20 overflow-x-hidden" dir="rtl">
	  
	  {!session ? (
		// ------------------------------------------
		// شاشة الدخول (Authentication)
		// ------------------------------------------
		<div className="w-full max-w-[420px] mt-10 md:mt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
		  <div className="text-center mb-10">
			<div className="w-[120px] h-[120px] bg-white rounded-[32px] flex items-center justify-center shadow-xl mx-auto mb-8 border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
			  <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500 transition-all duration-500 group-hover:h-full group-hover:opacity-10" />
			  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-16 h-16 object-contain z-10" />
			</div>
			<h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">بوابة حصر السكان</h1>
			<p className="text-sm text-orange-600 font-bold tracking-wide bg-orange-50 inline-block px-4 py-1.5 rounded-full">{workspace?.name}</p>
		  </div>

		  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
			<div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />
			<div className="text-center mb-8">
			  <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center justify-center gap-2">
				<UserCheck className="text-orange-500" /> أهلاً بك يا جارنا العزيز!
			  </h2>
			  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
				تم إنشاء هذه البوابة لتسهيل تسجيل بياناتك بأمان وسرية تامة. بخطوة واحدة عبر حسابك، يمكنك توثيق سكنك واستخراج شهاداتك.
			  </p>
			</div>
			
			<button 
			  onClick={handleGoogleLogin} 
			  className="w-full flex justify-center items-center gap-3 bg-white border-2 border-slate-200 text-slate-800 font-black py-4 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
			>
			  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
			  <span>المتابعة باستخدام حساب Google</span>
			</button>
			
			<div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
			  <ShieldCheck className="w-4 h-4 text-orange-500" /> معلوماتك مشفرة ومحمية بالكامل
			</div>
		  </div>
		</div>
	  ) : (
		// ------------------------------------------
		// التطبيق بعد الدخول (Forms & Status)
		// ------------------------------------------
		<div className="w-full max-w-3xl mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
		  
		  {/* Header */}
		  <header className="flex justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 transition-all hover:shadow-md">
			<div className="flex items-center gap-4">
			  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-inner">
				{session.user.user_metadata?.full_name?.charAt(0) || 'م'}
			  </div>
			  <div>
				<h2 className="font-black text-base text-slate-900">{session.user.user_metadata?.full_name || 'مواطن كريم'}</h2>
				<p className="text-[11px] text-slate-500 font-bold font-['IBM_Plex_Mono'] mt-0.5">{session.user.email}</p>
			  </div>
			</div>
			<button onClick={handleSignOut} className="flex items-center gap-2 text-sm bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors">
			  <LogOut size={16} /> <span className="hidden sm:inline">خروج</span>
			</button>
		  </header>

		  {record ? (
			// ==========================================
			// الحالة: السجل موجود (مراجعة/اعتماد)
			// ==========================================
			<div className="space-y-6">
			  {record.status === 'approved' ? (
				<div className="bg-white border-2 border-orange-500 p-8 rounded-3xl text-center shadow-xl relative overflow-hidden">
				  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-10" />
				  <CheckCircle className="text-orange-500 w-16 h-16 mx-auto mb-4 relative z-10" />
				  <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">مرحباً بك مجدداً! ✨</h3>
				  <p className="text-sm text-slate-600 font-bold leading-relaxed relative z-10">
					بياناتك <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md mx-1">معتمدة رسمياً</span> في السجل المدني لإدارة {workspace?.name}.
				  </p>
				</div>
			  ) : record.status === 'rejected' ? (
				<div className="bg-white border-2 border-red-500 p-8 rounded-3xl text-center shadow-xl">
				  <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
				  <p className="text-sm text-slate-600 font-bold leading-relaxed">
					عذراً، تم <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md mx-1">رفض</span> طلبك من قبل اللجنة المختصة. يرجى مراجعة الإدارة.
				  </p>
				</div>
			  ) : (
				<div className="bg-white border-2 border-slate-800 p-8 rounded-3xl text-center shadow-xl relative overflow-hidden">
				  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl opacity-5 -mr-10 -mt-10" />
				  <UploadCloud className="text-slate-800 w-16 h-16 mx-auto mb-4 relative z-10" />
				  <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">تم استلام البيانات بنجاح 🎉</h3>
				  <p className="text-sm text-slate-600 font-bold leading-relaxed relative z-10">
					طلبك الآن <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md mx-1 border border-slate-200">قيد المراجعة</span> من قبل لجنة الإدارة.
				  </p>
				</div>
			  )}

			  {/* تحفيز الخطوة الثانية */}
			  {isStep2Complete && !showStep2 ? (
				<div className="bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-sm flex flex-col items-center group hover:shadow-md transition-all">
				  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
					<Star className="text-orange-500 w-8 h-8" />
				  </div>
				  <span className="font-black text-slate-900 text-lg block mb-2">ملفك الشامل مكتمل بنسبة 100% 🌟</span>
				  <span className="text-sm text-slate-500 font-bold leading-relaxed mb-6">شكراً لتعاونك، جميع بياناتك الأساسية والصحية والمهنية موثقة لدينا في قاعدة البيانات الموحدة.</span>
				  <button onClick={() => setShowStep2(true)} className="text-sm font-black text-orange-600 hover:text-orange-700 bg-orange-50 px-6 py-2.5 rounded-xl transition-colors">تعديل أو تحديث الملف الشامل</button>
				</div>
			  ) : !showStep2 ? (
				<div className="bg-slate-900 p-8 rounded-3xl text-center shadow-xl relative overflow-hidden">
				  <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />
				  <h4 className="font-black text-2xl text-white mb-4">هل ترغب في استكمال ملفك الشامل؟ 🌟</h4>
				  <p className="text-sm text-slate-300 mb-8 font-bold leading-relaxed max-w-lg mx-auto">
					بينما طلبك قيد المراجعة، يمكنك إضافة بياناتك الصحية (فصيلة الدم، الحساسية) والمهنية. هذا يساعد اللجان المختصة في تقديم الدعم والخدمات لك بشكل أسرع وأكثر دقة.
				  </p>
				  <button onClick={() => setShowStep2(true)} className="w-full sm:w-auto bg-orange-500 text-white font-black text-base px-8 py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-orange-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto">
					نعم، استكمال البيانات الآن <ArrowRight size={20} />
				  </button>
				</div>
			  ) : null}

			  {/* ==========================================
				  نموذج الخطوة 2 (البيانات الإضافية)
				  ========================================== */}
			  {showStep2 && (
				<form onSubmit={submitStep2} className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-500">
				  <div className="text-center mb-10">
					<div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
					  <Star className="text-orange-500 w-7 h-7" />
					</div>
					<h3 className="font-black text-2xl text-slate-900 mb-2">الملف الشامل (الخطوة 2 - اختياري)</h3>
					<p className="text-sm text-slate-500 font-bold">تطابق هذه الحقول قاعدة البيانات الإدارية للجنة الحي. تعبئتها يساعد في تسهيل الخدمات الموجهة لك.</p>
				  </div>

				  <div className="mb-10">
					<div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
					  <Activity className="text-orange-500" size={20} />
					  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">البيانات الاقتصادية والاجتماعية</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					  <div>
						<label className="block text-sm font-bold text-slate-700 mb-2">مستوى الدخل المادي للأسرة</label>
						<select value={step2Data.income_level} onChange={e=>setStep2Data({...step2Data, income_level: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700">
						  <option value="اخضر">مستقر (أخضر)</option><option value="اصفر">متوسط / متذبذب (أصفر)</option><option value="احمر">ضعيف / يحتاج دعم (أحمر)</option>
						</select>
					  </div>
					  <div>
						<label className="block text-sm font-bold text-slate-700 mb-2">حالات خاصة / احتياجات</label>
						<input type="text" value={step2Data.special_issues} onChange={e=>setStep2Data({...step2Data, special_issues: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="كبار سن، ذوي همم..." />
					  </div>
					</div>
				  </div>

				  <div className="mb-10">
					<div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
					  <HeartPulse className="text-orange-500" size={20} />
					  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">السجل الصحي والطوارئ</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					  <div>
						<label className="block text-sm font-bold text-slate-700 mb-2">فصيلة الدم</label>
						<select value={step2Data.blood_type} onChange={e=>setStep2Data({...step2Data, blood_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold text-slate-700">
						  <option value="">غير محدد</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
						</select>
					  </div>
					  <div><label className="block text-sm font-bold text-slate-700 mb-2">الأمراض المزمنة (إن وجدت)</label><input type="text" value={step2Data.chronic_diseases} onChange={e=>setStep2Data({...step2Data, chronic_diseases: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="سكري، ضغط، ربو..." /></div>
					  <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">حساسية ضد أدوية</label><input type="text" value={step2Data.allergies} onChange={e=>setStep2Data({...step2Data, allergies: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="بنسلين، مسكنات..." /></div>
					  <div>
						<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><User size={16} className="text-slate-400"/> شخص الطوارئ</label>
						<input type="text" value={step2Data.emergency_contact_name} onChange={e=>setStep2Data({...step2Data, emergency_contact_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="شخص يتم الاتصال به" />
					  </div>
					  <div>
						<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><PhoneCall size={16} className="text-slate-400"/> هاتف الطوارئ</label>
						<input type="text" value={step2Data.emergency_phone} onChange={e=>setStep2Data({...step2Data, emergency_phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] text-left tracking-wider" dir="ltr" placeholder="0900000000" />
					  </div>
					</div>
				  </div>

				  <div className="mb-10">
					<div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
					  <GraduationCap className="text-orange-500" size={20} />
					  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">السيرة المهنية</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					  <div><label className="block text-sm font-bold text-slate-700 mb-2">المؤهل الأكاديمي</label><input type="text" value={step2Data.academic_degree} onChange={e=>setStep2Data({...step2Data, academic_degree: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="بكالوريوس، ماجستير..." /></div>
					  <div><label className="block text-sm font-bold text-slate-700 mb-2">جهة العمل الحالية</label><input type="text" value={step2Data.company_name} onChange={e=>setStep2Data({...step2Data, company_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="اسم الشركة أو المؤسسة" /></div>
					  <div className="md:col-span-2"><label className="block text-sm font-bold text-slate-700 mb-2">ملخص الخبرات / السيرة الذاتية (CV)</label><textarea rows="4" value={step2Data.cv_summary} onChange={e=>setStep2Data({...step2Data, cv_summary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold resize-none" placeholder="اكتب نبذة مختصرة عن خبراتك ومجال عملك..." /></div>
					</div>
				  </div>

				  <div className="flex flex-col sm:flex-row gap-4">
					<button type="submit" disabled={saving} className="flex-1 bg-slate-900 text-white font-black text-base py-4 rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50">
					  {saving ? 'جاري الحفظ...' : 'حفظ البيانات وتحديث الملف الشامل'}
					</button>
					{isStep2Complete && (
					  <button type="button" onClick={() => setShowStep2(false)} className="px-8 bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all duration-300">إلغاء والعودة</button>
					)}
				  </div>
				</form>
			  )}
			</div>
		  ) : (
			// ==========================================
			// نموذج الخطوة 1 (التسجيل الأساسي)
			// ==========================================
			<form onSubmit={submitStep1} className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
			  <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />
			  
			  <div className="text-center mb-10">
				<h3 className="font-black text-2xl text-slate-900 mb-2">استمارة الحصر السكني (الخطوة 1)</h3>
				<p className="text-sm text-slate-500 font-bold">الرجاء إدخال بياناتك الأساسية بدقة لضمان حقوقك في الخدمات المتاحة.</p>
			  </div>

			  <div className="mb-10">
				<div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
				  <User className="text-orange-500" size={20} />
				  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">البيانات الشخصية</h4>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">الاسم الرباعي <span className="text-orange-500">*</span></label>
					<input type="text" required value={step1Data.full_name} onChange={e=>setStep1Data({...step1Data, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-900" placeholder="كما في البطاقة القومية" />
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><CreditCard size={16} className="text-slate-400"/> الرقم الوطني <span className="text-orange-500">*</span></label>
					<input type="text" required value={step1Data.national_id} onChange={e=>setStep1Data({...step1Data, national_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold text-slate-900 tracking-widest text-left" dir="ltr" placeholder="11-digit-number" />
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Phone size={16} className="text-slate-400"/> رقم الهاتف النشط <span className="text-orange-500">*</span></label>
					<input type="text" required value={step1Data.phone_number} onChange={e=>setStep1Data({...step1Data, phone_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold text-slate-900 tracking-wider text-left" dir="ltr" placeholder="0900000000" />
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400"/> المهنة الحالية (اختياري)</label>
					<input type="text" value={step1Data.profession} onChange={e=>setStep1Data({...step1Data, profession: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" placeholder="طبيب، مهندس، أعمال حرة..." />
				  </div>
				</div>
			  </div>

			  <div className="mb-10">
				<div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 mb-6">
				  <HomeIcon className="text-orange-500" size={20} />
				  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">البيانات السكنية</h4>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2">الحالة الاجتماعية <span className="text-orange-500">*</span></label>
					<select value={step1Data.marital_status} onChange={e=>setStep1Data({...step1Data, marital_status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700">
					  <option value="اعزب">أعزب / عزباء</option><option value="متزوج">متزوج / متزوجة</option><option value="ارملة">أرمل / أرملة</option><option value="مطلقة">مطلق / مطلقة</option>
					</select>
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Building2 size={16} className="text-slate-400"/> عدد العقارات بالمنطقة <span className="text-orange-500">*</span></label>
					<input type="number" min="0" required value={step1Data.owned_properties_count} onChange={e=>setStep1Data({...step1Data, owned_properties_count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold" />
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> المنطقة الجغرافية <span className="text-orange-500">*</span></label>
					<select value={step1Data.location} onChange={e=>setStep1Data({...step1Data, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700">
					  <option value="شمال">شمال المنطقة</option><option value="وسط">وسط المنطقة</option><option value="جنوب">جنوب المنطقة</option>
					</select>
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2">رقم القطعة <span className="text-orange-500">*</span></label>
					<input type="text" required value={step1Data.house_number} onChange={e=>setStep1Data({...step1Data, house_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold tracking-wider" placeholder="مثال: 145" />
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2">صفة السكن <span className="text-orange-500">*</span></label>
					<select value={step1Data.housing_type} onChange={e=>setStep1Data({...step1Data, housing_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700">
					  <option value="مالك">مالك للمنزل</option><option value="مستأجر">مستأجر</option><option value="مؤقت">سكن مؤقت (ضيافة)</option>
					</select>
				  </div>
				  <div>
					<label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Users size={16} className="text-slate-400"/> أفراد الأسرة المقيمين <span className="text-orange-500">*</span></label>
					<input type="number" min="1" required value={step1Data.family_members_count} onChange={e=>setStep1Data({...step1Data, family_members_count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] font-bold" />
				  </div>
				</div>
			  </div>

			  <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group transition-all duration-300 hover:shadow-md hover:border-orange-200">
				<label className="block text-base font-black text-slate-900 mb-2 flex items-center gap-2">
				  <FileText className="text-orange-500" size={20} /> مستند إثبات السكن <span className="text-orange-500">*</span>
				</label>
				<p className="text-sm text-slate-500 font-bold mb-6">يرجى إرفاق صورة واضحة للبطاقة القومية، الجواز، أو رخصة القيادة لإثبات الهوية.</p>
				<div className="relative w-full h-44 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white group-hover:border-orange-500 transition-colors overflow-hidden">
				  <input type="file" accept="image/*" required onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
				  {!imagePreview ? (
					<div className="text-center text-slate-400 group-hover:text-orange-500 transition-colors">
					  <UploadCloud size={40} className="mx-auto mb-3" />
					  <span className="text-sm font-black">اضغط لالتقاط أو اختيار صورة من جهازك</span>
					</div>
				  ) : (
					<>
					  <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40 mix-blend-multiply z-0" alt="Preview" />
					  <div className="absolute z-10 bg-slate-900/90 text-white text-sm px-5 py-2.5 rounded-full font-black shadow-lg flex items-center gap-2">
						<CheckCircle size={18} className="text-orange-400" /> تم إرفاق المستند بنجاح
					  </div>
					</>
				  )}
				</div>
			  </div>

			  <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white font-black text-lg py-4 rounded-xl mt-10 shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3">
				{saving ? (
				  <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري الإرسال...</span>
				) : (
				  <>إرسال البيانات واعتماد الطلب <ArrowRight size={20} /></>
				)}
			  </button>
			</form>
		  )}
		</div>
	  )}
	</div>
  );
}