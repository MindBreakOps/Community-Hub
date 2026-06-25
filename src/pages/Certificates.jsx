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

  // Generate a new reference number when the page loads
  useEffect(() => {
	const d = new Date();
	const ds = String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
	setRefNumber(`HC-${d.getFullYear()}-${ds}-${Math.floor(100 + Math.random() * 900)}`);
  }, []);

  // Search logic
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
		.limit(10);
	  
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
	  // Log the certificate generation to Supabase
	  await supabase.from('certificates').insert({
		resident_id: selectedResident.id,
		ref_number: refNumber,
		created_by: user.id,
		workspace_id: workspace.id
	  });

	  // Construct Print HTML
	  const cName = selectedResident.full_name;
	  const cNid = selectedResident.national_id;
	  const cLoc = `${workspace.name} - ${selectedResident.location}`;
	  const cHouse = selectedResident.house_number || '-';
	  const d = new Date();
	  const arDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
	  
	  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${cNid}&scale=3&includetext=false`;

	  const printHTML = `
		<html dir="rtl" lang="ar">
		<head>
		  <title>شهادة سكن - ${cName}</title>
		  <style>
			@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@600;800&display=swap'); 
			@page{size:A4 portrait;margin:0} 
			body{font-family:'Cairo',sans-serif;margin:0;padding:0;background:#fff;color:#1a202c;box-sizing:border-box} 
			.cert-container{width:210mm;height:297mm;padding:20mm;box-sizing:border-box;position:relative} 
			.border-outer{position:absolute;top:12mm;left:12mm;right:12mm;bottom:12mm;border:4px solid #b08d55;border-radius:4px} 
			.border-inner{position:absolute;top:14mm;left:14mm;right:14mm;bottom:14mm;border:1.5px solid #1c3c66;border-radius:2px} 
			.content-wrapper{position:relative;z-index:10;display:flex;flex-direction:column;height:100%} 
			.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #b08d55;padding-bottom:15px;margin-bottom:30px} 
			.header-text{line-height:1.6;font-size:16px;font-weight:800;text-align:right} 
			.title-section{text-align:center;margin-bottom:30px} 
			.title-ar{font-family:'Amiri',serif;font-size:48px;font-weight:700;margin:0;color:#0f172a} 
			.title-en{font-size:18px;letter-spacing:2px;color:#475569;margin-top:-10px;font-family:sans-serif} 
			.statement{font-size:20px;line-height:2.2;text-align:justify;margin-bottom:40px;font-weight:600;} 
			table{width:100%;border-collapse:collapse;margin-bottom:40px;border:2px solid #1c3c66;border-radius:8px;} 
			td{padding:16px;font-size:18px;border:1px solid #1c3c66;} 
			.bg-gray{background-color:#f1f5f9;font-weight:800;width:25%;} 
			.en-text{font-family:sans-serif;font-weight:bold}
			.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:20px} 
			.signature-box{text-align:center;font-weight:800;font-size:18px;width:200px} 
			.signature-line{border-top:2px dotted #475569;margin-top:50px;width:100%}
		  </style>
		</head>
		<body>
		  <div class="cert-container">
			<div class="border-outer"></div><div class="border-inner"></div>
			<div class="content-wrapper">
			  <div class="header">
				<div class="header-text">إدارة النظام الموحد<br>${workspace.name}<br>لجنة الخدمات السكنية</div>
			  </div>
			  <div class="title-section">
				<h1 class="title-ar">شهادة سكن</h1>
				<div class="title-en">RESIDENCE CERTIFICATE</div>
			  </div>
			  <div class="statement">تشهد لجنة خدمات ${workspace.name}، بأن المواطن المذكور بياناته أدناه، هو من سكان المدينة الفعليين ومقيد في السجل المدني والإحصائي للجنة.</div>
			  <table>
				<tr><td class="bg-gray">الاسم الرباعي:</td><td>${cName}</td></tr>
				<tr><td class="bg-gray">الرقم الوطني:</td><td class="en-text" style="letter-spacing:2px;">${cNid}</td></tr>
				<tr><td class="bg-gray">المنطقة السكنية:</td><td>${cLoc}</td></tr>
				<tr><td class="bg-gray">رقم المنزل / القطعة:</td><td>${cHouse} <br><span class="en-text" style="font-size:12px;color:#666;">Ref No: ${refNumber}</span></td></tr>
				<tr><td class="bg-gray">تاريخ الإصدار:</td><td>${arDate}</td></tr>
			  </table>
			  <div class="footer">
				<div class="signature-box">توقيع مسئول الإحصاء<div class="signature-line"></div></div>
				<div style="text-align:center;"><img src="${barcodeUrl}" style="height:50px;"><br><span class="en-text">${cNid}</span></div>
				<div class="signature-box">توقيع رئيس اللجنة<div class="signature-line"></div></div>
			  </div>
			</div>
		  </div>
		</body>
		</html>
	  `;

	  // Iframe print strategy
	  const iframe = document.createElement('iframe');
	  iframe.style.cssText = 'position:fixed;right:-9999px;bottom:-9999px;width:0;height:0;';
	  document.body.appendChild(iframe);
	  const doc = iframe.contentWindow.document;
	  doc.open();
	  doc.write(printHTML);
	  doc.close();

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

  return (
	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full font-['Tajawal']" dir="rtl">
	  
	  {/* Search & Action Panel */}
	  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
		<div className="flex items-center gap-3 mb-2">
		  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
			<FileCheck size={20} />
		  </div>
		  <h3 className="text-xl font-black text-slate-900">إصدار شهادة سكن</h3>
		</div>
		<p className="text-sm text-slate-500 mb-8 leading-relaxed">
		  ابحث عن المواطن واختره لتوليد شهادة إثبات سكن معتمدة باسم ({workspace?.name}).
		</p>

		<div className="relative mb-6">
		  <label className="block text-sm font-bold text-slate-600 mb-2">ابحث بالاسم أو الرقم الوطني</label>
		  <div className="relative">
			<Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
			<input 
			  type="text" 
			  value={searchTerm}
			  onChange={(e) => setSearchTerm(e.target.value)}
			  placeholder="ابدأ الكتابة..." 
			  className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
			/>
			
			{/* Autocomplete Dropdown */}
			{searchResults.length > 0 && (
			  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
				{searchResults.map((res) => (
				  <li 
					key={res.id} 
					onClick={() => handleSelect(res)}
					className="px-4 py-3 hover:bg-red-50 border-b border-slate-100 last:border-0 cursor-pointer flex justify-between items-center transition-colors"
				  >
					<span className="font-bold text-slate-900 text-sm">{res.full_name}</span>
					<span className="font-['IBM_Plex_Mono'] text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
					  {res.national_id}
					</span>
				  </li>
				))}
			  </ul>
			)}
		  </div>
		</div>

		<button 
		  onClick={handlePrint}
		  disabled={!selectedResident || printing}
		  className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-red-500 to-red-800 text-white rounded-lg text-sm font-bold shadow-md hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		>
		  {printing ? 'جاري التجهيز للطباعة...' : (
			<>
			  <Printer size={18} />
			  اعتماد وطباعة الوثيقة
			</>
		  )}
		</button>
	  </div>

	  {/* Preview Panel */}
	  <div className="flex flex-col">
		<div className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 font-['IBM_Plex_Mono']">
		  معاينة الشهادة
		</div>
		
		<div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-md flex-1 relative overflow-hidden">
		  {/* Watermark/Background texture */}
		  <div className="absolute right-[-20%] bottom-[-20%] opacity-5 pointer-events-none">
			<img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="watermark" className="w-96 h-96 grayscale" />
		  </div>

		  <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5 mb-6 relative z-10">
			<div>
			  <div className="text-2xl font-black text-slate-900">شهادة سكن</div>
			  <div className="font-['IBM_Plex_Mono'] text-xs text-slate-500 mt-1">{refNumber}</div>
			</div>
			<img src="https://raw.githubusercontent.com/MindBreakOps/LX-Permits/main/nas.png" alt="Logo" className="w-12 h-12 object-contain opacity-70" />
		  </div>

		  <div className="space-y-1 relative z-10">
			<div className="flex justify-between py-3 border-b border-slate-100">
			  <span className="text-sm font-bold text-slate-500">الاسم الرباعي</span>
			  <span className="text-sm font-extrabold text-slate-900">{selectedResident ? selectedResident.full_name : '—'}</span>
			</div>
			<div className="flex justify-between py-3 border-b border-slate-100">
			  <span className="text-sm font-bold text-slate-500">الرقم الوطني</span>
			  <span className="text-sm font-bold text-slate-700 font-['IBM_Plex_Mono'] tracking-wider">{selectedResident ? selectedResident.national_id : '—'}</span>
			</div>
			<div className="flex justify-between py-3 border-b border-slate-100">
			  <span className="text-sm font-bold text-slate-500">تاريخ الإصدار</span>
			  <span className="text-sm font-extrabold text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
			</div>
		  </div>
		</div>
	  </div>

	</div>
  );
}