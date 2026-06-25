import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Award, Activity, Plus, Trash2 } from 'lucide-react';

export default function Committee() {
  const { workspace } = useAuth();
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', phone: '' });
  const [newService, setNewService] = useState({ title: '', category: 'بنية تحتية', status: 'نشط', details: '' });

  const fetchMembers = async () => {
	setLoadingMembers(true);
	const { data } = await supabase.from('committee_members').select('*').order('created_at', { ascending: false });
	setMembers(data || []);
	setLoadingMembers(false);
  };

  const fetchServices = async () => {
	setLoadingServices(true);
	const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
	setServices(data || []);
	setLoadingServices(false);
  };

  useEffect(() => {
	fetchMembers();
	fetchServices();
  }, []);

  const handleAddMember = async (e) => {
	e.preventDefault();
	if (!newMember.name || !newMember.role) return;
	
	await supabase.from('committee_members').insert({
	  ...newMember,
	  workspace_id: workspace.id
	});
	
	setShowMemberModal(false);
	setNewMember({ name: '', role: '', phone: '' });
	fetchMembers();
  };

  const handleAddService = async (e) => {
	e.preventDefault();
	if (!newService.title) return;

	await supabase.from('services').insert({
	  ...newService,
	  workspace_id: workspace.id
	});

	setShowServiceModal(false);
	setNewService({ title: '', category: 'بنية تحتية', status: 'نشط', details: '' });
	fetchServices();
  };

  const deleteMember = async (id) => {
	if (window.confirm('هل أنت متأكد من حذف العضو؟')) {
	  await supabase.from('committee_members').delete().eq('id', id);
	  fetchMembers();
	}
  };

  const deleteService = async (id) => {
	if (window.confirm('حذف هذه الخدمة؟')) {
	  await supabase.from('services').delete().eq('id', id);
	  fetchServices();
	}
  };

  return (
	<div className="flex flex-col gap-6 h-full font-['Tajawal']" dir="rtl">
	  {/* Header */}
	  <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
		<div>
		  <h3 className="text-lg font-black text-slate-900">إدارة لجنة الحي والخدمات</h3>
		  <p className="text-xs text-slate-500 mt-1">إدارة الأعضاء ومتابعة مشاريع البنية التحتية، المواسم، والتعليم.</p>
		</div>
		<div className="flex gap-3">
		  <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
			<Plus size={16} /> إضافة عضو
		  </button>
		  <button onClick={() => setShowServiceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			<Plus size={16} /> إضافة خدمة / مشروع
		  </button>
		</div>
	  </div>

	  <div className="flex flex-col xl:flex-row gap-6 flex-1 overflow-hidden">
		{/* Services Table */}
		<div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
		  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
			<Activity size={18} className="text-slate-500" />
			<h4 className="text-sm font-extrabold text-slate-800">الخدمات والمشاريع</h4>
		  </div>
		  <div className="flex-1 overflow-auto">
			<table className="w-full text-right border-collapse">
			  <thead className="bg-slate-50 sticky top-0">
				<tr>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">المشروع</th>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">التصنيف</th>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">الحالة</th>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center">إجراء</th>
				</tr>
			  </thead>
			  <tbody>
				{loadingServices ? (
				  <tr><td colSpan="4" className="py-8 text-center text-sm font-bold text-slate-500">جاري التحميل...</td></tr>
				) : services.length === 0 ? (
				  <tr><td colSpan="4" className="py-8 text-center text-sm font-bold text-slate-500">لا توجد خدمات مسجلة</td></tr>
				) : services.map(s => (
				  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
					<td className="py-3 px-4 text-sm font-extrabold text-slate-900">
					  {s.title}
					  <div className="text-[11px] font-semibold text-slate-500 mt-1 max-w-[200px] truncate">{s.details}</div>
					</td>
					<td className="py-3 px-4"><span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-[11px] font-bold">{s.category}</span></td>
					<td className="py-3 px-4">
					  <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${s.status === 'نشط' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s.status === 'مكتمل' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
						{s.status}
					  </span>
					</td>
					<td className="py-3 px-4 text-center">
					  <button onClick={() => deleteService(s.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
						<Trash2 size={16} />
					  </button>
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</div>

		{/* Members Table */}
		<div className="w-full xl:w-[450px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden shrink-0">
		  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
			<Award size={18} className="text-slate-500" />
			<h4 className="text-sm font-extrabold text-slate-800">أعضاء لجنة الحي</h4>
		  </div>
		  <div className="flex-1 overflow-auto">
			<table className="w-full text-right border-collapse">
			  <thead className="bg-slate-50 sticky top-0">
				<tr>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">الاسم والمنصب</th>
				  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center">إجراء</th>
				</tr>
			  </thead>
			  <tbody>
				{loadingMembers ? (
				  <tr><td colSpan="2" className="py-8 text-center text-sm font-bold text-slate-500">جاري التحميل...</td></tr>
				) : members.length === 0 ? (
				  <tr><td colSpan="2" className="py-8 text-center text-sm font-bold text-slate-500">لا يوجد أعضاء</td></tr>
				) : members.map(m => (
				  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
					<td className="py-3 px-4">
					  <div className="text-sm font-extrabold text-slate-900">{m.name}</div>
					  <div className="text-[12px] font-bold text-blue-600 mt-0.5">{m.role}</div>
					  <div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-500 mt-0.5">{m.phone || '—'}</div>
					</td>
					<td className="py-3 px-4 text-center">
					  <button onClick={() => deleteMember(m.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
						<Trash2 size={16} />
					  </button>
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</div>
	  </div>

	  {/* Basic Modals (In a real app, extract these to separate components) */}
	  {showMemberModal && (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		  <form onSubmit={handleAddMember} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
			<div className="p-5 border-b border-slate-200 bg-slate-50 font-black text-slate-900">إضافة عضو للجنة</div>
			<div className="p-5 space-y-4">
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">اسم العضو *</label><input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" required /></div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">المنصب / التكليف *</label><input type="text" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="رئيس اللجنة، مسؤول خدمات..." className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" required /></div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">رقم الهاتف</label><input type="text" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm font-['IBM_Plex_Mono'] outline-none focus:border-blue-500" /></div>
			</div>
			<div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
			  <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg">إلغاء</button>
			  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg">حفظ العضو</button>
			</div>
		  </form>
		</div>
	  )}

	  {showServiceModal && (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		  <form onSubmit={handleAddService} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
			<div className="p-5 border-b border-slate-200 bg-slate-50 font-black text-slate-900">إضافة خدمة أو مشروع</div>
			<div className="p-5 space-y-4">
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">اسم الخدمة *</label><input type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500" required /></div>
			  <div className="grid grid-cols-2 gap-4">
				<div>
				  <label className="block text-xs font-bold text-slate-500 mb-1">التصنيف</label>
				  <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500">
					<option value="بنية تحتية">بنية تحتية</option>
					<option value="موسمية">موسمية</option>
					<option value="تعليمي ودعوي">تعليمي ودعوي</option>
					<option value="أخرى">أخرى</option>
				  </select>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-500 mb-1">الحالة</label>
				  <select value={newService.status} onChange={e => setNewService({...newService, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500">
					<option value="نشط">نشط / جاري</option>
					<option value="مكتمل">مكتمل</option>
					<option value="معلق">معلق</option>
				  </select>
				</div>
			  </div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">التفاصيل والوصف</label><textarea value={newService.details} onChange={e => setNewService({...newService, details: e.target.value})} rows={3} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500 resize-none"></textarea></div>
			</div>
			<div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
			  <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg">إلغاء</button>
			  <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg">حفظ الخدمة</button>
			</div>
		  </form>
		</div>
	  )}
	</div>
  );
}