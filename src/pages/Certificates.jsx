import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, Printer, FileCheck } from 'lucide-react';

export default function Certificates() {
  const { user, workspace } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [printing, setPrinting] = useState(false);
  const [certType, setCertType] = useState('residence');

  // Generate Reference Number
  useEffect(() => {
	const d = new Date();
	const ds = String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
	setRefNumber(`ANRC-${d.getFullYear()}-${ds}-${Math.floor(100 + Math.random() * 900)}`);
  }, []);

  // Live Search
  useEffect(() => {
	const searchResidents = async () => {
	  if (searchTerm.length < 2) {
		setSearchResults([]);
		return;
	  }
	  const { data } = await supabase
		.from('residents')
		.select('id, full_name, national_id, location, house_number')
		.eq('status', 'approved')
		.ilike('full_name', `%${searchTerm}%`)
		.limit(8);
	  
	  setSearchResults(data || []);
	};
	
	const timeoutId = setTimeout(searchResidents, 300);
	return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (resident) => {
	setSelectedResident(resident);
	setSearchTerm(resident.full_name);
	setSearchResults([]);
  };

  const handlePrint = async () => {
	if (!selectedResident) return alert('الرجاء اختيار مواطن أولاً');
	
	setPrinting(true);
	try {
	  // 1. Log to database
	  await supabase.from('certificates').insert({
		resident_id: selectedResident.id,
		ref_number: refNumber,
		created_by: user.id,
		workspace_id: workspace.id
	  });

	  // 2. Prepare Data
	  const cName = selectedResident.full_name;
	  const cNid = selectedResident.national_id;
	  const cLoc = `${workspace.name} - ${selectedResident.location}`;
	  const cHouse = selectedResident.house_number || '-';
	  const d = new Date();
	  const arDate = d.toLocaleDateString('ar-SD');
	  
	  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${cNid}&scale=3&includetext=false`;

	  // 3. Dynamic Text based on Certificate Type
	  const titleAr = certType === 'residence' ? 'شهادة سكن' : certType === 'recommendation' ? 'شهادة تزكية' : 'شهادة إثبات وفاة';
	  const titleEn = certType === 'residence' ? 'RESIDENCE CERTIFICATE' : certType === 'recommendation' ? 'RECOMMENDATION CERTIFICATE' : 'DEATH CERTIFICATE';
	  
	  const statementText = certType === 'residence' 
		? `تشهد لجنة خدمات ${workspace.name} السكنية، بأن المواطن المذكور بياناته أدناه، هو من سكان المدينة الفعليين ومقيد في السجل المدني والإحصائي للجنة.`
		: certType === 'recommendation'
		? `تشهد لجنة خدمات ${workspace.name} السكنية، بأن المواطن المذكور بياناته أدناه، حسن السير والسلوك، ونتزكيه للجهات الرسمية المعنية.`
		: `تشهد لجنة خدمات ${workspace.name} السكنية، بناءً على السجلات الرسمية والإفادات المعتمدة، بوفاة المواطن المذكور بياناته أدناه.`;

	  // 4. Print HTML Template (Matching the legacy official layout)
	  const printHTML = `
		<html dir="rtl" lang="ar">
		<head>
		  <title>${titleAr} - ${cName}</title>
		  <style>
			@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@600;800&display=swap'); 
			@page{size:A4 portrait;margin:0} 
			body{font-family:'Cairo',sans-serif;margin:0;padding:0;background:#fff;color:#0F172A;box-sizing:border-box} 
			.cert-container{width:210mm;height:297mm;padding:20mm;box-sizing:border-box;position:relative} 
			.header{display:flex;justify-content:space-between;align-items:center;background:#0F172A;padding:20px;color:white;}
			.header img {width:50px; height:50px; object-fit:contain;}
			.red-bar {height:5px; background:#DC2626; margin-bottom:40px;}
			.title-section{text-align:center;margin-bottom:30px} 
			.title-ar{font-family:'Amiri',serif;font-size:42px;font-weight:700;margin:0;} 
			.title-en{font-size:16px;letter-spacing:3px;color:#64748B;margin-top:-5px;font-family:sans-serif} 
			.statement{font-size:22px;line-height:2.2;text-align:justify;margin-bottom:40px;font-weight:600;} 
			table{width:100%;border-collapse:collapse;margin-bottom:40px;border:2px solid #1E293B;} 
			td{padding:16px;font-size:18px;border:1px solid #1E293B;} 
			.bg-gray{background-color:#F1F5F9;font-weight:800;width:25%;} 
			.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:50px;} 
			.signature-box{text-align:center;font-weight:800;font-size:18px;width:200px} 
			.signature-line{border-top:2px dotted #475569;margin-top:50px;width:100%}
			.barcode-section{text-align:center;}
		  </style>
		</head>
		<body>
		  <div class="cert-container">
			<div class="header">
			  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo">
			  <div style="text-align:center;">
				<div style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.7);">جمهورية السودان — ولاية الخرطوم</div>
				<div style="font-size:22px; font-weight:800; margin:4px 0;">${titleAr}</div>
				<div style="font-family:monospace; font-size:12px; color:rgba(255,255,255,0.5);">REF: ${refNumber}</div>
			  </div>
			  <img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/sudan.svg.png" style="opacity:0.8;">
			</div>
			<div class="red-bar"></div>
			
			<div class="title-section">
			  <h1 class="title-ar">${titleAr}</h1>
			  <div class="title-en">${titleEn}</div>
			</div>
			
			<div class="statement">بسم الله الرحمن الرحيم<br>${statementText}</div>
			
			<table>
			  <tr><td class="bg-gray">الاسم الرباعي:</td><td style="font-weight:bold;">${cName}</td></tr>
			  <tr><td class="bg-gray">الرقم الوطني:</td><td style="font-family:monospace; font-weight:bold; letter-spacing:2px;">${cNid}</td></tr>
			  <tr><td class="bg-gray">الموقع والقطعة:</td><td>${cLoc} · ق ${cHouse}</td></tr>
			  <tr><td class="bg-gray">تاريخ الإصدار:</td><td>${arDate}</td></tr>
			</table>
			
			<div class="footer">
			  <div class="signature-box">السكرتير<div class="signature-line"></div></div>
			  <div class="barcode-section">
				<img src="${barcodeUrl}" style="height:50px;"><br>
				<span style="font-family:monospace; font-weight:bold; letter-spacing:2px; font-size:14px;">${cNid}</span>
			  </div>
			  <div class="signature-box">رئيس اللجنة<div class="signature-line"></div></div>
			</div>
		  </div>
		</body>
		</html>
	  `;

	  // Print via invisible iframe
	  const iframe = document.createElement('iframe');
	  iframe.style.cssText = 'position:fixed;right:-9999px;bottom:-9999px;width:0;height:0;';
	  document.body.appendChild(iframe);
	  const doc = iframe.contentWindow.document;
	  doc.open(); doc.write(printHTML); doc.close();

	  setTimeout(() => {
		iframe.contentWindow.focus();
		iframe.contentWindow.print();
		setTimeout(() => document.body.removeChild(iframe), 2000);
		setPrinting(false);
	  }, 1000);

	} catch (error) {
	  console.error(error);
	  alert('حدث خطأ أثناء حفظ الشهادة.');
	  setPrinting(false);
	}
  };

  const displayTitle = certType === 'residence' ? 'شهادة سكن' : certType === 'recommendation' ? 'شهادة تزكية' : 'شهادة إثبات وفاة';

  return (
	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full font-['Tajawal']" dir="rtl">
	  
	  {/* Search & Action Panel */}
	  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
		<div className="flex items-center gap-3 mb-2">
		  <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center text-amber-500">
			<FileCheck size={20} />
		  </div>
		  <h3 className="text-xl font-black text-slate-900">إصدار الشهادات الرسمية</h3>
		</div>
		<p className="text-sm text-slate-500 mb-8">
		  اختر نوع الشهادة وابحث عن المواطن لتوليد وثيقة رسمية معتمدة من إدارة {workspace?.name}.
		</p>

		<div className="mb-5">
		  <label className="block text-sm font-bold text-slate-600 mb-2">نوع الشهادة</label>
		  <select 
			value={certType}
			onChange={(e) => setCertType(e.target.value)}
			className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-sm outline-none focus:border-red-500 focus:bg-white transition-all font-bold"
		  >
			<option value="residence">شهادة سكن</option>
			<option value="recommendation">شهادة تزكية</option>
			<option value="death">شهادة إثبات وفاة</option>
		  </select>
		</div>

		<div className="relative mb-6">
		  <label className="block text-sm font-bold text-slate-600 mb-2">ابحث بالاسم أو الرقم الوطني</label>
		  <div className="relative">
			<Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
			<input 
			  type="text" 
			  value={searchTerm}
			  onChange={(e) => setSearchTerm(e.target.value)}
			  placeholder="ابدأ الكتابة..." 
			  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-red-500 focus:bg-white transition-all"
			/>
			{searchResults.length > 0 && (
			  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
				{searchResults.map((res) => (
				  <li 
					key={res.id} 
					onClick={() => handleSelect(res)}
					className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer flex justify-between items-center"
				  >
					<span className="font-bold text-slate-900 text-sm">{res.full_name}</span>
					<span className="font-['IBM_Plex_Mono'] text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{res.national_id}</span>
				  </li>
				))}
			  </ul>
			)}
		  </div>
		</div>

		<button 
		  onClick={handlePrint}
		  disabled={!selectedResident || printing}
		  className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
		>
		  {printing ? 'جاري التجهيز للطباعة...' : <><Printer size={18} /> اعتماد وطباعة الوثيقة الرسمية</>}
		</button>
	  </div>

	  {/* Official Document Preview Panel */}
	  <div className="flex flex-col items-center">
		<div className="w-full max-w-[420px] bg-white border-2 border-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col">
		  {/* Header */}
		  <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
			<img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" className="w-10 h-10 object-contain bg-white/10 p-1 rounded" alt="Logo" />
			<div className="text-center flex-1 mx-2">
			  <div className="text-[10px] font-bold text-white/60">جمهورية السودان — {workspace?.name}</div>
			  <div className="text-lg font-black mt-0.5">{displayTitle}</div>
			  <div className="text-[9px] font-['IBM_Plex_Mono'] text-white/40 mt-1 tracking-widest">REF: {refNumber}</div>
			</div>
			<img src="https://flagcdn.com/w40/sd.png" className="w-8 h-5 object-cover opacity-80 rounded-sm" alt="Flag" />
		  </div>
		  
		  <div className="h-1 bg-red-600 w-full" />

		  {/* Body */}
		  <div className="p-6 flex-1 flex flex-col">
			<div className="text-xs font-bold text-slate-700 leading-relaxed border-b border-dashed border-slate-300 pb-4 mb-4 text-justify">
			  بسم الله الرحمن الرحيم<br/>
			  نشهد نحن في إدارة {workspace?.name}، <strong className="text-slate-900">بأن حامل هذه الوثيقة</strong> مسجل بصورة رسمية في السجلات المعتمدة.
			</div>

			<div className="space-y-3">
			  <div className="flex justify-between border-b border-slate-100 pb-2">
				<span className="text-xs font-bold text-slate-500">الاسم الرباعي</span>
				<span className="text-xs font-black text-slate-900">{selectedResident?.full_name || '—'}</span>
			  </div>
			  <div className="flex justify-between border-b border-slate-100 pb-2">
				<span className="text-xs font-bold text-slate-500">الرقم الوطني</span>
				<span className="text-[11px] font-bold text-slate-700 font-['IBM_Plex_Mono'] tracking-wider">{selectedResident?.national_id || '—'}</span>
			  </div>
			  <div className="flex justify-between border-b border-slate-100 pb-2">
				<span className="text-xs font-bold text-slate-500">تاريخ الإصدار</span>
				<span className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('ar-SD')}</span>
			  </div>
			</div>

			<div className="mt-auto pt-6 flex justify-between items-end">
			  <div className="text-center">
				<div className="w-20 border-t border-slate-400 mb-1 mx-auto" />
				<div className="text-[9px] font-bold text-slate-500">توقيع السكرتير</div>
			  </div>
			  <div className="w-12 h-12 border border-red-500 rounded-full flex items-center justify-center opacity-30">
				<FileCheck size={20} className="text-red-500" />
			  </div>
			  <div className="text-center">
				<div className="w-20 border-t border-slate-400 mb-1 mx-auto" />
				<div className="text-[9px] font-bold text-slate-500">توقيع الإدارة</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>

	</div>
  );
}