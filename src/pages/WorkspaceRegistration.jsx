import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, CheckCircle, ShieldCheck, LogOut, ArrowRight, UserCheck, Star } from 'lucide-react';

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

  // Form States
  const [step1Data, setStep1Data] = useState({
	full_name: '', national_id: '', phone_number: '', profession: '',
	marital_status: 'اعزب', owned_properties_count: 0, location: 'شمال',
	house_number: '', housing_type: 'مالك', family_members_count: 1
  });

  const [step2Data, setStep2Data] = useState({
	income_level: 'اخضر', special_issues: '', blood_type: '', chronic_diseases: '',
	allergies: '', emergency_contact_name: '', emergency_phone: '',
	academic_degree: '', company_name: '', cv_summary: ''
  });

  // 1. Initialization: Fetch Workspace & Session
  useEffect(() => {
	const init = async () => {
	  try {
		// Fetch Workspace
		const { data: wsData, error: wsError } = await supabase
		  .from('workspaces')
		  .select('*')
		  .eq('slug', workspaceSlug)
		  .maybeSingle();

		if (wsError || !wsData) throw new Error('بوابة المجتمع غير موجودة.');
		setWorkspace(wsData);

		// Fetch Session
		const { data: { session: activeSession } } = await supabase.auth.getSession();
		if (activeSession) {
		  setSession(activeSession);
		  if (activeSession.user.user_metadata?.full_name) {
			setStep1Data(prev => ({ ...prev, full_name: activeSession.user.user_metadata.full_name }));
		  }
		  await checkExistingRecord(activeSession.user.id, wsData.id);
		}
	  } catch (err) {
		setError(err.message);
	  } finally {
		setLoading(false);
	  }
	};

	init();

	const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
	  setSession(currentSession);
	  if (currentSession && workspace) {
		await checkExistingRecord(currentSession.user.id, workspace.id);
	  } else {
		setRecord(null);
	  }
	});

	return () => authListener.subscription.unsubscribe();
  }, [workspaceSlug]);

  const checkExistingRecord = async (userId, workspaceId) => {
	const { data } = await supabase
	  .from('residents')
	  .select('*')
	  .eq('created_by', userId)
	  .eq('workspace_id', workspaceId)
	  .maybeSingle();
	
	if (data) setRecord(data);
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

  const uploadImage = async (file, userId) => {
	const fileName = `ID_${userId}_${Date.now()}.jpg`;
	const { error } = await supabase.storage
	  .from('citizen_ids')
	  .upload(fileName, file, { contentType: file.type });
	if (error) throw error;
	const { data } = supabase.storage.from('citizen_ids').getPublicUrl(fileName);
	return data.publicUrl;
  };

  // 2. Submit Step 1
  const submitStep1 = async (e) => {
	e.preventDefault();
	setSaving(true);
	try {
	  let uploadedUrl = null;
	  if (imageFile) {
		uploadedUrl = await uploadImage(imageFile, session.user.id);
	  }

	  const payload = {
		...step1Data,
		id_image_url: uploadedUrl,
		status: 'pending',
		created_by: session.user.id,
		workspace_id: workspace.id
	  };

	  const { error } = await supabase.from('residents').insert([payload]);
	  if (error) throw error;
	  
	  await checkExistingRecord(session.user.id, workspace.id);
	} catch (err) {
	  alert('حدث خطأ أثناء الإرسال: ' + err.message);
	} finally {
	  setSaving(false);
	}
  };

  // 3. Submit Step 2
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
	} catch (err) {
	  alert('حدث خطأ: ' + err.message);
	} finally {
	  setSaving(false);
	}
  };

  if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="fixed inset-0 flex items-center justify-center bg-slate-50 text-red-600 font-bold font-['Tajawal']">{error}</div>;

  const isStep2Complete = record?.blood_type || record?.income_level;

  return (
	<div 
	  className="min-h-screen bg-slate-50 font-['Tajawal'] bg-cover bg-center bg-fixed flex flex-col items-center p-4" 
	  dir="rtl"
	  style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.95)), url('https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/IMG_1104.jpg')` }}
	>
	  {!session ? (
		// AUTHENTICATION SCREEN
		<div className="w-full max-w-[400px] mt-16">
		  <div className="text-center mb-8">
			<div className="w-[110px] h-[110px] bg-white rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6 border border-slate-100 relative overflow-hidden">
			  <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
			  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-16 h-16 object-contain" />
			</div>
			<h1 className="text-[28px] font-black text-slate-800 tracking-tight leading-tight">بوابة حصر السكان</h1>
			<p className="text-sm text-red-600 font-bold mt-1 tracking-wide">{workspace?.name}</p>
		  </div>

		  <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
			<div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />
			<div className="text-center mb-8">
			  <h2 className="text-xl font-black text-slate-800 mb-3 flex items-center justify-center gap-2">
				<UserCheck className="text-emerald-500" /> أهلاً بك يا جارنا العزيز!
			  </h2>
			  <p className="text-[13.5px] text-slate-500 font-bold leading-relaxed">
				تم إنشاء هذه البوابة لتسهيل تسجيل بياناتك بأمان وسرية تامة. بخطوة واحدة عبر حسابك، يمكنك توثيق سكنك واستخراج شهاداتك.
			  </p>
			</div>
			
			<button 
			  onClick={handleGoogleLogin} 
			  className="w-full flex justify-center items-center gap-3 bg-white border-2 border-slate-200 text-slate-800 font-extrabold py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
			>
			  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
			  <span>المتابعة باستخدام حساب Google</span>
			</button>
			
			<div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
			  <ShieldCheck className="w-4 h-4 text-emerald-500" />
			  معلوماتك مشفرة ومحمية بالكامل
			</div>
		  </div>
		</div>
	  ) : (
		// LOGGED IN SCREEN
		<div className="w-full max-w-2xl mt-4 animate-in fade-in duration-500">
		  
		  <header className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
			<div className="flex items-center gap-3">
			  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-inner">
				{session.user.user_metadata?.full_name?.charAt(0) || 'م'}
			  </div>
			  <div>
				<h2 className="font-black text-sm text-slate-800">{session.user.user_metadata?.full_name || 'مواطن كريم'}</h2>
				<p className="text-[10px] text-slate-500 font-bold font-['IBM_Plex_Mono']">{session.user.email}</p>
			  </div>
			</div>
			<button onClick={handleSignOut} className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 transition">
			  <LogOut size={14} /> خروج
			</button>
		  </header>

		  {record ? (
			// EXISTING RECORD FLOW
			<div>
			  {record.status === 'approved' ? (
				<div className="bg-emerald-50/95 backdrop-blur-sm border border-emerald-200 p-6 rounded-xl mb-6 text-center shadow-sm">
				  <CheckCircle className="text-emerald-500 w-10 h-10 mx-auto mb-3" />
				  <p className="text-sm text-emerald-800 font-bold leading-relaxed">
					مرحباً بك مجدداً! بياناتك <span className="bg-emerald-200 px-2 py-0.5 rounded text-emerald-900 mx-1">معتمدة رسمياً</span> في السجل المدني لإدارة {workspace?.name}.
				  </p>
				</div>
			  ) : (
				<div className="bg-blue-50/95 backdrop-blur-sm border border-blue-200 p-6 rounded-xl mb-6 text-center shadow-sm">
				  <UploadCloud className="text-blue-500 w-10 h-10 mx-auto mb-3" />
				  <p className="text-sm text-blue-800 font-bold leading-relaxed">
					تم استلام بياناتك بنجاح! طلبك الآن <span className="bg-blue-200 px-2 py-0.5 rounded text-blue-900 mx-1">قيد المراجعة</span> من قبل الإدارة.
				  </p>
				</div>
			  )}

			  {isStep2Complete && !showStep2 ? (
				<div className="bg-slate-50/90 backdrop-blur-sm border border-slate-200 p-5 rounded-xl mb-6 text-center shadow-sm flex flex-col items-center">
				  <Star className="text-amber-500 w-8 h-8 mb-2" />
				  <span className="font-black text-slate-800 text-sm block">ملفك الشامل مكتمل بنسبة 100%</span>
				  <span className="text-[12px] text-slate-500 font-bold mt-1">شكراً لتعاونك، جميع بياناتك الأساسية والصحية والمهنية موثقة لدينا.</span>
				</div>
			  ) : !showStep2 ? (
				<div className="bg-white/95 backdrop-blur-md p-8 border border-blue-200 rounded-xl mb-6 text-center shadow-md border-t-4 border-t-blue-500">
				  <h4 className="font-black text-[20px] text-slate-800 mb-3">هل ترغب في استكمال ملفك الشامل؟</h4>
				  <p className="text-[13px] text-slate-600 mb-6 font-bold leading-relaxed">
					يمكنك إضافة بياناتك الصحية والمهنية للمساعدة في تقديم الدعم والخدمات لك بشكل أسرع.
				  </p>
				  <button onClick={() => setShowStep2(true)} className="bg-blue-600 text-white font-extrabold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-all w-full flex items-center justify-center gap-2">
					نعم، استكمال البيانات <ArrowRight size={16} />
				  </button>
				</div>
			  ) : null}
			</div>
		  ) : (
			// NEW RECORD FLOW (STEP 1)
			<form onSubmit={submitStep1} className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 mb-8">
			  <div className="text-center mb-8">
				<h3 className="font-black text-[22px] text-slate-800">استمارة الحصر السكني</h3>
				<p className="text-xs text-slate-500 font-bold mt-1.5">الرجاء إدخال بياناتك بدقة لضمان حقوقك في الخدمات</p>
			  </div>

			  <div className="border-b-2 border-slate-100 pb-2 mb-4"><h4 className="font-black text-xs text-red-600 uppercase tracking-wider">البيانات الشخصية</h4></div>
			  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
				<div><label className="block text-xs font-bold text-slate-600 mb-2">الاسم الرباعي *</label><input type="text" required value={step1Data.full_name} onChange={e=>setStep1Data({...step1Data, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">الرقم الوطني *</label><input type="text" required value={step1Data.national_id} onChange={e=>setStep1Data({...step1Data, national_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500 font-['IBM_Plex_Mono'] text-left" dir="ltr" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">رقم الهاتف النشط *</label><input type="text" required value={step1Data.phone_number} onChange={e=>setStep1Data({...step1Data, phone_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500 font-['IBM_Plex_Mono'] text-left" dir="ltr" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">المهنة الحالية (اختياري)</label><input type="text" value={step1Data.profession} onChange={e=>setStep1Data({...step1Data, profession: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500" /></div>
			  </div>

			  <div className="border-b-2 border-slate-100 pb-2 mb-4"><h4 className="font-black text-xs text-red-600 uppercase tracking-wider">البيانات السكنية</h4></div>
			  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div><label className="block text-xs font-bold text-slate-600 mb-2">الحالة الاجتماعية *</label><select value={step1Data.marital_status} onChange={e=>setStep1Data({...step1Data, marital_status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500"><option>أعزب</option><option>متزوج</option><option>أرمل</option><option>مطلق</option></select></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">عدد العقارات المملوكة *</label><input type="number" min="0" required value={step1Data.owned_properties_count} onChange={e=>setStep1Data({...step1Data, owned_properties_count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500 font-['IBM_Plex_Mono']" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">المنطقة الجغرافية *</label><select value={step1Data.location} onChange={e=>setStep1Data({...step1Data, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500"><option>شمال</option><option>وسط</option><option>جنوب</option></select></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">رقم القطعة *</label><input type="text" required value={step1Data.house_number} onChange={e=>setStep1Data({...step1Data, house_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500 font-['IBM_Plex_Mono']" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">صفة السكن *</label><select value={step1Data.housing_type} onChange={e=>setStep1Data({...step1Data, housing_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500"><option>مالك</option><option>مستأجر</option><option>سكن مؤقت</option></select></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">أفراد الأسرة المقيمين *</label><input type="number" min="1" required value={step1Data.family_members_count} onChange={e=>setStep1Data({...step1Data, family_members_count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-red-500 font-['IBM_Plex_Mono']" /></div>
			  </div>

			  <div className="mt-8 bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden group">
				<label className="block text-sm font-black text-slate-800 mb-1">مستند إثبات السكن (صورة) *</label>
				<p className="text-xs text-slate-500 font-bold mb-4">يرجى إرفاق صورة واضحة للبطاقة القومية، الجواز، أو رخصة قيادة.</p>
				<div className="relative w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white group-hover:border-red-500 transition-colors">
				  <input type="file" accept="image/*" required onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
				  {!imagePreview ? (
					<div className="text-center text-slate-400">
					  <UploadCloud size={32} className="mx-auto mb-2" />
					  <span className="text-xs font-bold">اضغط لالتقاط أو اختيار صورة</span>
					</div>
				  ) : (
					<>
					  <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30 mix-blend-multiply z-0" alt="Preview" />
					  <div className="absolute z-10 bg-slate-900/90 text-emerald-400 text-xs px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-1.5"><CheckCircle size={14}/> تم إرفاق المستند</div>
					</>
				  )}
				</div>
			  </div>

			  <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-lg py-4 rounded-xl mt-8 shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50">
				{saving ? 'جاري الإرسال...' : 'إرسال البيانات واعتماد الطلب'}
			  </button>
			</form>
		  )}

		  {/* EXTRA DATA FLOW (STEP 2) */}
		  {showStep2 && (
			<form onSubmit={submitStep2} className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-blue-200 mb-8 animate-in slide-in-from-bottom-4">
			  <div className="text-center mb-8">
				<h3 className="font-black text-[22px] text-slate-800">الملف الشامل (الخطوة 2)</h3>
				<p className="text-xs text-slate-500 font-bold mt-1.5">تطابق هذه الحقول قاعدة البيانات الإدارية للمجتمع.</p>
			  </div>

			  <div className="border-b-2 border-slate-100 pb-2 mb-4"><h4 className="font-black text-xs text-blue-600 uppercase tracking-wider">البيانات الاقتصادية</h4></div>
			  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
				<div><label className="block text-xs font-bold text-slate-600 mb-2">مستوى الدخل المادي</label><select value={step2Data.income_level} onChange={e=>setStep2Data({...step2Data, income_level: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"><option value="اخضر">مستقر (أخضر)</option><option value="اصفر">متوسط (أصفر)</option><option value="احمر">ضعيف (أحمر)</option></select></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">حالات خاصة / احتياجات</label><input type="text" value={step2Data.special_issues} onChange={e=>setStep2Data({...step2Data, special_issues: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="كبار سن، ذوي همم..." /></div>
			  </div>

			  <div className="border-b-2 border-slate-100 pb-2 mb-4"><h4 className="font-black text-xs text-blue-600 uppercase tracking-wider">السجل الصحي والطوارئ</h4></div>
			  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
				<div><label className="block text-xs font-bold text-slate-600 mb-2">فصيلة الدم</label><select value={step2Data.blood_type} onChange={e=>setStep2Data({...step2Data, blood_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 font-['IBM_Plex_Mono']"><option value="">غير محدد</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">أمراض مزمنة</label><input type="text" value={step2Data.chronic_diseases} onChange={e=>setStep2Data({...step2Data, chronic_diseases: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
				<div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-2">حساسية أدوية</label><input type="text" value={step2Data.allergies} onChange={e=>setStep2Data({...step2Data, allergies: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">شخص الطوارئ</label><input type="text" value={step2Data.emergency_contact_name} onChange={e=>setStep2Data({...step2Data, emergency_contact_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">هاتف الطوارئ</label><input type="text" value={step2Data.emergency_phone} onChange={e=>setStep2Data({...step2Data, emergency_phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 font-['IBM_Plex_Mono'] text-left" dir="ltr" /></div>
			  </div>

			  <div className="border-b-2 border-slate-100 pb-2 mb-4"><h4 className="font-black text-xs text-blue-600 uppercase tracking-wider">السيرة المهنية</h4></div>
			  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
				<div><label className="block text-xs font-bold text-slate-600 mb-2">المؤهل الأكاديمي</label><input type="text" value={step2Data.academic_degree} onChange={e=>setStep2Data({...step2Data, academic_degree: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
				<div><label className="block text-xs font-bold text-slate-600 mb-2">جهة العمل الحالية</label><input type="text" value={step2Data.company_name} onChange={e=>setStep2Data({...step2Data, company_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
				<div className="sm:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-2">ملخص الخبرات (CV)</label><textarea rows="3" value={step2Data.cv_summary} onChange={e=>setStep2Data({...step2Data, cv_summary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500" /></div>
			  </div>

			  <div className="flex flex-col gap-3">
				<button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
				  {saving ? 'جاري الحفظ...' : 'حفظ البيانات وتحديث الملف'}
				</button>
				<button type="button" onClick={() => setShowStep2(false)} className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all">إلغاء والعودة</button>
			  </div>
			</form>
		  )}

		</div>
	  )}
	</div>
  );
}