import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Home as HomeIcon, TrendingDown, UsersRound, TrendingUp, RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

/* ─── Skeleton shimmer ─── */
const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />
);

/* ─── Individual stat card ─── */
function StatCard({ icon: Icon, label, value, sub, trend, accentColor, iconBg, iconColor, loading }) {
  return (
	<div
	  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
	  style={{ fontFamily: "'Tajawal', sans-serif" }}
	  dir="rtl"
	>
	  {/* Top accent bar */}
	  <div className="h-[3px]" style={{ background: accentColor }} />

	  <div className="p-5">
		{/* Icon + label row */}
		<div className="flex items-center justify-between mb-4">
		  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
			<Icon size={19} className={iconColor} />
		  </div>
		  {trend && !loading && (
			<div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
			  <TrendingUp size={10} />
			  {trend}
			</div>
		  )}
		</div>

		{/* Value */}
		{loading ? (
		  <>
			<Skeleton className="h-8 w-20 mb-2" />
			<Skeleton className="h-3 w-28" />
		  </>
		) : (
		  <>
			<div
			  className="text-[32px] font-black text-slate-900 leading-none mb-1.5 tracking-tight"
			  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
			>
			  {value}
			</div>
			<div className="text-[11px] font-bold text-slate-400 leading-snug">{label}</div>
			{sub && <div className="text-[10px] text-slate-300 mt-0.5">{sub}</div>}
		  </>
		)}
	  </div>
	</div>
  );
}

