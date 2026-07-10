import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, MonitorSmartphone, ActivitySquare, Search, RefreshCw } from 'lucide-react';

const tabs = [
  { id: 'users',   label: 'حسابات النظام',   icon: Users },
  { id: 'devices', label: 'الأجهزة الموثوقة', icon: MonitorSmartphone },
  { id: 'logs',    label: 'سجل الجلسات',      icon: ActivitySquare },
];

const roleStyle = {
  admin:   'bg-red-50 text-red-600 border-red-200',
  manager: 'bg-blue-50 text-blue-600 border-blue-200',
  citizen: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const fetchAdminData = async () => {
	setLoading(true);
	const [{ data: profiles }, { data: dev }, { data: lg }] = await Promise.all([
	  supabase.from('profiles').select('*'),
	  supabase.from('trusted_devices').select('*, profiles(name)').order('created_at', { ascending: false }),
	  supabase.from('login_sessions').select('*, profiles(name)').order('created_at', { ascending: false }).limit(30),
	]);
	if (profiles) setUsers(profiles);
	if (dev) setDevices(dev);
	if (lg) setLogs(lg);
	setLoading(false);
  };

  useEffect(() => {
	if (!isAdmin) return;
	fetchAdminData();
  }, [isAdmin]);

  const updateDeviceStatus = async (id, status) => {
	await supabase.from('trusted_devices').update({ status }).eq('id', id);
	const { data: dev } = await supabase.from('trusted_devices').select('*, profiles(name)').order('created_at', { ascending: false });
	if (dev) setDevices(dev);
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(query.toLowerCase()));

  if (!isAdmin) {
	return (
	  <div className="flex flex-col items-center justify-center h-full bg-slate-50 font-['Tajawal'] text-center px-6">
		<ShieldAlert size={44} className="text-red-400 mb-4" />
		<h2 className="text-xl font-black text-slate-800 mb-2">غير مصرح بالدخول</h2>
		<p className="text-sm text-slate-500">هذه الصفحة مخصصة لمدراء النظام فقط.</p>
	  </div>
	);
  }

  return (
	<div className="h-full font-['Tajawal'] flex flex-col" dir="rtl">

	  {/* Header */}
	  <div className="flex items-center justify-between px-1 pb-5 shrink-0">
		<div>
		  <h2 className="text-lg font-black text-slate-900">الإعدادات الأمنية</h2>
		  <p className="text-xs text-slate-500 font-bold mt-0.5">إدارة المستخدمين والأجهزة وسجل النشاط</p>
		</div>
		<button
		  onClick={fetchAdminData}
		  disabled={loading}
		  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all disabled:opacity-50"
		  title="تحديث البيانات"
		>
		  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
		</button>
	  </div>

	  {/* Tabs */}
	  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-5 shrink-0 w-fit">
		{tabs.map(t => (
		  <button
			key={t.id}
			onClick={() => setActiveTab(t.id)}
			className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
			  activeTab === t.id ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-800'
			}`}
		  >
			<t.icon size={15} className={activeTab === t.id ? 'text-red-500' : 'text-slate-400'} />
			{t.label}
			{t.id === 'users' && <CountBadge n={users.length} active={activeTab === t.id} />}
			{t.id === 'devices' && <CountBadge n={devices.filter(d => d.status !== 'approved').length} active={activeTab === t.id} warn />}
		  </button>
		))}
	  </div>

	  {/* Panel */}
	  <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">

		{activeTab === 'users' && (
		  <>
			<div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center gap-3">
			  <div className="relative flex-1 max-w-xs">
				<Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input
				  value={query}
				  onChange={e => setQuery(e.target.value)}
				  placeholder="بحث بالاسم..."
				  className="w-full h-9 bg-white border border-slate-200 rounded-lg pr-9 pl-3 text-xs font-bold outline-none focus:border-red-500 transition-colors"
				/>
			  </div>
			  <span className="text-xs font-bold text-slate-400 mr-auto">{filteredUsers.length} مستخدم</span>
			</div>
			<div className="flex-1 overflow-y-auto">
			  {loading ? (
				<EmptyState text="جاري التحميل..." />
			  ) : filteredUsers.length === 0 ? (
				<EmptyState text="لا توجد نتائج مطابقة" />
			  ) : filteredUsers.map(u => (
				<div key={u.id} className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
				  <div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
					  {u.name?.charAt(0) || '؟'}
					</div>
					<div>
					  <div className="text-sm font-bold text-slate-900">{u.name}</div>
					  <div className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] mt-0.5">{u.id.substring(0, 12)}...</div>
					</div>
				  </div>
				  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${roleStyle[u.role] || roleStyle.citizen}`}>
					{u.role}
				  </span>
				</div>
			  ))}
			</div>
		  </>
		)}

		{activeTab === 'devices' && (
		  <div className="flex-1 overflow-auto">
			<table className="w-full text-right border-collapse">
			  <thead className="bg-slate-50 sticky top-0">
				<tr>
				  <th className="py-3 px-4 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200">المستخدم / الجهاز</th>
				  <th className="py-3 px-4 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200">النظام / المتصفح</th>
				  <th className="py-3 px-4 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200">الموقع (IP)</th>
				  <th className="py-3 px-4 text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center">الإجراء</th>
				</tr>
			  </thead>
			  <tbody>
				{loading ? (
				  <tr><td colSpan="4" className="py-10"><EmptyState text="جاري التحميل..." bare /></td></tr>
				) : devices.length === 0 ? (
				  <tr><td colSpan="4" className="py-10"><EmptyState text="لا توجد أجهزة مسجلة" bare /></td></tr>
				) : devices.map(d => (
				  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
					<td className="py-3 px-4">
					  <div className="text-sm font-extrabold text-slate-900">{d.profiles?.name || 'مجهول'}</div>
					  <div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-400">{d.device_uuid?.substring(0, 8)}...</div>
					</td>
					<td className="py-3 px-4">
					  <div className="text-xs font-bold text-slate-700">{d.device_model || '-'} / {d.os || '-'}</div>
					  <div className="text-[10px] text-slate-500 mt-0.5">{d.browser || '-'}</div>
					</td>
					<td className="py-3 px-4">
					  <div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-600">{d.country || '-'}</div>
					  <div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-400 mt-0.5">{d.ip_address || '-'}</div>
					</td>
					<td className="py-3 px-4 text-center">
					  {d.status === 'approved' ? (
						<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10.5px] font-bold">مصرح ✔</span>
					  ) : (
						<div className="flex justify-center gap-2">
						  <button onClick={() => updateDeviceStatus(d.id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-[11px] font-bold transition-colors">تفعيل</button>
						  <button onClick={() => updateDeviceStatus(d.id, 'rejected')} className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-1 rounded text-[11px] font-bold transition-colors">رفض</button>
						</div>
					  )}
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		)}

		{activeTab === 'logs' && (
		  <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
			{loading ? (
			  <EmptyState text="جاري التحميل..." />
			) : logs.length === 0 ? (
			  <EmptyState text="لا توجد نشاطات مسجلة" />
			) : logs.map(log => {
			  const isSuccess = log.action.includes('Login');
			  return (
				<div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
				  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-red-500 ring-4 ring-red-500/20'}`} />
				  <div>
					<div className="text-sm font-bold text-slate-800">
					  {log.action} <span className="text-slate-500 font-medium">({log.profiles?.name || 'مجهول'})</span>
					</div>
					<div className="text-[10.5px] text-slate-500 font-['IBM_Plex_Mono'] mt-1">
					  {log.ip_address || 'IP Unknown'} · {new Date(log.created_at).toLocaleString('en-GB')}
					</div>
				  </div>
				</div>
			  );
			})}
		  </div>
		)}
	  </div>
	</div>
  );
}

function CountBadge({ n, active, warn }) {
  if (!n) return null;
  return (
	<span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${warn ? 'bg-red-100 text-red-600' : active ? 'bg-red-50 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
	  {n}
	</span>
  );
}

function EmptyState({ text, bare }) {
  const content = <span className="text-sm font-bold text-slate-400">{text}</span>;
  if (bare) return content;
  return <div className="flex items-center justify-center py-14">{content}</div>;
}