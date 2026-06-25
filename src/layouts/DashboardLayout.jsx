import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  return (
	<div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-700" dir="rtl">
	  <Sidebar />
	  <main className="flex-1 flex flex-col overflow-hidden h-full">
		<Topbar />
		<div className="flex-1 overflow-y-auto p-6">
		  <Outlet />
		</div>
	  </main>
	</div>
  );
}