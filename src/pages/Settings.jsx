import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, MonitorSmartphone, ActivitySquare } from 'lucide-react';

export default function Settings() {
  const { user, workspace } = useAuth();
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'citizen' });

  // Guard: Only admins should access
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
	if (!isAdmin) return;

	const fetchAdminData = async () => {
	  setLoading(true);
	  // Fetch Profiles
	  const { data: profiles } = await supabase.from('profiles').select('*');
	  if (profiles) setUsers(profiles);

	  // Fetch Devices
	  const { data: dev } = await supabase.from('trusted_devices').select('*, profiles(name)').order('created_at', { ascending: false });
	  if (dev) setDevices(dev);

	  // Fetch Logs
	  const { data: lg } = await supabase.from('login_sessions').select('*, profiles(name)').order('created_at', { ascending: false }).limit(30);
	  if (lg) setLogs(lg);

	  setLoading(false);
	};

	fetchAdminData();
  }, [isAdmin]);

  const handleCreateUser = async (e) => {
	e.preventDefault();
	if (!newUser.name || !newUser.email || !newUser.password) return alert('البيانات ناقصة');

	try {
	  // 1. Create Auth User
	  const { data: authData, error: authErr } = await supabase.auth.signUp({
		email: newUser.email,
		password: newUser.password,
	  });
	  if (authErr) throw authErr;

	  // 2. Create Profile linked to the current workspace
	  if (authData?.user) {
		await supabase.from('profiles').insert({
		  id: authData.user.id,
		  name: newUser.name,
		  role: newUser.role,
		  workspace_id: workspace.id
		});
		
		alert('تم إنشاء الحساب بنجاح');
		setNewUser({ name: '', email: '', password: '', role: 'citizen' });
		
		// Refresh users
		const { data: profiles } = await supabase.from('profiles').select('*');
		if (profiles) setUsers(profiles);
	  }
	} catch (err) {
	  alert(err.message);
	}
  };

  const updateDeviceStatus = async (id, status) => {
	await supabase.from('trusted_devices').update({ status }).eq('id', id);
	const { data: dev } = await supabase.from('trusted_devices').select('*, profiles(name)').order('created_at', { ascending: false });
	if (dev) setDevices(dev);
  };

  if (!isAdmin) {
	return (
	  <div className="flex flex-col items-center justify-center h-full bg-slate-50 font-['Tajawal'] text-center">
		<ShieldAlert size={48} className="text-red-400 mb-4" />
		<h2 className="text-xl font-black text-slate-800 mb-2">غير مصرح بالدخول</h2>
		<p className="text-sm text-slate-500">هذه الصفحة مخصصة لمدراء النظام فقط.</p>
	  </div>
	);
  }

  return (
	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full font-['Tajawal'] overflow-y-auto pb-10" dir="rtl">
	  
	  {/* 1. Add User Form */}
	  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
		<div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
		  <UserPlus size={18} className="text-slate-500" />
		  <h4 className="text-sm font-extrabold text-slate-800">إضافة مستخدم جديد</h4>
		</div>
		<form onSubmit={handleCreateUser} className="p-6">
		  <div className="grid grid-cols-2 gap-4 mb-4">
			<div>
			  <label className="block text-xs font-bold text-slate-500 mb-1">الاسم</label>
			  <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-red-500" required />
			</div>
			<div>
			  <label className="block text-xs font-bold text-slate-500 mb-1">الصلاحية</label>
			  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-red-500">
				<option value="admin">إدمن</option>
				<option value="manager">مدير</option>
				<option value="citizen">مواطن</option>
			  </select>
			</div>
			<div>
			  <label className="block text-xs font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
			  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] outline-none focus:border-red-500" required />
			</div>
			<div>
			  <label className="block text-xs font-bold text-slate-500 mb-1">كلمة المرور</label>
			  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] outline-none focus:border-red-500" required />
			</div>
		  </div>
		  <button type="submit" className="w-full py-3 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all">
			إنشاء الحساب
		  </button>
		</form>
	  </div>

	  {/* 2. User Accounts List */}
	  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
		<div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
		  <ShieldAlert size={18} className="text-slate-500" />
		  <h4 className="text-sm font-extrabold text-slate-800">حسابات النظام</h4>
		</div>
		<ul className="max-h-[280px] overflow-y-auto">
		  {loading ? (
			<li className="p-4 text-center text-sm font-bold text-slate-500">جاري التحميل...</li>
		  ) : users.map(u => (
			<li key={u.id} className="p-4 flex justify-between items-center border-b border-slate-100 last:border-0 hover:bg-slate-50">
			  <div>
				<div className="text-sm font-bold text-slate-900">{u.name}</div>
				<div className="text-[10px] text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">{u.id.substring(0, 12)}...</div>
			  </div>
			  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-200' : u.role === 'manager' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
				{u.role}
			  </span>
			</li>
		  ))}
		</ul>
	  </div>

	  {/* 3. Trusted Devices */}
	  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
		<div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
		  <MonitorSmartphone size={18} className="text-slate-500" />
		  <h4 className="text-sm font-extrabold text-slate-800">الأجهزة والتصاريح الأمنية</h4>
		</div>
		<div className="overflow-x-auto max-h-[300px]">
		  <table className="w-full text-right border-collapse">
			<thead className="bg-slate-50 sticky top-0">
			  <tr>
				<th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">المستخدم / الجهاز</th>
				<th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">النظام / المتصفح</th>
				<th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">الموقع (IP)</th>
				<th className="py-3 px-4 text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200 text-center">الإجراء</th>
			  </tr>
			</thead>
			<tbody>
			  {loading ? (
				<tr><td colSpan="4" className="py-8 text-center text-sm font-bold text-slate-500">جاري التحميل...</td></tr>
			  ) : devices.length === 0 ? (
				<tr><td colSpan="4" className="py-8 text-center text-sm font-bold text-slate-500">لا توجد أجهزة مسجلة</td></tr>
			  ) : devices.map(d => (
				<tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
				  <td className="py-3 px-4">
					<div className="text-sm font-extrabold text-slate-900">{d.profiles?.name || 'مجهول'}</div>
					<div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-500">{d.device_uuid?.substring(0,8)}...</div>
				  </td>
				  <td className="py-3 px-4">
					<div className="text-xs font-bold text-slate-700">{d.device_model || '-'} / {d.os || '-'}</div>
					<div className="text-[10px] text-slate-500 mt-0.5">{d.browser || '-'}</div>
				  </td>
				  <td className="py-3 px-4">
					<div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-600">{d.country || '-'}</div>
					<div className="text-[11px] font-['IBM_Plex_Mono'] text-slate-500 mt-0.5">{d.ip_address || '-'}</div>
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
	  </div>

	  {/* 4. Session Logs */}
	  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
		<div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
		  <ActivitySquare size={18} className="text-slate-500" />
		  <h4 className="text-sm font-extrabold text-slate-800">سجل الجلسات (Activity Log)</h4>
		</div>
		<div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
		  {loading ? (
			 <div className="text-center text-sm font-bold text-slate-500 py-4">جاري التحميل...</div>
		  ) : logs.length === 0 ? (
			 <div className="text-center text-sm font-bold text-slate-500 py-4">لا توجد نشاطات مسجلة</div>
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
	  </div>

	</div>
  );
}