/* ─── Chart card wrapper ─── */
function ChartCard({ title, badge, children, loading, height = 220 }) {
  return (
	<div
	  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
	  style={{ fontFamily: "'Tajawal', sans-serif" }}
	  dir="rtl"
	>
	  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
		<h3 className="text-sm font-black text-slate-900">{title}</h3>
		<span
		  className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-widest"
		  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
		>
		  {badge}
		</span>
	  </div>
	  <div className="p-6">
		{loading ? (
		  <div className="flex flex-col gap-3">
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-4/5" />
			<Skeleton className="h-4 w-3/5" />
			<Skeleton className="h-4 w-full" />
		  </div>
		) : (
		  <div style={{ height }}>
			{children}
		  </div>
		)}
	  </div>
	</div>
  );
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, owners: 0, familyAvg: 0, lowIncome: 0 });
  const [chartData, setChartData] = useState({ locations: {}, incomes: {} });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
	if (isRefresh) setRefreshing(true);
	else setLoading(true);

	try {
	  const { data, error } = await supabase
		.from('residents')
		.select('location, housing_type, income_level, family_members_count');

	  if (error) throw error;
	  if (!data || data.length === 0) return;

	  const total         = data.length;
	  const ownersCount   = data.filter(r => r.housing_type === 'مالك').length;
	  const lowIncCount   = data.filter(r => r.income_level === 'احمر').length;
	  const totalFam      = data.reduce((a, r) => a + (r.family_members_count || 1), 0);

	  setStats({
		total,
		owners:    Math.round((ownersCount / total) * 100),
		familyAvg: Math.round(totalFam / total),
		lowIncome: Math.round((lowIncCount / total) * 100),
	  });

	  const locCounts = {};
	  const incCounts = { 'اخضر': 0, 'اصفر': 0, 'احمر': 0 };

	  data.forEach(r => {
		if (r.location) locCounts[r.location] = (locCounts[r.location] || 0) + 1;
		if (r.income_level && incCounts[r.income_level] !== undefined) incCounts[r.income_level]++;
	  });

	  setChartData({ locations: locCounts, incomes: incCounts });
	  setLastUpdated(new Date());
	} catch (err) {
	  console.error('Dashboard fetch error:', err.message);
	} finally {
	  setLoading(false);
	  setRefreshing(false);
	}
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Chart configs ── */
  const locationChartConfig = {
	data: {
	  labels: Object.keys(chartData.locations).length
		? Object.keys(chartData.locations)
		: ['لا توجد بيانات'],
	  datasets: [{
		data: Object.keys(chartData.locations).length
		  ? Object.values(chartData.locations)
		  : [0],
		backgroundColor: ['#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
		borderRadius: 8,
		borderSkipped: false,
	  }],
	},
	options: {
	  responsive: true,
	  maintainAspectRatio: false,
	  plugins: { legend: { display: false }, tooltip: { rtl: true } },
	  scales: {
		x: {
		  grid: { display: false },
		  ticks: { font: { family: 'Tajawal', size: 12, weight: '700' }, color: '#64748b' },
		  border: { display: false },
		},
		y: {
		  grid: { color: '#f1f5f9', drawBorder: false },
		  ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#cbd5e1', stepSize: 1 },
		  border: { display: false },
		},
	  },
	},
  };

  const incomeChartConfig = {
	data: {
	  labels: ['مستقر (أخضر)', 'متوسط (أصفر)', 'ضعيف (أحمر)'],
	  datasets: [{
		data: [
		  chartData.incomes['اخضر'] || 0,
		  chartData.incomes['اصفر'] || 0,
		  chartData.incomes['احمر'] || 0,
		],
		backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
		borderWidth: 0,
		hoverOffset: 8,
	  }],
	},
	options: {
	  responsive: true,
	  maintainAspectRatio: false,
	  cutout: '68%',
	  plugins: {
		legend: {
		  display: true,
		  position: 'bottom',
		  labels: {
			font: { family: 'Tajawal', size: 11, weight: '700' },
			color: '#64748b',
			padding: 16,
			boxWidth: 8,
			boxHeight: 8,
			borderRadius: 4,
		  },
		},
		tooltip: { rtl: true },
	  },
	},
  };

  const statCards = [
	{
	  icon: Users,
	  label: 'إجمالي السكان',
	  value: stats.total.toLocaleString('en-SA'),
	  sub: 'مقيد في السجل المدني',
	  accentColor: '#1e293b',
	  iconBg: 'bg-slate-100',
	  iconColor: 'text-slate-700',
	},
	{
	  icon: HomeIcon,
	  label: 'الملاك',
	  value: `${stats.owners}%`,
	  sub: 'نسبة أصحاب المنازل',
	  trend: '+2.1%',
	  accentColor: '#10b981',
	  iconBg: 'bg-emerald-50',
	  iconColor: 'text-emerald-600',
	},
	{
	  icon: UsersRound,
	  label: 'متوسط الأسرة',
	  value: stats.familyAvg,
	  sub: 'فرد لكل أسرة',
	  accentColor: '#3b82f6',
	  iconBg: 'bg-blue-50',
	  iconColor: 'text-blue-600',
	},
	{
	  icon: TrendingDown,
	  label: 'ضعف الدخل',
	  value: `${stats.lowIncome}%`,
	  sub: 'شرائح منخفضة الدخل',
	  accentColor: '#ef4444',
	  iconBg: 'bg-red-50',
	  iconColor: 'text-red-600',
	},
  ];

  const lastUpdatedStr = lastUpdated
	? lastUpdated.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
	: null;

  return (
	<div
	  className="flex flex-col gap-6 pb-8"
	  style={{ fontFamily: "'Tajawal', sans-serif" }}
	  dir="rtl"
	>
	  {/* ── Section header ── */}
	  <div className="flex items-center justify-between">
		<div>
		  <h2 className="text-xl font-black text-slate-900">نظرة عامة</h2>
		  <p className="text-sm text-slate-400 font-medium mt-0.5">
			{lastUpdatedStr
			  ? `آخر تحديث: ${lastUpdatedStr}`
			  : 'جاري تحميل البيانات…'}
		  </p>
		</div>
		<button
		  onClick={() => fetchData(true)}
		  disabled={refreshing || loading}
		  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 transition-all hover:shadow-sm disabled:opacity-40"
		>
		  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
		  تحديث
		</button>
	  </div>

	  {/* ── Stat cards ── */}
	  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{statCards.map((card, i) => (
		  <StatCard key={i} {...card} loading={loading} />
		))}
	  </div>

	  {/* ── Charts ── */}
	  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
		{/* Bar chart — wider */}
		<div className="lg:col-span-3">
		  <ChartCard title="التوزيع الجغرافي" badge="GEOGRAPHIC" loading={loading} height={220}>
			<Bar data={locationChartConfig.data} options={locationChartConfig.options} />
		  </ChartCard>
		</div>

		{/* Doughnut chart — narrower */}
		<div className="lg:col-span-2">
		  <ChartCard title="مستويات الدخل" badge="INCOME" loading={loading} height={220}>
			<Doughnut data={incomeChartConfig.data} options={incomeChartConfig.options} />
		  </ChartCard>
		</div>
	  </div>

	  {/* ── Quick summary row ── */}
	  {!loading && (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
		  {[
			{
			  label: 'الوحدات المشغولة',
			  value: `${stats.owners}%`,
			  desc: 'من إجمالي الوحدات المسجلة',
			  color: 'text-emerald-600',
			  bg: 'bg-emerald-50',
			  border: 'border-emerald-100',
			},
			{
			  label: 'المستأجرون',
			  value: `${100 - stats.owners}%`,
			  desc: 'نسبة المستأجرين',
			  color: 'text-blue-600',
			  bg: 'bg-blue-50',
			  border: 'border-blue-100',
			},
			{
			  label: 'الفئات الهشة',
			  value: `${stats.lowIncome}%`,
			  desc: 'تحتاج إلى دعم اجتماعي',
			  color: 'text-red-600',
			  bg: 'bg-red-50',
			  border: 'border-red-100',
			},
		  ].map((s, i) => (
			<div
			  key={i}
			  className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-start gap-4`}
			>
			  <div className="flex-1 min-w-0">
				<div className="text-[11px] font-black text-slate-500 mb-1">{s.label}</div>
				<div
				  className={`text-2xl font-black ${s.color} leading-none mb-1`}
				  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
				>
				  {s.value}
				</div>
				<div className="text-[11px] text-slate-400 font-medium">{s.desc}</div>
			  </div>
			</div>
		  ))}
		</div>
	  )}
	</div>
  );
}