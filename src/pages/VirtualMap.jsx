import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Map as MapIcon, AlertCircle } from 'lucide-react';

export default function VirtualMap() {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [svgError, setSvgError] = useState(false);
  
  const mapContainerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // 1. Fetch Residents Data
  useEffect(() => {
	const fetchResidents = async () => {
	  const { data } = await supabase.from('residents').select('id, full_name, house_number, status, profession');
	  if (data) setResidents(data);
	};
	fetchResidents();
  }, []);

  // 2. Fetch the custom SVG Map from the public folder
  useEffect(() => {
	const loadSvg = async () => {
	  try {
		const response = await fetch('/map.svg'); // Must be placed in the public/ folder
		if (!response.ok) throw new Error('SVG not found');
		const text = await response.text();
		setSvgContent(text);
	  } catch (err) {
		setSvgError(true);
	  }
	};
	loadSvg();
  }, []);

  // 3. Map Panning Logic (Mouse & Touch)
  const handleMouseDown = (e) => {
	isDragging.current = true;
	dragStart.current = {
	  x: e.pageX || e.touches?.[0].pageX,
	  y: e.pageY || e.touches?.[0].pageY,
	  scrollLeft: mapContainerRef.current.scrollLeft,
	  scrollTop: mapContainerRef.current.scrollTop
	};
  };

  const handleMouseMove = (e) => {
	if (!isDragging.current) return;
	e.preventDefault();
	const x = e.pageX || e.touches?.[0].pageX;
	const y = e.pageY || e.touches?.[0].pageY;
	mapContainerRef.current.scrollLeft = dragStart.current.scrollLeft - (x - dragStart.current.x);
	mapContainerRef.current.scrollTop = dragStart.current.scrollTop - (y - dragStart.current.y);
  };

  const handleMouseUp = () => { isDragging.current = false; };

  // 4. SVG Click Handling (Event Delegation)
  const handleSvgClick = (e) => {
	const target = e.target;
	let plotNumber = target.id || target.parentElement?.id;
	
	// Attempt to extract plot number from text nodes if ID fails
	if (!plotNumber && target.tagName === 'text') plotNumber = target.textContent.trim();
	else if (!plotNumber && target.parentElement?.tagName === 'g') {
	  const textNode = target.parentElement.querySelector('text');
	  if (textNode) plotNumber = textNode.textContent.trim();
	}

	if (plotNumber) {
	  // Clean up plot string (e.g. if ID is "plot-145", make it "145")
	  const numOnly = plotNumber.replace(/\D/g, ''); 
	  if (numOnly) {
		setSearchQuery(numOnly);
		searchPlot(numOnly);
	  }
	}
  };

  // 5. Search Logic & SVG Highlighting
  const searchPlot = (term) => {
	if (!mapContainerRef.current) return;

	// Remove previous highlights
	const prevHighlights = mapContainerRef.current.querySelectorAll('.highlighted-plot');
	prevHighlights.forEach(el => el.classList.remove('highlighted-plot'));

	if (!term) {
	  setSearchResult(null);
	  return;
	}

	// Find in database
	const matches = residents.filter(r => r.house_number && String(r.house_number).includes(term));
	setSearchResult(matches.length > 0 ? matches : 'not_found');

	// Highlight in SVG: Assumes SVG paths/rects have IDs matching the plot number (e.g. id="145" or id="plot-145")
	// Or we look for a text element containing the number and highlight its sibling path
	const svgEl = mapContainerRef.current.querySelector('svg');
	if (svgEl) {
	  let targetEl = svgEl.getElementById(term) || svgEl.getElementById(`plot-${term}`);
	  
	  if (!targetEl) {
		// Fallback: search text nodes
		const texts = Array.from(svgEl.querySelectorAll('text'));
		const matchingText = texts.find(t => t.textContent.trim() === term);
		if (matchingText && matchingText.parentElement) {
		  targetEl = matchingText.parentElement.querySelector('path, rect, polygon');
		}
	  }

	  if (targetEl) {
		// If target is a group, highlight its shapes
		if (targetEl.tagName === 'g') {
		  const shape = targetEl.querySelector('path, rect, polygon');
		  if (shape) shape.classList.add('highlighted-plot');
		} else {
		  targetEl.classList.add('highlighted-plot');
		}
		
		// Scroll into view
		targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
	  }
	}
  };

  return (
	<div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-108px)] font-['Tajawal']" dir="rtl">
	  
	  {/* Internal CSS for SVG highlighting */}
	  <style>{`
		.highlighted-plot { 
		  fill: rgba(220, 38, 38, 0.45) !important; 
		  stroke: #DC2626 !important; 
		  stroke-width: 2px !important; 
		}
		#interactive-svg-wrapper svg {
		  width: 100%;
		  min-width: 800px;
		  height: auto;
		}
		#interactive-svg-wrapper path, 
		#interactive-svg-wrapper rect, 
		#interactive-svg-wrapper polygon {
		  cursor: pointer;
		  transition: fill 0.2s, stroke 0.2s;
		}
		#interactive-svg-wrapper path:hover, 
		#interactive-svg-wrapper rect:hover, 
		#interactive-svg-wrapper polygon:hover {
		  fill: rgba(59, 130, 246, 0.3) !important;
		  stroke: #3B82F6 !important;
		}
	  `}</style>

	  {/* Map Container */}
	  <div 
		ref={mapContainerRef}
		onMouseDown={handleMouseDown}
		onMouseLeave={handleMouseUp}
		onMouseUp={handleMouseUp}
		onMouseMove={handleMouseMove}
		onTouchStart={handleMouseDown}
		onTouchEnd={handleMouseUp}
		onTouchMove={handleMouseMove}
		className="flex-1 bg-slate-900 border border-slate-200 rounded-2xl overflow-auto relative cursor-grab active:cursor-grabbing shadow-inner"
	  >
		<div className="absolute top-4 right-4 bg-slate-800/90 text-white px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-md z-20 border border-slate-700">
		  اسحب للتجول ✋ · اضغط على القطعة للبحث
		</div>
		
		<div 
		  id="interactive-svg-wrapper"
		  className="min-h-full flex items-center justify-center p-10 min-w-max"
		  onClick={handleSvgClick}
		>
		  {svgError ? (
			<div className="text-center text-slate-400 bg-slate-800 p-8 rounded-xl border border-slate-700">
			  <MapIcon size={48} className="mx-auto mb-4 opacity-50" />
			  <p className="font-bold mb-1">ملف الخريطة غير متاح</p>
			  <p className="text-xs">يرجى التأكد من رفع ملف <span className="font-['IBM_Plex_Mono'] text-amber-400">map.svg</span> في مجلد <span className="font-['IBM_Plex_Mono'] text-amber-400">public/</span> الخاص بالمشروع.</p>
			</div>
		  ) : !svgContent ? (
			<div className="text-slate-400 font-bold text-sm">جاري تحميل المخطط الجغرافي...</div>
		  ) : (
			<div dangerouslySetInnerHTML={{ __html: svgContent }} />
		  )}
		</div>
	  </div>

	  {/* Sidebar Controls */}
	  <div className="w-full lg:w-[320px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm shrink-0 overflow-hidden z-10">
		<div className="p-5 border-b border-slate-200 bg-slate-50">
		  <h3 className="text-base font-black text-slate-900 mb-1">الربط الجغرافي (GIS)</h3>
		  <p className="text-[11px] text-slate-500">ابحث برقم القطعة أو اضغط عليها في الخريطة.</p>
		</div>

		<div className="p-5 overflow-y-auto flex-1 bg-white">
		  <div className="relative mb-6">
			<Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
			<input 
			  type="text" 
			  value={searchQuery}
			  onChange={(e) => {
				setSearchQuery(e.target.value);
				searchPlot(e.target.value);
			  }}
			  placeholder="رقم القطعة..." 
			  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
			/>
		  </div>

		  <div id="map-search-result">
			{!searchQuery ? (
			  <div className="text-center text-slate-400 py-10">
				<MapIcon size={32} className="mx-auto mb-3 opacity-30" />
				<p className="text-sm font-bold">أدخل رقم القطعة للبحث</p>
			  </div>
			) : searchResult === 'not_found' ? (
			  <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-500">
				<AlertCircle size={28} className="mx-auto mb-2 opacity-80" />
				<p className="text-sm font-bold">هذه القطعة غير مسجلة لأي مواطن في النظام.</p>
			  </div>
			) : searchResult ? (
			  searchResult.map(m => (
				<div key={m.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-3 hover:border-blue-300 transition-colors">
				  <div className="flex justify-between items-center mb-2">
					<span className="text-[11px] font-extrabold text-slate-500">القطعة: <span className="text-slate-900 font-['IBM_Plex_Mono']">{m.house_number}</span></span>
					{m.status === 'approved' 
					  ? <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">معتمد ✔</span>
					  : <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">مراجعة</span>
					}
				  </div>
				  <h4 className="text-sm font-black text-slate-900 mb-1">{m.full_name}</h4>
				  <p className="text-[11px] font-bold text-slate-500 mb-3">{m.profession || '—'}</p>
				</div>
			  ))
			) : null}
		  </div>
		</div>
	  </div>

	</div>
  );
}