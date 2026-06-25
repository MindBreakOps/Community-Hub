import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search } from 'lucide-react';

export default function VirtualMap() {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
	const fetchResidents = async () => {
	  const { data } = await supabase.from('residents').select('id, full_name, house_number, status');
	  if (data) setResidents(data);
	};
	fetchResidents();
  }, []);

  // Map Dragging Logic
  const handleMouseDown = (e) => {
	setIsDragging(true);
	dragStart.current = {
	  x: e.pageX - mapRef.current.offsetLeft,
	  y: e.pageY - mapRef.current.offsetTop,
	  scrollLeft: mapRef.current.scrollLeft,
	  scrollTop: mapRef.current.scrollTop
	};
  };

  const handleMouseMove = (e) => {
	if (!isDragging) return;
	e.preventDefault();
	const x = e.pageX - mapRef.current.offsetLeft;
	const y = e.pageY - mapRef.current.offsetTop;
	mapRef.current.scrollLeft = dragStart.current.scrollLeft - (x - dragStart.current.x);
	mapRef.current.scrollTop = dragStart.current.scrollTop - (y - dragStart.current.y);
  };

  // Find resident by plot number
  const getResidentByPlot = (plotNum) => {
	return residents.find(r => r.house_number && String(r.house_number).match(/\d+/)?.[0] === String(plotNum));
  };

  const handlePlotClick = (plotNum) => {
	setSearchQuery(String(plotNum));
	setSelectedPlot(plotNum);
  };

  // Filter for sidebar
  const searchResult = searchQuery ? getResidentByPlot(searchQuery.match(/\d+/)?.[0]) : null;

  return (
	<div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-108px)] font-['Tajawal']" dir="rtl">
	  
	  {/* Sidebar Controls */}
	  <div className="w-full lg:w-[320px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm shrink-0 overflow-hidden z-10">
		<div className="p-5 border-b border-slate-200 bg-slate-50">
		  <h3 className="text-base font-black text-slate-900 mb-1">الخريطة الذكية (Virtual GIS)</h3>
		  <p className="text-[11px] text-slate-500">ابحث برقم القطعة أو اضغط عليها في الخريطة.</p>
		  
		  <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-bold text-slate-600">
			<div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#5ba3d9] border border-blue-200 rounded-sm" /> سكني</div>
			<div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#e07b39] border border-orange-200 rounded-sm" /> تجاري</div>
			<div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#3db87a] border border-emerald-200 rounded-sm" /> خدمات</div>
			<div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> مسجلة</div>
		  </div>
		</div>

		<div className="p-5 overflow-y-auto flex-1 bg-white">
		  <div className="relative mb-4">
			<Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
			<input 
			  type="text" 
			  value={searchQuery}
			  onChange={(e) => {
				setSearchQuery(e.target.value);
				setSelectedPlot(e.target.value.match(/\d+/)?.[0] || null);
			  }}
			  placeholder="رقم القطعة (مثال: 145)" 
			  className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
			/>
		  </div>

		  {searchQuery && !searchResult ? (
			<div className="p-6 text-center text-red-500 text-sm font-bold bg-red-50 rounded-xl border border-red-100">
			  هذه القطعة غير مسجلة لأي مواطن في النظام.
			</div>
		  ) : searchResult ? (
			<div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
			  <div className="flex justify-between items-center mb-2">
				<span className="text-[11px] font-extrabold text-slate-500">القطعة: {searchResult.house_number}</span>
				{searchResult.status === 'approved' 
				  ? <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">معتمد ✔</span>
				  : <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">مراجعة</span>
				}
			  </div>
			  <h4 className="text-sm font-black text-slate-900 mb-3">{searchResult.full_name}</h4>
			</div>
		  ) : (
			<div className="p-8 text-center text-slate-400 text-sm font-bold">أدخل رقم القطعة للبحث</div>
		  )}
		</div>
	  </div>

	  {/* Map Container */}
	  <div 
		ref={mapRef}
		onMouseDown={handleMouseDown}
		onMouseLeave={() => setIsDragging(false)}
		onMouseUp={() => setIsDragging(false)}
		onMouseMove={handleMouseMove}
		className={`flex-1 bg-slate-100 border border-slate-200 rounded-2xl overflow-auto relative z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
	  >
		<div className="absolute top-4 left-4 bg-slate-900/80 text-white px-4 py-2 rounded-full text-[11px] font-bold backdrop-blur-md z-20 shadow-md">
		  اسحب للتجول ✋ | إجمالي القطع: 2370 قطعة
		</div>
		
		{/* The Grid */}
		<div className="inline-grid grid-cols-[repeat(50,45px)] gap-1.5 p-10 bg-slate-100 min-w-max">
		  {Array.from({ length: 2370 }, (_, i) => i + 1).map((plotNum) => {
			const isRegistered = !!getResidentByPlot(plotNum);
			const isSelected = String(selectedPlot) === String(plotNum);
			
			// Plot typing logic from original HTML
			let col = ((plotNum - 1) % 50) + 1;
			let row = Math.floor((plotNum - 1) / 50) + 1;
			let blockCol = ((col - 1) % 10) + 1;
			let blockRow = ((row - 1) % 4) + 1;
			
			let isCorner = (blockCol === 1 || blockCol === 10) && (blockRow === 1 || blockRow === 4);
			
			let bgColor = '#5ba3d9'; // Residential
			if (isCorner) bgColor = '#e07b39'; // Commercial
			else if (plotNum % 65 === 0) bgColor = '#3db87a'; // Services
			else if (plotNum % 180 === 0) bgColor = '#c9a227'; // Government
			else if (plotNum % 250 === 0) bgColor = '#d4a843'; // Market

			if (isRegistered) bgColor = '#10B981';
			if (isSelected) bgColor = '#EF4444';

			// Street gaps
			const marginLeft = (blockCol === 10 && col !== 50) ? '20px' : '0';

			// Landmarks
			if (plotNum === 325) return <div key={plotNum} onClick={() => handlePlotClick(plotNum)} className="col-span-2 row-span-2 bg-[#2a9d5c] text-white flex items-center justify-center text-[10px] rounded-md border border-[#14532d] cursor-pointer hover:scale-105 transition-transform z-10 shadow-sm">🕌 مسجد</div>;
			if (plotNum === 1250) return <div key={plotNum} onClick={() => handlePlotClick(plotNum)} className="col-span-3 row-span-2 bg-[#3db87a] text-white flex items-center justify-center text-[10px] rounded-md border border-[#10b981] cursor-pointer hover:scale-105 transition-transform z-10 shadow-sm">🏫 مدرسة</div>;
			if (plotNum === 1880) return <div key={plotNum} onClick={() => handlePlotClick(plotNum)} className="col-span-3 row-span-2 bg-[#5ab75e] text-white flex items-center justify-center text-[10px] rounded-md border border-[#14532d] cursor-pointer hover:scale-105 transition-transform z-10 shadow-sm">🌳 حديقة</div>;

			// Street Dividers
			const streetDivider = (row % 4 === 1 && col === 1 && row > 1) 
			  ? <div key={`street-${row}`} className="col-span-[50] h-[30px] bg-slate-400 flex items-center justify-center text-white text-[10px] font-bold rounded-md shadow-inner my-1">شارع عرض 20 متر</div> 
			  : null;

			return (
			  <React.Fragment key={plotNum}>
				{streetDivider}
				<div 
				  onClick={() => handlePlotClick(plotNum)}
				  style={{ backgroundColor: bgColor, marginLeft }}
				  className={`w-[45px] h-[55px] text-white flex items-center justify-center text-[11px] font-extrabold rounded-[4px] border border-black/10 cursor-pointer transition-all select-none shadow-sm ${isSelected ? 'scale-125 z-20 shadow-lg ring-2 ring-red-300' : 'hover:scale-110 hover:z-10 hover:ring-2 hover:ring-blue-300'}`}
				>
				  {plotNum}
				</div>
			  </React.Fragment>
			);
		  })}
		</div>
	  </div>
	</div>
  );
}