import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, EyeOff, Building2, AlertCircle, Home,
  Map, ShieldCheck, FileText, Sparkles,
} from 'lucide-react';

/* ── Signature element: an animated isometric residential block ──
   This stands in for the system itself — GIS-linked units, live
   occupancy, and identity — rather than a generic icon. Windows
   light up in sequence; one unit pulses as "selected" like the
   GIS/E-ID views elsewhere in the product. */
function CommunityBlock({ size = 280 }) {
  const units = useMemo(
	() => [
	  { x: 40, y: 150, h: 70, lit: [0, 1] },
	  { x: 110, y: 120, h: 100, lit: [1, 0, 1] },
	  { x: 190, y: 150, h: 70, lit: [1] },
	  { x: 250, y: 100, h: 120, lit: [0, 1, 0, 1] },
	],
	[]
  );

  return (
	<svg
	  viewBox="0 0 340 260"
	  width={size}
	  height={size * (260 / 340)}
	  className="community-block"
	  role="img"
	  aria-label="رسم توضيحي لمجمع سكني رقمي"
	>
	  <defs>
		<linearGradient id="blockFace" x1="0" y1="0" x2="0" y2="1">
		  <stop offset="0%" stopColor="#2a2118" />
		  <stop offset="100%" stopColor="#1a140d" />
		</linearGradient>
		<linearGradient id="blockRoof" x1="0" y1="0" x2="1" y2="0">
		  <stop offset="0%" stopColor="#dc2626" />
		  <stop offset="100%" stopColor="#7f1d1d" />
		</linearGradient>
		<radialGradient id="glow" cx="50%" cy="50%" r="50%">
		  <stop offset="0%" stopColor="#f8b84a" stopOpacity="0.9" />
		  <stop offset="100%" stopColor="#f8b84a" stopOpacity="0" />
		</radialGradient>
	  </defs>

	  <ellipse cx="170" cy="228" rx="150" ry="18" fill="#0d0a06" opacity="0.5" />

	  <path
		d="M 60 210 L 130 210 L 210 210 L 275 210"
		stroke="#dc2626"
		strokeOpacity="0.35"
		strokeWidth="2"
		strokeDasharray="1 7"
		strokeLinecap="round"
		className="gis-path"
	  />

	  {units.map((u, i) => (
		<g key={i} className="unit" style={{ animationDelay: `${i * 0.12}s` }}>
		  <rect x={u.x} y={u.y} width="52" height={u.h} rx="4" fill="url(#blockFace)" stroke="#3a2f22" strokeWidth="1" />
		  <path d={`M ${u.x - 4} ${u.y} L ${u.x + 26} ${u.y - 20} L ${u.x + 56} ${u.y} Z`} fill="url(#blockRoof)" />
		  {u.lit.map((on, wi) => (
			<rect
			  key={wi}
			  x={u.x + 10 + (wi % 2) * 22}
			  y={u.y + 16 + Math.floor(wi / 2) * 24}
			  width="12"
			  height="14"
			  rx="2"
			  fill={on ? '#f8b84a' : '#332a1e'}
			  className={on ? 'window-lit' : ''}
			  style={{ animationDelay: `${(i * 3 + wi) * 0.22}s` }}
			/>
		  ))}
		  <circle cx={u.x + 26} cy="210" r={i === 1 ? 5 : 3} fill={i === 1 ? '#dc2626' : '#5a4a35'} className={i === 1 ? 'pulse-dot' : ''} />
		</g>
	  ))}

	  <circle cx="160" cy="170" r="60" fill="url(#glow)" opacity="0.25" className="ambient-drift" />
	</svg>
  );
}

