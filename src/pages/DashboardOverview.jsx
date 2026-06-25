import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Home as HomeIcon, TrendingDown, UsersRound } from 'lucide-react';
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

// Register Chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, owners: 0, familyAvg: 0, lowIncome: 0 });
  const [chartData, setChartData] = useState({ locations: {}, incomes: {} });

  useEffect(() => {
	const fetchStatsAndCharts = async () => {
	  setLoading(true);
	  try {
		// Fetch all residents for the current tenant (RLS handles isolation)
		const { data, error } = await supabase
		  .from('residents')
		  .select('location, housing_type, income_level, family_members_count');

		if (error) throw error;
		if (!data || data.length === 0) {
		  setLoading(false);
		  return;
		}

		// 1. Calculate Top Stats
		const total = data.length;
		const ownersCount = data.filter(r => r.housing_type === 'مالك').length;
		const lowIncomeCount = data.filter(r => r.income_level === 'احمر').length;
		const totalFamilyMembers = data.reduce((acc, curr) => acc + (curr.family_members_count || 1), 0);

		setStats({
		  total,
		  owners: Math.round((ownersCount / total) * 100),
		  familyAvg: Math.round(totalFamilyMembers / total),
		  lowIncome: Math.round((lowIncomeCount / total) * 100)
		});

		// 2. Calculate Chart Data
		const locCounts = {};
		const incCounts = { 'اخضر': 0, 'اصفر': 0, 'احمر': 0 };

		data.forEach(r => {
		  // Location groupings
		  if (r.location) {
			locCounts[r.location] = (locCounts[r.location] || 0) + 1;
		  }
		  // Income groupings
		  if (r.income_level && incCounts[r.income_level] !== undefined) {
			incCounts[r.income_level]++;
		  }
		});

		setChartData({ locations: locCounts, incomes: incCounts });
	  } catch (error) {
		console.error('Error fetching dashboard stats:', error.message);
	  } finally {
		setLoading(false);
	  }
	};

	fetchStatsAndCharts();
  }, []);

  // --- Chart Configurations ---
  const locationChartConfig = {
	data: {
	  labels: Object.keys(chartData.locations).length ? Object.keys(chartData.locations) : ['لا توجد بيانات'],
	  datasets: [{
		data: Object.keys(chartData.locations).length ? Object.values(chartData.locations) : [0],
		backgroundColor: ['#0F172A', '#334155', '#64748B', '#94A3B8'],
		borderRadius: 6,
		borderSkipped: false,
	  }],
	},
	options: {
	  responsive: true,
	  maintainAspectRatio: false,
	  plugins: { legend: { display: false } },
	  scales: {
		x: { grid: { display: false }, ticks: { font: { family: 'Tajawal', size: 13 }, color: '#64748B' } },
		y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'IBM Plex Mono', size: 11 }, color: '#94A3B8' } }
	  }
	}
  };

  const incomeChartConfig = {
	data: {
	  labels: ['مستقر', 'متوسط', 'ضعيف'],
	  datasets: [{
		data: [chartData.incomes['اخضر'] || 0, chartData.incomes['اصفر'] || 0, chartData.incomes['احمر'] || 0],
		backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
		borderWidth: 0,
		hoverOffset: 6
	  }]
	},
	options: {
	  responsive: true,
	  maintainAspectRatio: false,
	  cutout: '65%',
	  plugins: {
		legend: {
		  display: true,
		  position: 'bottom',
		  labels: { font: { family: 'Tajawal', size: 12 }, color: '#475569', padding: 16, boxWidth: 10, boxHeight: 10, borderRadius: 5 }
		}
	  }
	}
  };

  // --- Sub-components ---
  const StatCard = ({ icon: Icon, label, value, sub, colorClass, iconClass }) => (
	<div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all font-['Tajawal']" dir="rtl">
	  <div className={`absolute top-0 right-0 left-0 h-1 ${colorClass}`} />
	  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconClass}`}>
		<Icon size={20} />
	  </div>
	  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</div>
	  <div className="text-3xl font-black text-slate-900 font-['IBM_Plex_Mono'] tracking-tight leading-none mb-1.5">
		{loading ? '...' : value}
	  </div>
	  <div className="text-[11px] font-semibold text-slate-500">{sub}</div>
	</div>
  );

  return (
	<div className="flex flex-col gap-6 h-full overflow-y-auto pb-6 font-['Tajawal']" dir="rtl">
	  {/* Top Stat Cards */}
	  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
		<StatCard 
		  icon={Users} label="إجمالي السكان" value={stats.total} sub="مقيد في السجل المدني"
		  colorClass="bg-slate-800" iconClass="bg-slate-100 text-slate-700" 
		/>
		<StatCard 
		  icon={HomeIcon} label="الملاك" value={`${stats.owners}%`} sub="نسبة أصحاب المنازل"
		  colorClass="bg-emerald-500" iconClass="bg-emerald-50 text-emerald-600" 
		/>
		<StatCard 
		  icon={UsersRound} label="متوسط الأسرة" value={stats.familyAvg} sub="فرد لكل أسرة"
		  colorClass="bg-blue-500" iconClass="bg-blue-50 text-blue-600" 
		/>
		<StatCard 
		  icon={TrendingDown} label="ضعف الدخل" value={`${stats.lowIncome}%`} sub="شرائح منخفضة الدخل"
		  colorClass="bg-red-500" iconClass="bg-red-50 text-red-600" 
		/>
	  </div>

	  {/* Charts Grid */}
	  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
		
		{/* Location Chart */}
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
		  <div className="flex items-center justify-between mb-6">
			<h3 className="text-sm font-extrabold text-slate-900">التوزيع الجغرافي</h3>
			<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-['IBM_Plex_Mono']">GEOGRAPHIC</span>
		  </div>
		  <div className="relative h-[200px] w-full">
			{loading ? (
			  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">جاري تحميل المخطط...</div>
			) : (
			  <Bar data={locationChartConfig.data} options={locationChartConfig.options} />
			)}
		  </div>
		</div>

		{/* Income Chart */}
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
		  <div className="flex items-center justify-between mb-6">
			<h3 className="text-sm font-extrabold text-slate-900">مستويات الدخل</h3>
			<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-['IBM_Plex_Mono']">INCOME</span>
		  </div>
		  <div className="relative h-[200px] w-full">
			{loading ? (
			  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">جاري تحميل المخطط...</div>
			) : (
			  <Doughnut data={incomeChartConfig.data} options={incomeChartConfig.options} />
			)}
		  </div>
		</div>

	  </div>
	</div>
  );
}