import React from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck,
  School
} from 'lucide-react';
import { SchoolInfo, Teacher, UserRole } from '../types';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTeacherId: string;
  setActiveTeacherId: (id: string) => void;
  teachers: Teacher[];
  conflictCount: number;
  onOpenNewScheduleModal: () => void;
  onOpenAutoSchedulerModal: () => void;
  onOpenConflictDrawer: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  userRole,
  setUserRole,
  activeTeacherId,
  setActiveTeacherId,
  teachers,
  conflictCount,
  onOpenNewScheduleModal,
  onOpenAutoSchedulerModal,
  onOpenConflictDrawer,
  onPrint,
  onExportExcel,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs no-print">
      {/* School Info Header */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <School className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm md:text-base font-bold text-slate-800 leading-tight">
            {schoolInfo.nameKh}
          </h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>{schoolInfo.province}</span>
            <span>•</span>
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
              ឆ្នាំសិក្សា {schoolInfo.academicYear}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-3">
        {/* Conflict Warning Indicator */}
        {conflictCount > 0 && (
          <button
            onClick={onOpenConflictDrawer}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition animate-pulse"
            title="មានការជាន់គ្នានៃម៉ោងបង្រៀន"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>ជាន់គ្នា ({conflictCount})</span>
          </button>
        )}

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setUserRole('admin')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
              userRole === 'admin'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>នាយកសាលា (Admin)</span>
          </button>

          <button
            onClick={() => {
              setUserRole('teacher');
              if (!activeTeacherId && teachers.length > 0) {
                setActiveTeacherId(teachers[0].id);
              }
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
              userRole === 'teacher'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>គ្រូបង្រៀន (Teacher)</span>
          </button>
        </div>

        {/* If Teacher Role active, select which teacher */}
        {userRole === 'teacher' && (
          <select
            value={activeTeacherId}
            onChange={(e) => setActiveTeacherId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {/* Quick action: Print */}
        <button
          onClick={onPrint}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          title="បោះពុម្ពកាលវិភាគ (Print)"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Quick action: Export Excel */}
        <button
          onClick={onExportExcel}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          title="នាំចេញជា Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Excel</span>
        </button>

        {/* Admin only actions */}
        {userRole === 'admin' && (
          <>
            <button
              onClick={onOpenAutoSchedulerModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
              title="រៀបចំកាលវិភាគស្វ័យប្រវត្តិ"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">រៀបចំស្វ័យប្រវត្តិ</span>
            </button>

            <button
              onClick={onOpenNewScheduleModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមម៉ោង</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
