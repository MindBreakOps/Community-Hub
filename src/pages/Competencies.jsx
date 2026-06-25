import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Competencies() {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
	const fetchCompetencies = async () => {
	  setLoading(true);
	  const { data } = await supabase.from('residents').select('*');
	  
	  if (data) {
		const keywords = ['طبيب', 'دكتور', 'مهندس', 'أستاذ', 'استاذ', 'بروف', 'مدير', 'خبير', 'محامي', 'صيدلي', 'مستشار', 'مبرمج'];
		const filtered = data.filter(r => {
		  if (!r.profession) return false;
		  const prof = r.profession.toLowerCase();
		  return keywords.some(kw => prof.includes(kw));
		});
		setCompetencies(filtered);
	  }
	  setLoading(false);
	};

	fetchCompetencies();
  }, []);

  return (
	<div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-['Tajawal']" dir="rtl">
	  <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
		<h3 className="text-lg font-black text-slate-900">سجل الكفاءات والخبرات</h3>
		<p className="text-xs text-slate-500 mt-1">يتم التعرف عليهم واستخراجهم تلقائياً من السجل المدني بناءً على المهنة المسجلة.</p>
	  </div>

	  <div className="flex-1 overflow-auto">
		<table className="w-full text-right border-collapse min-w-[700px]">
		  <thead className="bg-slate-50 sticky top-0 z-10">
			<tr>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200">الاسم الرباعي</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200">الرقم الوطني</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200">التخصص / المهنة</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200">رقم الهاتف</th>
			  <th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-200">الموقع</th>
			</tr>
		  </thead>
		  <tbody>
			{loading ? (
			  <tr><td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-bold">جاري سحب الكفاءات...</td></tr>
			) : competencies.length === 0 ? (
			  <tr><td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-bold">لا توجد كفاءات مسجلة حالياً</td></tr>
			) : competencies.map(c => (
			  <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-100">
				<td className="py-3 px-4 text-sm font-extrabold text-slate-900">{c.full_name}</td>
				<td className="py-3 px-4 text-[11px] font-['IBM_Plex_Mono'] text-slate-500">{c.national_id}</td>
				<td className="py-3 px-4 text-sm font-bold text-blue-600">{c.profession}</td>
				<td className="py-3 px-4 text-[13px] font-['IBM_Plex_Mono'] text-slate-800">{c.phone_number || '—'}</td>
				<td className="py-3 px-4">
				  <span className="bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-1 text-[11px] font-bold">
					{c.location} · ق {c.house_number || '—'}
				  </span>
				</td>
			  </tr>
			))}
		  </tbody>
		</table>
	  </div>
	</div>
  );
}