import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Plus, RefreshCw, Download } from 'lucide-react';

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResidents = async () => {
	setLoading(true);
	try {
	  // RLS ensures they only get records for their workspace
	  const { data, error } = await supabase
		.from('residents')
		.select('*')
		.order('created_at', { ascending: false });

	  if (error) throw error;
	  setResidents(data || []);
	} catch (error) {
	  console.error('Error fetching residents:', error.message);
	} finally {
	  setLoading(false);
	}
  };

  useEffect(() => {
	fetchResidents();
  }, []);

  const filteredData = residents.filter(r => 
	r.full_name?.toLowerCase().includes(search.toLowerCase()) || 
	r.national_id?.includes(search)
  );

  return (
	<div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-['Tajawal']" dir="rtl">
	  {/* Header & Controls */}
	  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
		<div className="relative w-80">
		  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
		  <input 
			type="text" 
			value={search}
			onChange={(e) => setSearch(e.target.value)}
			placeholder="بحث بالاسم، الرقم الوطني..." 
			className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-10 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
		  />
		</div>
		
		<div className="flex items-center gap-2">
		  <button onClick={fetchResidents} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
			<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
			تحديث
		  </button>
		  <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			<Plus size={16} />
			إضافة سجل
		  </button>
		</div>
	  </div>

	  {/* Data Table */}
	  <div className="flex-1 overflow-auto">
		<table className="w-full text-right border-collapse min-w-[900px]">
		  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
			<tr>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">الاسم الرباعي</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">الرقم الوطني</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">المهنة</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">الموقع</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap text-center">السكن</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap text-center">الحالة</th>
			</tr>
		  </thead>
		  <tbody>
			{loading ? (
			  <tr>
				<td colSpan="6" className="py-12 text-center text-slate-500 text-sm font-bold">
				  جاري تحميل البيانات...
				</td>
			  </tr>
			) : filteredData.length === 0 ? (
			  <tr>
				<td colSpan="6" className="py-12 text-center text-slate-500 text-sm font-bold">
				  لا توجد سجلات مطابقة.
				</td>
			  </tr>
			) : (
			  filteredData.map((row) => (
				<tr key={row.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
				  <td className="py-3 px-4 text-sm font-extrabold text-slate-900 whitespace-nowrap">{row.full_name}</td>
				  <td className="py-3 px-4 text-[11px] font-['IBM_Plex_Mono'] text-slate-500 whitespace-nowrap">{row.national_id}</td>
				  <td className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">{row.profession || '—'}</td>
				  <td className="py-3 px-4 whitespace-nowrap">
					<span className="bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-1 text-[11px] font-bold">
					  {row.location} · ق {row.house_number || '—'}
					</span>
				  </td>
				  <td className="py-3 px-4 text-center whitespace-nowrap">
					<span className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
					  row.housing_type === 'مالك' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
					  row.housing_type === 'مستأجر' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
					  'bg-amber-50 text-amber-700 border-amber-200'
					}`}>
					  {row.housing_type || '—'}
					</span>
				  </td>
				  <td className="py-3 px-4 text-center whitespace-nowrap">
					{row.status === 'approved' 
					  ? <span className="inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">معتمد ✔</span>
					  : <span className="inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-500 border border-slate-200">مراجعة</span>
					}
				  </td>
				</tr>
			  ))
			)}
		  </tbody>
		</table>
	  </div>
	</div>
  );
}