import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, RefreshCw, X, User, FileText, Image as ImageIcon } from 'lucide-react';

const INITIAL_FORM_STATE = {
  full_name: '', national_id: '', phone_number: '', location: 'شمال', house_number: '', 
  profession: '', status: 'pending', marital_status: 'أعزب', housing_type: 'مالك', 
  family_members_count: 1, income_level: 'اخضر', owned_properties_count: 0, special_issues: '',
  blood_type: '', chronic_diseases: '', allergies: '', emergency_contact_name: '', 
  emergency_phone: '', academic_degree: '', company_name: '', cv_summary: '', id_image_url: ''
};

export default function Residents() {
  const { user, workspace } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(INITIAL_FORM_STATE);
  const [viewRecord, setViewRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  const fetchResidents = async () => {
	setLoading(true);
	const { data } = await supabase.from('residents').select('*').order('created_at', { ascending: false });
	setResidents(data || []);
	setLoading(false);
  };

  useEffect(() => { fetchResidents(); }, []);

  const handleSave = async (e) => {
	e.preventDefault();
	setSaving(true);
	try {
	  if (currentRecord.id) {
		await supabase.from('residents').update(currentRecord).eq('id', currentRecord.id);
	  } else {
		await supabase.from('residents').insert({
		  ...currentRecord,
		  workspace_id: workspace.id,
		  created_by: user.id
		});
	  }
	  setShowAddModal(false);
	  fetchResidents();
	} catch (err) {
	  alert('فشل الحفظ: ' + err.message);
	} finally {
	  setSaving(false);
	}
  };

  const handleDelete = async (id) => {
	if (!window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) return;
	await supabase.from('residents').delete().eq('id', id);
	fetchResidents();
  };

  const openAdd = () => { setCurrentRecord(INITIAL_FORM_STATE); setShowAddModal(true); };
  const openEdit = (record) => { setCurrentRecord(record); setShowAddModal(true); };
  const openView = (record) => { setViewRecord(record); setShowViewModal(true); };

  const filteredData = residents.filter(r => 
	r.full_name?.toLowerCase().includes(search.toLowerCase()) || 
	r.national_id?.includes(search) || 
	r.house_number?.includes(search)
  );

  return (
	<div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-['Tajawal']" dir="rtl">
	  
	  {/* Header Controls */}
	  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
		<div className="relative w-80">
		  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
		  <input 
			type="text" value={search} onChange={(e) => setSearch(e.target.value)}
			placeholder="بحث بالاسم، الرقم الوطني، القطعة..." 
			className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-10 text-sm outline-none focus:border-orange-500 transition-all"
		  />
		</div>
		
		<div className="flex items-center gap-2">
		  <button onClick={fetchResidents} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
			<RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> تحديث
		  </button>
		  {isManager && (
			<button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			  <Plus size={16} /> إضافة سجل يدوي
			</button>
		  )}
		</div>
	  </div>

	  {/* Main Table */}
	  <div className="flex-1 overflow-auto">
		<table className="w-full text-right border-collapse min-w-[1000px]">
		  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
			<tr>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 whitespace-nowrap">الاسم الرباعي</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 whitespace-nowrap">الرقم الوطني</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 whitespace-nowrap">الموقع والقطعة</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center whitespace-nowrap">المستند (الهوية)</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center whitespace-nowrap">الاعتماد</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center whitespace-nowrap">إجراءات</th>
			</tr>
		  </thead>
		  <tbody>
			{loading ? <tr><td colSpan="6" className="py-12 text-center font-bold text-slate-500">جاري التحميل...</td></tr> : 
			 filteredData.length === 0 ? <tr><td colSpan="6" className="py-12 text-center font-bold text-slate-500">لا توجد سجلات مطابقة.</td></tr> : 
			 filteredData.map((row) => (
			  <tr key={row.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
				<td className="py-3 px-4 text-sm font-extrabold text-slate-900 whitespace-nowrap">{row.full_name}</td>
				<td className="py-3 px-4 text-[11px] font-['IBM_Plex_Mono'] text-slate-500 whitespace-nowrap">{row.national_id}</td>
				<td className="py-3 px-4 whitespace-nowrap"><span className="bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-1 text-[11px] font-bold">{row.location} · ق {row.house_number || '—'}</span></td>
				
				{/* ID Document Column */}
				<td className="py-3 px-4 text-center whitespace-nowrap">
				  {row.id_image_url ? (
					<a href={row.id_image_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-md text-[11px] font-bold transition-colors">
					  <ImageIcon size={12} /> عرض الهوية
					</a>
				  ) : (
					<span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">بدون مرفق</span>
				  )}
				</td>

				<td className="py-3 px-4 text-center whitespace-nowrap">
				  {row.status === 'approved' ? (
					<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-bold">معتمد ✔</span>
				  ) : row.status === 'rejected' ? (
					<span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full text-[10px] font-bold">مرفوض ✘</span>
				  ) : (
					<span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full text-[10px] font-bold">قيد المراجعة</span>
				  )}
				</td>
				
				<td className="py-3 px-4 text-center whitespace-nowrap">
				  <div className="flex justify-center gap-2">
					<button onClick={() => openView(row)} className="text-slate-600 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-[11px] font-bold transition-colors">عرض ومطابقة</button>
					{isManager && (
					  <>
						<button onClick={() => openEdit(row)} className="text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-[11px] font-bold transition-colors">تعديل</button>
						<button onClick={() => handleDelete(row.id)} className="text-red-600 hover:bg-red-50 px-2.5 py-1 rounded border border-red-200 text-[11px] font-bold transition-colors">حذف</button>
					  </>
					)}
				  </div>
				</td>
			  </tr>
			))}
		  </tbody>
		</table>
	  </div>

	  {/* --- ADD / EDIT MODAL (REMAINS THE SAME) --- */}
	  {showAddModal && (
		<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
		  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
			<div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
			  <h2 className="text-lg font-black flex items-center gap-2 text-slate-900">
				<User className="text-orange-500" size={20}/> 
				{currentRecord.id ? 'تعديل السجل' : 'إضافة سجل مواطن جديد'}
			  </h2>
			  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 transition-colors"><X size={24}/></button>
			</div>
			
			<form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[75vh]">
			  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				
				{/* 1. Basic Data */}
				<div className="md:col-span-3 pb-2 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest mt-2">البيانات الأساسية والإحصائية</div>
				
				<div className="md:col-span-2">
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم الرباعي *</label>
				  <input type="text" value={currentRecord.full_name} onChange={e => setCurrentRecord({...currentRecord, full_name: e.target.value})} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">الرقم الوطني *</label>
				  <input type="text" value={currentRecord.national_id} onChange={e => setCurrentRecord({...currentRecord, national_id: e.target.value})} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] text-left" dir="ltr"/>
				</div>
				
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
				  <input type="text" value={currentRecord.phone_number} onChange={e => setCurrentRecord({...currentRecord, phone_number: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] text-left" dir="ltr"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">المنطقة</label>
				  <select value={currentRecord.location} onChange={e => setCurrentRecord({...currentRecord, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all">
					<option value="شمال">شمال</option><option value="وسط">وسط</option><option value="جنوب">جنوب</option>
				  </select>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم القطعة</label>
				  <input type="text" value={currentRecord.house_number} onChange={e => setCurrentRecord({...currentRecord, house_number: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono']"/>
				</div>

				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">السكن / الملكية</label>
				  <select value={currentRecord.housing_type} onChange={e => setCurrentRecord({...currentRecord, housing_type: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all">
					<option value="مالك">مالك</option><option value="مستأجر">مستأجر</option><option value="ساكن مجاناً">ساكن مجاناً</option>
				  </select>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">أفراد الأسرة</label>
				  <input type="number" min="1" value={currentRecord.family_members_count} onChange={e => setCurrentRecord({...currentRecord, family_members_count: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono']"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">مستوى الدخل</label>
				  <select value={currentRecord.income_level} onChange={e => setCurrentRecord({...currentRecord, income_level: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all">
					<option value="اخضر">مستقر (أخضر)</option><option value="اصفر">متوسط (أصفر)</option><option value="احمر">ضعيف (أحمر)</option>
				  </select>
				</div>

				{/* 2. Health & Emergency */}
				<div className="md:col-span-3 pb-2 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest mt-4">الصحة والطوارئ</div>
				
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">فصيلة الدم</label>
				  <select value={currentRecord.blood_type} onChange={e => setCurrentRecord({...currentRecord, blood_type: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono']">
					<option value="">غير محدد</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
				  </select>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">أمراض مزمنة</label>
				  <input type="text" value={currentRecord.chronic_diseases} onChange={e => setCurrentRecord({...currentRecord, chronic_diseases: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all" placeholder="سكري، ضغط..."/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">حساسية أدوية</label>
				  <input type="text" value={currentRecord.allergies} onChange={e => setCurrentRecord({...currentRecord, allergies: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>
				
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">جهة الاتصال (طوارئ)</label>
				  <input type="text" value={currentRecord.emergency_contact_name} onChange={e => setCurrentRecord({...currentRecord, emergency_contact_name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">هاتف الطوارئ</label>
				  <input type="text" value={currentRecord.emergency_phone} onChange={e => setCurrentRecord({...currentRecord, emergency_phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-['IBM_Plex_Mono'] text-left" dir="ltr"/>
				</div>

				{/* 3. Professional */}
				<div className="md:col-span-3 pb-2 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest mt-4">المهنة والمؤهلات</div>
				
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">المسمى المهني</label>
				  <input type="text" value={currentRecord.profession} onChange={e => setCurrentRecord({...currentRecord, profession: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">المؤهل الأكاديمي</label>
				  <input type="text" value={currentRecord.academic_degree} onChange={e => setCurrentRecord({...currentRecord, academic_degree: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-600 mb-1.5">جهة العمل</label>
				  <input type="text" value={currentRecord.company_name} onChange={e => setCurrentRecord({...currentRecord, company_name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"/>
				</div>

				{/* 4. Approval Status (Admins/Managers Only) */}
				{isManager && (
				  <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-5 mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div>
					  <div className="text-sm font-bold text-slate-900">حالة الاعتماد في السجل المدني</div>
					  <div className="text-xs text-slate-500 mt-1">تحديد ما إذا كان المواطن معتمداً رسمياً، قيد المراجعة، أم مرفوضاً.</div>
					</div>
					<select 
					  value={currentRecord.status} 
					  onChange={e => setCurrentRecord({...currentRecord, status: e.target.value})} 
					  className={`font-bold rounded-lg p-3 text-sm outline-none focus:ring-2 cursor-pointer border-2 transition-all ${
						currentRecord.status === 'approved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 focus:ring-emerald-500/20' :
						currentRecord.status === 'rejected' ? 'bg-red-50 border-red-300 text-red-700 focus:ring-red-500/20' :
						'bg-amber-50 border-amber-300 text-amber-700 focus:ring-amber-500/20'
					  }`}
					>
					  <option value="approved">معتمد ✔</option>
					  <option value="pending">قيد المراجعة</option>
					  <option value="rejected">مرفوض ✘</option>
					</select>
				  </div>
				)}
			  </div>
			  
			  <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-200 sticky bottom-0 bg-white">
				<button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">إلغاء</button>
				<button type="submit" disabled={saving} className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-lg shadow-md hover:-translate-y-px transition-all disabled:opacity-50">
				  {saving ? 'جاري الحفظ...' : 'حفظ بيانات السجل'}
				</button>
			  </div>
			</form>
		  </div>
		</div>
	  )}

	  {/* --- VIEW MODAL (WITH ID IMAGE PREVIEW) --- */}
	  {showViewModal && viewRecord && (
		<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
		  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
			<div className="bg-slate-900 p-6 text-center border-b-4 border-orange-500 relative">
			  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
				<img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" className="w-10 h-10 object-contain" alt="Logo"/>
			  </div>
			  <h2 className="text-white text-lg font-black m-0 leading-tight">{viewRecord.full_name}</h2>
			  <p className="text-white/60 font-['IBM_Plex_Mono'] text-sm tracking-widest mt-1.5">{viewRecord.national_id}</p>
			  
			  {/* Status Badge */}
			  <div className="absolute top-4 right-4">
				{viewRecord.status === 'approved' ? (
				  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">معتمد ✔</span>
				) : viewRecord.status === 'rejected' ? (
				  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">مرفوض ✘</span>
				) : (
				  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md">مراجعة</span>
				)}
			  </div>
			</div>
			
			<div className="p-6 bg-slate-50">
			  <div className="grid grid-cols-2 gap-3 mb-6">
				<div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm"><div className="text-[10px] text-slate-500 font-bold mb-1">المهنة</div><div className="text-sm font-bold text-slate-900 truncate">{viewRecord.profession || '—'}</div></div>
				<div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm"><div className="text-[10px] text-slate-500 font-bold mb-1">رقم الهاتف</div><div className="text-sm font-bold text-blue-600 font-['IBM_Plex_Mono'] truncate">{viewRecord.phone_number || '—'}</div></div>
				<div className="col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
				  <div><div className="text-[10px] text-slate-500 font-bold mb-1">الموقع والقطعة</div><div className="text-sm font-black text-slate-900">{viewRecord.location} · ق {viewRecord.house_number || '—'}</div></div>
				  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs font-['IBM_Plex_Mono']">#{viewRecord.house_number}</div>
				</div>
				<div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm"><div className="text-[10px] text-slate-500 font-bold mb-1">نوع السكن</div><div className="text-sm font-bold text-slate-900">{viewRecord.housing_type || '—'}</div></div>
				<div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm"><div className="text-[10px] text-slate-500 font-bold mb-1">أفراد الأسرة</div><div className="text-sm font-black text-slate-900 font-['IBM_Plex_Mono']">{viewRecord.family_members_count}</div></div>
			  </div>

			  {/* ID Document Preview Area */}
			  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
				<div className="flex items-center gap-2 mb-3">
				  <FileText className="text-orange-500" size={16} />
				  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">مستند إثبات الهوية للتحقق</h4>
				</div>
				{viewRecord.id_image_url ? (
				  <a href={viewRecord.id_image_url} target="_blank" rel="noreferrer" className="block relative w-full h-48 rounded-lg overflow-hidden group border border-slate-200">
					<img src={viewRecord.id_image_url} alt="ID Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
					<div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
					  <span className="bg-white/90 text-slate-900 text-xs font-bold px-4 py-2 rounded-full">اضغط للتكبير</span>
					</div>
				  </a>
				) : (
				  <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
					<ImageIcon size={24} className="mb-2 opacity-50" />
					<span className="text-[11px] font-bold">لم يقم المواطن بإرفاق المستند</span>
				  </div>
				)}
			  </div>

			</div>
			
			<div className="p-4 flex gap-3 border-t border-slate-200 bg-white">
			  <button onClick={() => setShowViewModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">إغلاق النافذة</button>
			</div>
		  </div>
		</div>
	  )}

	</div>
  );
}