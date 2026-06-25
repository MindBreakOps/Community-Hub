import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function Login() {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("Supabase Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  // 1. Verify the workspace exists before showing the login form
  useEffect(() => {
	const verifyWorkspace = async () => {
	  try {
		const { data, error } = await supabase
		  .from('workspaces')
		  .select('name')
		  .eq('slug', workspaceSlug)
		  .single();

		if (error || !data) throw new Error('المجتمع غير موجود');
		
		setWorkspaceName(data.name);
	  } catch (err) {
		setError('عذراً، الرابط غير صحيح أو المجتمع غير موجود.');
	  } finally {
		setLoading(false);
	  }
	};

	verifyWorkspace();
  }, [workspaceSlug]);

  const handleLogin = async (e) => {
	e.preventDefault();
	setLoading(true);
	setError(null);

	try {
	  // 2. Authenticate globally
	  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
		email,
		password,
	  });

	  if (authError) throw authError;

	  // 3. TENANT ISOLATION CHECK
	  // Verify this user's profile is actually linked to THIS workspace slug
	  const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('workspaces!inner(slug)')
		.eq('id', authData.user.id)
		.single();

	  if (profileError || profile.workspaces.slug !== workspaceSlug) {
		// If they don't belong here, sign them out immediately
		await supabase.auth.signOut();
		throw new Error('هذا الحساب لا ينتمي إلى هذا المجتمع السكني.');
	  }
	  
	  // If successful, the AuthContext will detect the session and AppRoutes will redirect to dashboard
	  
	} catch (err) {
	  setError(err.message || 'فشل تسجيل الدخول');
	  setLoading(false);
	}
  };

  if (loading && !workspaceName && !error) {
	return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white font-['Tajawal']">جاري التحقق من المجتمع...</div>;
  }

  return (
	<div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center overflow-hidden font-['Tajawal']" dir="rtl">
	  <div className="absolute inset-0 overflow-hidden pointer-events-none">
		<div className="absolute top-[-30%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.12)_0%,transparent_70%)] animate-[pulse_8s_ease-in-out_infinite_alternate]" />
		<div className="absolute bottom-[-20%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] animate-[pulse_10s_ease-in-out_infinite_alternate-reverse]" />
		<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
	  </div>

	  <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 w-full max-w-[420px] mx-4 shadow-2xl">
		<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-800 via-red-500 to-red-800 rounded-t-2xl bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
		
		<div className="w-[72px] h-[72px] bg-white rounded-xl flex items-center justify-center mx-auto mb-5 ring-4 ring-red-500/15 shadow-md">
		   <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-12 h-12 object-contain" />
		</div>
		
		{/* Dynamic Workspace Name */}
		<div className="text-[26px] font-black text-white text-center tracking-tight">
		  {error ? 'خطأ في النظام' : workspaceName}
		</div>
		<div className="text-[11px] text-white/35 text-center mt-1 tracking-[3px] uppercase font-['IBM_Plex_Mono'] mb-8">
		  Hased Community
		</div>

		{error ? (
		  <div className="text-center">
			<div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg mb-6 font-bold leading-relaxed">
			  {error}
			</div>
			<Link to="/" className="text-white/50 hover:text-white text-sm transition-colors border-b border-white/20 pb-0.5">
			  العودة للصفحة الرئيسية
			</Link>
		  </div>
		) : (
		  <form onSubmit={handleLogin}>
			<div className="mb-4">
			  <label className="block text-xs font-bold text-white/45 mb-1.5 tracking-wide">البريد الإلكتروني</label>
			  <input 
				type="email" 
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm font-['IBM_Plex_Mono'] outline-none focus:bg-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
				placeholder="admin@domain.com"
				required
			  />
			</div>
			
			<div className="mb-8">
			  <label className="block text-xs font-bold text-white/45 mb-1.5 tracking-wide">كلمة المرور</label>
			  <input 
				type="password" 
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white font-['IBM_Plex_Mono'] text-lg tracking-[4px] outline-none focus:bg-white/10 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
				placeholder="••••••••"
				required
			  />
			</div>

			<button 
			  type="submit" 
			  disabled={loading}
			  className="w-full py-3 bg-gradient-to-br from-red-500 to-red-800 text-white font-extrabold text-[15px] rounded-lg shadow-[0_8px_24px_rgba(220,38,38,0.22)] hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(220,38,38,0.35)] active:translate-y-0 transition-all disabled:opacity-50"
			>
			  {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
			</button>
		  </form>
		)}
	  </div>
	</div>
  );
}