const infoPoints = [
  { icon: Map, text: 'ربط كل وحدة سكنية بموقعها الجغرافي الدقيق عبر خرائط GIS تفاعلية' },
  { icon: ShieldCheck, text: 'هويات رقمية مشفرة وصلاحيات دقيقة لكل مستخدم في المجتمع' },
  { icon: FileText, text: 'إصدار الشهادات والوثائق الرسمية المعتمدة بضغطة واحدة' },
];

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
  const [focusedField, setFocusedField] = useState(null);

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

  const fontImport = "@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@400;600&display=swap');";

  if (loading && !workspaceName && !error) {
	return (
	  <>
		<style>{`${fontImport} body { margin: 0; }`}</style>
		<div style={{ fontFamily: "'Tajawal', sans-serif" }} className="min-h-screen bg-[#0d0a06] flex items-center justify-center" dir="rtl">
		  <div className="flex flex-col items-center gap-4 text-amber-100/60">
			<div className="w-10 h-10 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
			<span className="text-sm font-bold">جاري التحقق من المجتمع…</span>
		  </div>
		</div>
	  </>
	);
  }

  return (
	<>
	  <style>{`
		${fontImport}
		* { box-sizing: border-box; }
		body { margin: 0; }

		@keyframes fadeUp {
		  from { opacity: 0; transform: translateY(20px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		@keyframes fadeIn {
		  from { opacity: 0; }
		  to   { opacity: 1; }
		}
		@keyframes shake {
		  0%,100% { transform: translateX(0); }
		  20%,60%  { transform: translateX(-6px); }
		  40%,80%  { transform: translateX(6px); }
		}
		@keyframes windowLit {
		  0%, 100% { opacity: 1; filter: drop-shadow(0 0 3px rgba(248,184,74,0.8)); }
		  50%      { opacity: 0.55; filter: drop-shadow(0 0 1px rgba(248,184,74,0.3)); }
		}
		@keyframes pulseDot {
		  0%   { r: 3; opacity: 1; }
		  70%  { r: 9; opacity: 0; }
		  100% { r: 3; opacity: 0; }
		}
		@keyframes ambientDrift {
		  0%, 100% { transform: translate(0,0) scale(1); }
		  50%      { transform: translate(6px,-8px) scale(1.06); }
		}
		@keyframes gisPathFlow {
		  to { stroke-dashoffset: -16; }
		}
		@keyframes unitRise {
		  from { opacity: 0; transform: translateY(14px); }
		  to   { opacity: 1; transform: translateY(0); }
		}
		@keyframes panelGlow {
		  0%, 100% { opacity: 0.5; }
		  50%      { opacity: 0.85; }
		}

		.card-in    { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
		.panel-in   { animation: fadeIn .7s ease both; }
		.shake      { animation: shake .4s cubic-bezier(.36,.07,.19,.97); }

		.unit             { animation: unitRise .55s cubic-bezier(.16,1,.3,1) both; transform-origin: bottom; }
		.window-lit       { animation: windowLit 3.4s ease-in-out infinite; }
		.pulse-dot        { animation: pulseDot 2.2s cubic-bezier(0,.6,.4,1) infinite; transform-origin: center; }
		.ambient-drift    { animation: ambientDrift 6s ease-in-out infinite; }
		.gis-path         { animation: gisPathFlow 1.4s linear infinite; }
		.glow-orb         { animation: panelGlow 5s ease-in-out infinite; }

		.field-input {
		  transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease, transform .15s ease;
		}
		.field-input:focus { transform: translateY(-1px); }

		.info-point {
		  animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both;
		}

		@media (prefers-reduced-motion: reduce) {
		  .card-in, .panel-in, .shake, .unit, .window-lit, .pulse-dot,
		  .ambient-drift, .gis-path, .glow-orb, .info-point { animation: none !important; }
		  .field-input:focus { transform: none; }
		}

		@media (max-width: 899px) {
		  .login-info-panel { display: none; }
		}
	  `}</style>

	  <div style={{ fontFamily: "'Tajawal', sans-serif" }} className="min-h-screen bg-[#0d0a06] flex" dir="rtl">

		{/* ══════════ LEFT: dark info / brand panel ══════════ */}
		<div className="login-info-panel relative w-[46%] max-w-[620px] overflow-hidden flex-col justify-between p-14 hidden md:flex">
		  <div className="absolute inset-0 bg-[#120d08]" />
		  <div
			className="absolute inset-0 opacity-[0.05]"
			style={{
			  backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
			  backgroundSize: '36px 36px',
			}}
		  />
		  <div className="glow-orb absolute -top-20 -left-20 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle,rgba(220,38,38,0.25),transparent 70%)' }} />
		  <div className="glow-orb absolute bottom-0 right-0 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)', animationDelay: '1.4s' }} />

		  <div className="panel-in relative z-10">
			<div className="flex items-center gap-3 mb-16">
			  <div className="w-10 h-10 bg-white/10 backdrop-blur border border-white/10 rounded-xl flex items-center justify-center">
				<Building2 size={18} className="text-amber-100" />
			  </div>
			  <span style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-white tracking-tight">حصاد</span>
			</div>

			<div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-amber-100/70">
			  <Sparkles size={12} className="text-amber-300" />
			  النظام المؤسسي لإدارة المجتمعات السكنية
			</div>

			<h1
			  style={{ fontFamily: "'Reem Kufi', sans-serif" }}
			  className="text-[40px] leading-[1.35] text-white mb-5 max-w-md"
			>
			  كل مجتمعك السكني،<br />في لوحة واحدة
			</h1>
			<p className="text-[15px] text-amber-100/50 font-medium leading-relaxed max-w-sm mb-12">
			  بيانات حية، خرائط جغرافية دقيقة، وهويات رقمية موثوقة — كلها متصلة في نظام واحد مصمم للجان الأحياء والمجمعات.
			</p>
		  </div>

		  <div className="panel-in relative z-10 flex justify-center py-4" style={{ animationDelay: '.15s' }}>
			<CommunityBlock size={300} />
		  </div>

		  <div className="panel-in relative z-10 space-y-4" style={{ animationDelay: '.25s' }}>
			{infoPoints.map((p, i) => (
			  <div
				key={i}
				className="info-point flex items-start gap-3"
				style={{ animationDelay: `${0.35 + i * 0.1}s` }}
			  >
				<div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
				  <p.icon size={14} className="text-red-400" />
				</div>
				<p className="text-[13px] text-amber-100/60 font-medium leading-relaxed pt-1">{p.text}</p>
			  </div>
			))}
		  </div>
		</div>

		{/* ══════════ RIGHT: login form ══════════ */}
		<div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-slate-50 relative">
		  <Link
			to="/gate"
			className="absolute top-8 right-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
		  >
			<ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
			تغيير المجتمع
		  </Link>

		  <div className="card-in w-full max-w-[420px]">

			<div className="flex md:hidden items-center gap-3 justify-center mb-8">
			  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
				<Building2 size={18} className="text-white" />
			  </div>
			  <span style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-slate-900 tracking-tight">حصاد</span>
			</div>

			<div className={`bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden ${error ? 'shake' : ''}`} key={error}>
			  <div className="h-1 bg-gradient-to-l from-red-800 via-red-500 to-red-800" />

			  <div className="p-8">
				<div className="flex items-center justify-center gap-2 mb-6">
				  <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5">
					<Building2 size={13} className="text-slate-500" />
					<span className="text-xs font-black text-slate-700">
					  {error ? 'خطأ في النظام' : (workspaceName || workspaceSlug)}
					</span>
				  </div>
				</div>

				<div className="text-center mb-8">
				  {error ? (
					<>
					  <h1 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-red-600 mb-1.5">تعذّر الوصول</h1>
					  <p className="text-sm text-slate-500 font-medium">تحقق من الرابط أو تواصل مع مسؤول مجتمعك</p>
					</>
				  ) : (
					<>
					  <h1 style={{ fontFamily: "'Reem Kufi', sans-serif" }} className="text-2xl text-slate-900 mb-1.5">مرحباً بعودتك</h1>
					  <p className="text-sm text-slate-500 font-medium">
						سجّل دخولك للوصول إلى لوحة تحكم{' '}
						<span className="font-black text-slate-700">{workspaceName}</span>
					  </p>
					</>
				  )}
				</div>

				{error && !workspaceName ? (
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
				  <form onSubmit={handleLogin} className="space-y-4">
					<div>
					  <label className="block text-xs font-black text-slate-500 mb-1.5">البريد الإلكتروني</label>
					  <input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onFocus={() => setFocusedField('email')}
						onBlur={() => setFocusedField(null)}
						style={{ fontFamily: "'IBM Plex Mono', monospace" }}
						className={`field-input w-full h-11 bg-slate-50 border rounded-xl px-4 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/15 ${focusedField === 'email' ? 'border-red-500 shadow-sm' : 'border-slate-200'}`}
						placeholder="admin@domain.com"
						dir="ltr"
						required
					  />
					</div>

					<div>
					  <label className="block text-xs font-black text-slate-500 mb-1.5">كلمة المرور</label>
					  <div className="relative">
						<input
						  type={showPassword ? 'text' : 'password'}
						  value={password}
						  onChange={(e) => setPassword(e.target.value)}
						  onFocus={() => setFocusedField('password')}
						  onBlur={() => setFocusedField(null)}
						  style={{ fontFamily: showPassword ? undefined : "'IBM Plex Mono', monospace" }}
						  className={`field-input w-full h-11 bg-slate-50 border rounded-xl px-4 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/15 pl-11 ${focusedField === 'password' ? 'border-red-500 shadow-sm' : 'border-slate-200'}`}
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

					{error && workspaceName && (
					  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
						<AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
						<p className="text-sm text-red-700 font-bold leading-snug">{error}</p>
					  </div>
					)}

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
	  </div>
	</>
  );
}