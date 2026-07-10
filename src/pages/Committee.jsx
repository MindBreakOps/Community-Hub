import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Award, Activity, Plus, Trash2, Search, RefreshCw } from 'lucide-react';

const tabs = [
  { id: 'services', label: 'الخدمات والمشاريع', icon: Activity },
  { id: 'members',  label: 'أعضاء لجنة الحي',   icon: Award },
];

const statusStyle = {
  'نشط':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'مكتمل': 'bg-blue-50 text-blue-700 border-blue-200',
  'معلق':  'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Committee() {
  const { workspace } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [query, setQuery] = useState('');

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

  const refreshAll = () => { fetchMembers(); fetchServices(); };

  useEffect(() => { refreshAll(); }, []);

  const handleAddMember = async (e) => {
	e.preventDefault();
	if (!newMember.name || !newMember.role) return;
	await supabase.from('committee_members').insert({ ...newMember, workspace_id: workspace.id });
	setShowMemberModal(false);
	setNewMember({ name: '', role: '', phone: '' });
	fetchMembers();
  };

  const handleAddService = async (e) => {
	e.preventDefault();
	if (!newService.title) return;
	await supabase.from('services').insert({ ...newService, workspace_id: workspace.id });
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

  const filteredServices = services.filter(s => s.title?.toLowerCase().includes(query.toLowerCase()));
  const filteredMembers = members.filter(m => m.name?.toLowerCase().includes(query.toLowerCase()));
  const loading = activeTab === 'services' ? loadingServices : loadingMembers;

  return (
	<div className="h-full font-['Tajawal'] flex flex-col" dir="rtl">

	  {/* Header */}
	  <div className="flex items-center justify-between px-1 pb-5 shrink-0">
		<div>
		  <h2 className="text-lg font-black text-slate-900">لجنة الحي والخدمات</h2>
		  <p className="text-xs text-slate-500 font-bold mt-0.5">إدارة الأعضاء ومتابعة مشاريع البنية التحتية والمواسم والتعليم</p>
		</div>
		<div className="flex items-center gap-2">
		  <button
			onClick={refreshAll}
			disabled={loadingMembers || loadingServices}
			className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all disabled:opacity-50"
			title="تحديث البيانات"
		  >
			<RefreshCw size={15} className={(loadingMembers || loadingServices) ? 'animate-spin' : ''} />
		  </button>
		  {activeTab === 'services' ? (
			<button onClick={() => setShowServiceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			  <Plus size={16} /> إضافة خدمة / مشروع
			</button>
		  ) : (
			<button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			  <Plus size={16} /> إضافة عضو
			</button>
		  )}
		</div>
	  </div>

	  {/* Tabs */}
	  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-5 shrink-0 w-fit">
		{tabs.map(t => (
		  <button
			key={t.id}
			onClick={() => { setActiveTab(t.id); setQuery(''); }}
			className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
			  activeTab === t.id ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-800'
			}`}
		  >
			<t.icon size={15} className={activeTab === t.id ? 'text-red-500' : 'text-slate-400'} />
			{t.label}
			<CountBadge n={t.id === 'services' ? services.length : members.length} active={activeTab === t.id} />
		  </button>
		))}
	  </div>

	  {/* Panel */}
	  <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">

		<div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center gap-3">
		  <div className="relative flex-1 max-w-xs">
			<Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
			<input
			  value={query}
			  onChange={e => setQuery(e.target.value)}
			  placeholder={activeTab === 'services' ? 'بحث عن مشروع...' : 'بحث بالاسم...'}
			  className="w-full h-9 bg-white border border-slate-200 rounded-lg pr-9 pl-3 text-xs font-bold outline-none focus:border-red-500 transition-colors"
			/>
		  </div>
		  <span className="text-xs font-bold text-slate-400 mr-auto">
			{activeTab === 'services' ? `${filteredServices.length} مشروع/خدمة` : `${filteredMembers.length} عضو`}
		  </span>
		</div>

		{activeTab === 'services' && (
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
				  <tr><td colSpan="4" className="py-10"><EmptyState text="جاري التحميل..." bare /></td></tr>
				) : filteredServices.length === 0 ? (
				  <tr><td colSpan="4" className="py-10"><EmptyState text={query ? 'لا توجد نتائج مطابقة' : 'لا توجد خدمات مسجلة'} bare /></td></tr>
				) : filteredServices.map(s => (
				  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
					<td className="py-3 px-4 text-sm font-extrabold text-slate-900">
					  {s.title}
					  <div className="text-[11px] font-semibold text-slate-500 mt-1 max-w-[280px] truncate">{s.details}</div>
					</td>
					<td className="py-3 px-4"><span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-[11px] font-bold">{s.category}</span></td>
					<td className="py-3 px-4">
					  <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusStyle[s.status] || statusStyle['معلق']}`}>
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
		)}

		{activeTab === 'members' && (
		  <div className="flex-1 overflow-y-auto">
			{loadingMembers ? (
			  <EmptyState text="جاري التحميل..." />
			) : filteredMembers.length === 0 ? (
			  <EmptyState text={query ? 'لا توجد نتائج مطابقة' : 'لا يوجد أعضاء'} />
			) : filteredMembers.map(m => (
			  <div key={m.id} className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
				<div className="flex items-center gap-3">
				  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
					{m.name?.charAt(0) || '؟'}
				  </div>
				  <div>
					<div className="text-sm font-bold text-slate-900">{m.name}</div>
					<div className="text-[12px] font-bold text-blue-600 mt-0.5">{m.role}</div>
					<div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-500 mt-0.5">{m.phone || '—'}</div>
				  </div>
				</div>
				<button onClick={() => deleteMember(m.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors shrink-0">
				  <Trash2 size={16} />
				</button>
			  </div>
			))}
		  </div>
		)}
	  </div>

	  {/* Modals */}
	  {showMemberModal && (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		  <form onSubmit={handleAddMember} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
			<div className="p-5 border-b border-slate-200 bg-slate-50 font-black text-slate-900">إضافة عضو للجنة</div>
			<div className="p-5 space-y-4">
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">اسم العضو *</label><input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500" required /></div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">المنصب / التكليف *</label><input type="text" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="رئيس اللجنة، مسؤول خدمات..." className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500" required /></div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">رقم الهاتف</label><input type="text" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm font-['IBM_Plex_Mono'] outline-none focus:border-red-500" /></div>
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
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">اسم الخدمة *</label><input type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500" required /></div>
			  <div className="grid grid-cols-2 gap-4">
				<div>
				  <label className="block text-xs font-bold text-slate-500 mb-1">التصنيف</label>
				  <select value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500">
					<option value="بنية تحتية">بنية تحتية</option>
					<option value="موسمية">موسمية</option>
					<option value="تعليمي ودعوي">تعليمي ودعوي</option>
					<option value="أخرى">أخرى</option>
				  </select>
				</div>
				<div>
				  <label className="block text-xs font-bold text-slate-500 mb-1">الحالة</label>
				  <select value={newService.status} onChange={e => setNewService({...newService, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500">
					<option value="نشط">نشط / جاري</option>
					<option value="مكتمل">مكتمل</option>
					<option value="معلق">معلق</option>
				  </select>
				</div>
			  </div>
			  <div><label className="block text-xs font-bold text-slate-500 mb-1">التفاصيل والوصف</label><textarea value={newService.details} onChange={e => setNewService({...newService, details: e.target.value})} rows={3} className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-red-500 resize-none"></textarea></div>
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

function CountBadge({ n, active }) {
  if (!n) return null;
  return (
	<span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-red-50 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
	  {n}
	</span>
  );
}

function EmptyState({ text, bare }) {
  const content = <span className="text-sm font-bold text-slate-400">{text}</span>;
  if (bare) return content;
  return <div className="flex items-center justify-center py-14">{content}</div>;
}