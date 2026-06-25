import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Building2, AlertCircle, Home } from 'lucide-react';

export default function Login() {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();

  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Verify workspace on mount
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
	  } catch {
		setError('عذراً، الرابط غير صحيح أو المجتمع غير موجود.');
	  } finally {
		setLoading(false);
	  }
	};
	verifyWorkspace();
  }, [workspaceSlug]);

  const handleLogin = async (e) => {
	e.preventDefault();
	setSubmitting(true);
	setError(null);

	try {
	  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
	  if (authError) throw authError;

	  // Tenant isolation check
	  const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('workspaces!inner(slug)')
		.eq('id', authData.user.id)
		.single();

	  if (profileError || profile.workspaces.slug !== workspaceSlug) {
		await supabase.auth.signOut();
		throw new Error('هذا الحساب لا ينتمي إلى هذا المجتمع السكني.');
	  }
	  // AuthContext will pick up the session and redirect
	} catch (err) {
	  setError(err.message || 'فشل تسجيل الدخول. تحقق من بياناتك.');
	  setSubmitting(false);
	}
  };

  // Initial loading state (workspace verification)
  if (loading && !workspaceName && !error) {
	return (
	  <>
		<style>{`
		  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
		  body { margin: 0; }
		`}</style>
		<div style={{ fontFamily: "'Tajawal', sans-serif" }} className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
		  <div className="flex flex-col items-center gap-4 text-slate-500">
			<div className="w-10 h-10 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
			<span className="text-sm font-bold">جاري التحقق من المجتمع…</span>
		  </div>
		</div>
	  </>
	);
  }

  return (
	<>
	  <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
		* { box-sizing: border-box; }
		body { margin: 0; }
		@keyframes fadeUp {
		  from { opacity: 0; transform: translateY(20px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		@keyframes shake {
		  0%,100% { transform: translateX(0); }
		  20%,60%  { transform: translateX(-6px); }
		  40%,80%  { transform: translateX(6px); }
		}
		.card-in   { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
		.shake     { animation: shake .4s cubic-bezier(.36,.07,.19,.97); }
		@media (prefers-reduced-motion: reduce) { .card-in, .shake { animation: none; } }
	  `}</style>

	  <div
		style={{ fontFamily: "'Tajawal', sans-serif" }}
		className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12"
		dir="rtl"
	  >
		{/* Back to workspace gate */}
		<Link
		  to="/gate"
		  className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
		>
		  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
		  تغيير المجتمع
		</Link>

		{/* Card */}
		<div className="card-in w-full max-w-[420px]">

		  {/* Logo */}
		  <div className="flex items-center gap-3 justify-center mb-8">
			<div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
			  <img
				src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png"
				alt="Logo"
				className="w-6 h-6 object-contain invert"
				onError={(e) => {
				  e.currentTarget.style.display = 'none';
				  e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
				}}
			  />
			</div>
			<span className="text-2xl font-black text-slate-900 tracking-tight">حصاد</span>
		  </div>

		  <div className={`bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden ${error ? 'shake' : ''}`} key={error}>
			{/* Top accent */}
			<div className="h-1 bg-gradient-to-l from-red-800 via-red-500 to-red-800" />

			<div className="p-8">
			  {/* Workspace badge */}
			  <div className="flex items-center justify-center gap-2 mb-6">
				<div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5">
				  <Building2 size={13} className="text-slate-500" />
				  <span className="text-xs font-black text-slate-700">
					{error ? 'خطأ في النظام' : (workspaceName || workspaceSlug)}
				  </span>
				</div>
			  </div>

			  {/* Heading */}
			  <div className="text-center mb-8">
				{error ? (
				  <>
					<h1 className="text-2xl font-black text-red-600 mb-1.5">تعذّر الوصول</h1>
					<p className="text-sm text-slate-500 font-medium">تحقق من الرابط أو تواصل مع مسؤول مجتمعك</p>
				  </>
				) : (
				  <>
					<h1 className="text-2xl font-black text-slate-900 mb-1.5">مرحباً بعودتك</h1>
					<p className="text-sm text-slate-500 font-medium">
					  سجّل دخولك للوصول إلى لوحة تحكم{' '}
					  <span className="font-black text-slate-700">{workspaceName}</span>
					</p>
				  </>
				)}
			  </div>

			  {error && !workspaceName ? (
				/* Workspace not found error state */
				<div className="space-y-4">
				  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
					<AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
					<p className="text-sm text-red-700 font-bold leading-relaxed">{error}</p>
				  </div>
				  <Link
					to="/gate"
					className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
				  >
					<ArrowLeft size={15} />
					العودة وتعديل المعرّف
				  </Link>
				  <Link
					to="/"
					className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
				  >
					<Home size={15} />
					الصفحة الرئيسية
				  </Link>
				</div>
			  ) : (
				/* Login form */
				<form onSubmit={handleLogin} className="space-y-4">
				  {/* Email */}
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">البريد الإلكتروني</label>
					<input
					  type="email"
					  value={email}
					  onChange={(e) => setEmail(e.target.value)}
					  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
					  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
					  placeholder="admin@domain.com"
					  dir="ltr"
					  required
					/>
				  </div>

				  {/* Password */}
				  <div>
					<label className="block text-xs font-black text-slate-500 mb-1.5">كلمة المرور</label>
					<div className="relative">
					  <input
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={{ fontFamily: showPassword ? undefined : "'IBM Plex Mono', monospace" }}
						className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all pl-11"
						placeholder={showPassword ? 'كلمة المرور' : '••••••••••'}
						dir="ltr"
						required
					  />
					  <button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
					  >
						{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
					  </button>
					</div>
				  </div>

				  {/* Inline error */}
				  {error && workspaceName && (
					<div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
					  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
					  <p className="text-sm text-red-700 font-bold leading-snug">{error}</p>
					</div>
				  )}

				  {/* Submit */}
				  <button
					type="submit"
					disabled={submitting}
					className="w-full h-12 bg-red-600 text-white rounded-xl font-bold text-[15px] hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-600/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
				  >
					{submitting ? (
					  <>
						<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						جاري التحقق…
					  </>
					) : 'تسجيل الدخول'}
				  </button>
				</form>
			  )}
			</div>
		  </div>

		  {/* Footer links */}
		  <div className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-400">
			<Link to="/" className="flex items-center gap-1 hover:text-slate-700 font-bold transition-colors">
			  <Home size={12} />
			  الرئيسية
			</Link>
			<span className="text-slate-200">|</span>
			<Link to="/gate" className="hover:text-slate-700 font-bold transition-colors">
			  تغيير المجتمع
			</Link>
			<span className="text-slate-200">|</span>
			<a href="mailto:support@operix-solutions.com" className="hover:text-slate-700 font-bold transition-colors">
			  الدعم الفني
			</a>
		  </div>
		</div>
	  </div>
	</>
  );
}